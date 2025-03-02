from django.shortcuts import render
from django.http import HttpResponse

from apps.root.models import Article, Project


def home(request):
  article_count = 3
  project_count = 4

  projects = Project.objects.all().reverse()
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


def articles(request):
  articles = Article.objects.all().order_by('-created')

  return render(request, 'root/articles/index.html', {
    'articles': articles
  })


def article(request, article_id):
  article = Article.objects.get(slug=article_id)

  return render(request, 'root/article/index.html', {
    'article': article
  })


def projects(request):
  projects = Project.objects.all().reverse()

  return render(request, 'root/projects/index.html', {
    'projects': projects
  })


def sandbox(request):
  return render(request, 'root/sandbox/index.html')
