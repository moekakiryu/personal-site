from django.urls import path

from . import views

urlpatterns = [
    path('', views.home, name="root.home"),
    path('blog/<uuid:article_id>/', views.blog, name="root.blog.entry"),
    path("sandbox/", views.sandbox, name="root.sandbox"),
]