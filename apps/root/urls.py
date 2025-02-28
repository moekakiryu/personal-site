from django.urls import path

from . import views

urlpatterns = [
    path('', views.home, name="root.home"),
    path('articles/<uuid:article_id>/', views.article, name="root.article"),
    path("sandbox/", views.sandbox, name="root.sandbox"),
]