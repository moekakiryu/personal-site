from django.urls import path
from django.http import HttpResponse

from core.context_processors.meta import url_meta

urlpatterns = [
    path('', lambda _: HttpResponse("Metro landing."), name="metro.home"),
    path('page/', lambda _: HttpResponse("Metro page."), name="metro.page"),
]