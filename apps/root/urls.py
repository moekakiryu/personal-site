from django.urls import path

from core.context_processors.meta import url_meta

from . import views

urlpatterns = [
    path('', views.home, name="root.home",
        kwargs=url_meta(display_name='Raymond Lewandowski')
    ),

    path('projects/', views.projects, name="root.projects",
        kwargs=url_meta(display_name='Projects')
    ),

    path('articles/', views.articles, name="root.articles",
        kwargs=url_meta(display_name='Articles')
    ),

    path('articles/<uuid:article_id>/', views.article, name="root.article"),
    path('projects/<uuid:project_id>/', views.project, name="root.project"),

    path("sandbox/", views.sandbox, name="root.sandbox"),
]