from django.shortcuts import render
from django.http import Http404
from django.db.models import F
from django.forms.models import model_to_dict
from django.core.exceptions import ObjectDoesNotExist

from apps.www.models import Article, Project, Contract
from utils.querysets import stratify


def home(request, **kwargs):
  return render(request, 'melbourne/reviews/index.html')
