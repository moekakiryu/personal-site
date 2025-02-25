from django.shortcuts import render
from django.http import HttpResponse

def home(request):
  mock_projects = [
    {
      "name": "Project",
      "description": "Lorem ipsum"
    },
    {
      "name": "Project",
      "description": "Lorem ipsum"
    },
    {
      "name": "Project",
      "description": "Lorem ipsum"
    },
    {
      "name": "Project",
      "description": "Lorem ipsum"
    },
  ]

  return render(request, 'root/home/index.html', {
    'projects': mock_projects
  })

# Create your views here.
def sandbox(request):
  return render(request, 'root/sandbox/index.html')
