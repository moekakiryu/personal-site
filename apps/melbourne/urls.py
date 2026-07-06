from django.urls import path
from django.http import HttpResponse

from core.context_processors.meta import url_meta

urlpatterns = [
    path('', lambda _: HttpResponse("Melbourne landing."), name="melbourne.home"),
    path('page/', lambda _: HttpResponse("Melbourne page."), name="melbourne.page"),
]