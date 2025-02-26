from django.db import models
from django.contrib import admin
from tinymce.models import HTMLField

# Create your models here.
class BlogEntry(models.Model):
  title = models.CharField(max_length=255)
  content = HTMLField()

  def __str__(self):
    return self.title


admin.site.register(BlogEntry)
