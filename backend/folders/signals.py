from loguru import logger
from django.db.models.signals import post_save, pre_delete
from django.dispatch import receiver

from folders.models import File
from vector.client import vector_store


@receiver(post_save, sender=File)
def handle_file_upload(sender, instance: File, created: bool, **kwargs) -> None:
    """
    Trigger the RAG pipeline whenever a new File is created.
    Uses select_related to load folder + owner in one query, so
    vector_store.process_and_index() runs with zero extra DB hits.
    """
    if not created:
        return
    file = File.objects.select_related("folder", "folder__owner").get(pk=instance.pk)

    vector_store.process_and_index(
        file_path=file.file.path,
        file_id=str(file.id),
        user_id=str(file.folder.owner_id),
        folder_id=str(file.folder_id),
    )

    # Mark processed in a single targeted UPDATE
    File.objects.filter(pk=file.pk).update(processed=True)
    logger.debug(f"File {file.id} marked as processed after indexing")


@receiver(pre_delete, sender=File)
def handle_file_delete(sender, instance: File, **kwargs) -> None:
    """
    Remove all Chroma embeddings for a file before it is deleted from the DB.
    We use pre_delete (not post_delete) so the instance still exists and
    we can safely read its folder FK values without extra queries.
    pre_delete gives us the object before it's gone; post_delete is too late
    if we needed to query related data — here owner_id/folder_id are direct
    fields on the instance so either would work, but pre_delete is the
    safer convention for cleanup tasks.
    """
    if not instance.processed:
        # File was never indexed — nothing to clean up in Chroma.
        return

    vector_store.delete_file_embeddings(
        user_id=str(instance.folder.owner_id),
        file_id=str(instance.id),
    )
    logger.debug(f"File {instance.id} embeddings deleted from Chroma")
