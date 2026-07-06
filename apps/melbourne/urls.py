from django.urls import path

from core.context_processors.meta import url_meta

from . import views

urlpatterns = [
    path('', views.home, name="melbourne.home",
        kwargs=url_meta(display_name='Melbourne Restaurant Recommendations')
    ),
]