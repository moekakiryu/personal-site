from django.shortcuts import render
from django.http import HttpResponse

def index(request):
  return render(request, 'root/home/index.html')

# Create your views here.
def sandbox(request):
  return render(request, 'root/sandbox/index.html')
