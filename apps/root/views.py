from django.shortcuts import render
from django.http import HttpResponse

from apps.root.models import Project

def home(request):
  projects = Project.objects.all()

  return render(request, 'root/home/index.html', {
    'projects': projects
  })

# Create your views here.
def sandbox(request):
  return render(request, 'root/sandbox/index.html')
