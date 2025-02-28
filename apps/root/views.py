from django.shortcuts import render
from django.http import HttpResponse

from apps.root.models import Article, Project

def home(request):
  projects = Project.objects.all()
  articles = Article.objects.all()

  return render(request, 'root/home/index.html', {
    'projects': projects,
    'articles': articles,
  })

def article(request, article_id):
  article = Article.objects.get(slug=article_id)

  return render(request, 'root/article/index.html', {
    'article': article
  })

def sandbox(request):
  return render(request, 'root/sandbox/index.html')
