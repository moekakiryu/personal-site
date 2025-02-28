from django.shortcuts import render
from django.http import HttpResponse

from apps.root.models import BlogEntry, Project

def home(request):
  projects = Project.objects.all()
  articles = BlogEntry.objects.all()

  return render(request, 'root/home/index.html', {
    'projects': projects,
    'articles': articles,
  })

def blog(request, article_id):
  article = BlogEntry.objects.get(slug=article_id)

  return render(request, 'root/blog/index.html', {
    'article': article
  })

def sandbox(request):
  return render(request, 'root/sandbox/index.html')
