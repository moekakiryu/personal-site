from django.urls import path

from core.context_processors.meta import url_meta

from . import views

urlpatterns = [
    path('', views.home, name="www.home",
        kwargs=url_meta(display_name='Raymond Lewandowski')
    ),

    path('projects/', views.projects, name="www.projects",
        kwargs=url_meta(display_name='Projects')
    ),
    path('articles/', views.articles, name="www.articles",
        kwargs=url_meta(display_name='Articles')
    ),

    path("resume/", views.resume, name="www.resume",
         kwargs=url_meta(display_name='Professional Experience')
    ),

    path('articles/<uuid:article_id>/', views.article, name="www.article"),
    path('projects/<uuid:project_id>/', views.project, name="www.project"),
]