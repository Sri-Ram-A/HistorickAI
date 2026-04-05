from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from drf_spectacular.utils import extend_schema
from django.shortcuts import get_object_or_404
from django.db import transaction
from loguru import logger

from folders.models import Folder
from chat.models import Notebook, Message
from vector.client import vector_store
from chat.llm import generate


# ──────────────────────────────────────────────
# Helper functions
# ──────────────────────────────────────────────

def get_notebook_for_folder(folder: Folder) -> Notebook:
    """
    Return the existing Notebook for this folder,
    or create one if it does not yet exist.
    """
    with transaction.atomic():
        notebook, created = Notebook.objects.get_or_create(
            folder=folder,
            defaults={"title": f"Notebook — {folder.name}"},
        )
        if created:
            logger.info("Created new notebook %s for folder %s", notebook.id, folder.id)
        return notebook

def retrieve_context_for_query(user_id: str, folder_id: str, query: str) -> str:
    """
    Query the vector store and return the top-k chunks joined as a single
    context string.  Returns an empty string when nothing is found so that
    the caller can decide how to handle it.
    """
    results = vector_store.query(
        user_id=user_id,
        folder_id=folder_id,
        query=query,
        k=1,
    )
    documents = results.get("documents", [[]])
    chunks = documents[0] if documents else []
    logger.debug(f"Retrieved {len(chunks)} chunks for query")
    return "\n".join(chunks)


def build_refined_prompt(context: str) -> str:
    """
    Combine the base system instruction with the retrieved context.
    Keeping this as a separate function makes it easy to extend later
    (e.g. add persona, language, tone constraints).
    """
    refined_prompt = (
        "You are a helpful assistant. "
        "Answer the user's question using ONLY the context provided below. "
        "If the context does not contain enough information, say so honestly.\n\n"
        f"Context:\n{context}"
    )
    return refined_prompt


def store_messages_to_database(notebook: Notebook, user_query: str, assistant_answer: str) -> None:
    """
    Persist the user message and the assistant reply in one bulk insert.
    Isolated here so it can later be handed off to a Celery task with
    minimal changes (just call delay() instead of calling this directly).
    """
    Message.objects.bulk_create([
        Message(notebook=notebook, role="user",      content=user_query),
        Message(notebook=notebook, role="assistant", content=assistant_answer),
    ])
    logger.debug(f"Stored 2 messages for notebook {notebook.id}")


# ──────────────────────────────────────────────
# View
# ──────────────────────────────────────────────

class ChatAPIView(APIView):

    @extend_schema(tags=["Chat"], summary="RAG chat — send a message")
    def post(self, request):
        logger.debug("POST body received: %s", request.data)
        user = request.user
        folder_id = request.data.get("folder_id")
        query = request.data.get("query", "").strip()

        if not folder_id or not query:
            return Response(
                {"error": "Both 'folder_id' and 'query' are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        folder = get_object_or_404(Folder, id=folder_id, owner=user)
        notebook = get_notebook_for_folder(folder)

        context = retrieve_context_for_query(
            user_id=str(user.id),
            folder_id=str(folder.id),
            query=query,
        )

        if not context:
            logger.warning("No context found for folder %s", folder.id)
            return Response(
                {"error": "No relevant content found in this folder."},
                status=status.HTTP_404_NOT_FOUND,
            )

        refined_prompt = build_refined_prompt(context)
        answer = generate(system_instruction=refined_prompt, query=query)
        logger.info("Answer generated for notebook %s", notebook.id)

        store_messages_to_database(notebook, query, answer)

        return Response(
            {
                "answer": answer,
                "notebook_id": str(notebook.id),
            },
            status=status.HTTP_200_OK,
        )

    @extend_schema(tags=["Chat"], summary="Fetch conversation history for a folder")
    def get(self, request):
        user = request.user
        folder_id = request.query_params.get("folder_id")

        if not folder_id:
            return Response(
                {"error": "'folder_id' query parameter is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        notebook = Notebook.objects.filter(
            folder_id=folder_id,
            folder__owner=user,
        ).first()

        if not notebook:
            return Response([], status=status.HTTP_200_OK)

        messages = (
            Message.objects.filter(notebook=notebook)
            .order_by("created_at")
            .values("role", "content", "created_at")
        )

        history = [
            {
                "role": message["role"],
                "content": message["content"],
                "created_at": message["created_at"].isoformat(),
            }
            for message in messages
        ]

        return Response(history, status=status.HTTP_200_OK)

