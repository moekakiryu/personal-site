from django.urls import path
from django.http import HttpResponse
from django.views.generic.base import TemplateView

from core.context_processors.meta import url_meta

urlpatterns = [
    path('', TemplateView.as_view(template_name = 'xor/index.html')),
]