from django.urls import path
import chat.views.general as general_views
import chat.views.chat as chat_views

urlpatterns = [
    path("retrieve/",general_views.RetrieveChunksView.as_view(),name="retrieve-chunks"),
    path("generate_timeline/", general_views.CreateTimelineAPIView.as_view(),name="generate-timeline"),
    path("generate_diagram/", general_views.CreateDiagramAPIView.as_view(),name="generate-diagram"),
    path("generate_chart/",general_views.GenerateDiagramAPIView.as_view(),name="generate-diagram"),

    path("generate_quiz/", general_views.CreateQuizAPIView.as_view(),name="generate-quiz"),
    path("evaluate_answers/",general_views.EvaluateAnswersAPIView.as_view(),name="evaluate-answers"),

    path("start_session/",chat_views.StartSessionAPIView.as_view(),name="start-session"),
    path("message/",chat_views.ChatMessageAPIView.as_view(),name="chat-message"),
]