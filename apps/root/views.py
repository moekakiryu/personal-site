from django.shortcuts import render
from django.http import HttpResponse

from apps.root.models import Article, Project


def home(request, **kwargs):
  article_count = 3
  project_count = 2

  projects = Project.objects.all().order_by('-id')
  articles = Article.objects.all().order_by('-created')

  return render(request, 'root/home/index.html', {
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

  return render(request, 'root/articles/index.html', {
    'articles': articles
  })


def article(request, article_id, **kwargs):
  article = Article.objects.get(slug = article_id)

  return render(request, 'root/article/index.html', {
    'article': article
  })


def projects(request, **kwargs):
  projects = Project.objects.all().order_by('-id')

  return render(request, 'root/projects/index.html', {
    'projects': projects
  })


def project(request, project_id, **kwargs):
  project = Project.objects.get(slug = project_id)

  return render(request, 'root/project/index.html', {
    'project': project,
  })


def sandbox(request, **kwargs):
  return render(request, 'root/sandbox/index.html')
