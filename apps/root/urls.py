from django.urls import path

from . import views

urlpatterns = [
    path('', views.home, name="root.home"),
    path("sandbox/", views.sandbox, name="root.sandbox"),
]