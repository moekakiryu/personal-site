from django.shortcuts import render
from django.http import Http404
from django.db.models import F
from django.forms.models import model_to_dict
from django.core.exceptions import ObjectDoesNotExist

from apps.www.models import Article, Project, Contract
from utils.querysets import stratify

def home(request, **kwargs):
  article_count = 3
  project_count = 4

  projects = Project.objects.all().order_by('-is_featured','-id')
  articles = Article.objects.all().order_by('-created')

  return render(request, 'www/home/index.html', {
    'projects': {
      'list': projects[:project_count],
      'has_more': projects.count() > project_count
    },
    'articles': {
      'list': articles[:article_count],
      'has_more': articles.count() > article_count
    },
  })


def articles(request, **kwargs):
  articles = Article.objects.all().order_by('-created')

  return render(request, 'www/articles/index.html', {
    'articles': articles
  })


def article(request, article_id, **kwargs):
  try:
    article = Article.objects.get(slug = article_id)
  except ObjectDoesNotExist:
    try:
      article = Article.objects.get_draft(slug = article_id)
    except ObjectDoesNotExist:
     raise Http404

  return render(request, 'www/article/index.html', {
    'article': article
  })


def projects(request, **kwargs):
  standard_projects = Project.objects.filter(is_featured=False).order_by('-id')
  featured_projects = Project.objects.filter(is_featured=True).order_by('-id')

  if standard_projects and featured_projects:
    projects = stratify(featured_projects, standard_projects, every=5)
  elif standard_projects or featured_projects:
    projects = standard_projects or featured_projects
  else:
    projects = []

  return render(request, 'www/projects/index.html', {
    'projects': projects
  })


def project(request, project_id, **kwargs):
  try:
    project = Project.objects.get(slug = project_id)
  except ObjectDoesNotExist:
    raise Http404

  return render(request, 'www/project/index.html', {
    'project': project,
  })


def resume(request, **kwargs):
  contracts = Contract.objects.annotate(
    contract_span=F('end') - F('start')
  ).order_by('-end__year','-end__month','-contract_span')

  employers = []
  contract_group = []
  current_employer = contracts.first().employer

  for contract in contracts:
      is_new_employer = contract.employer != current_employer
      
      if is_new_employer:
          employers.append({
            **model_to_dict(current_employer),
            'contracts': contract_group,
          })
          contract_group = [contract]
          current_employer = contract.employer
      else:
          contract_group.append(contract)

  # Append the last group if it exists
  if contract_group:
      employers.append({
        **model_to_dict(current_employer),
        'contracts': contract_group,
      })

  return render(request, 'www/resume/index.html', {
     'employers': employers
  })
