from django.db import models
from django.contrib import admin
from tinymce.models import HTMLField


class BlogEntry(models.Model):
  title = models.CharField(
    max_length=255,
  )
  content = HTMLField()

  def __str__(self):
    return self.title


class Project(models.Model):
  project_url = models.URLField()
  title = models.CharField(
    max_length=255,
  )
  blurb = models.TextField(
    max_length=120
  )
  writeup = models.ForeignKey(
    BlogEntry,
    on_delete=models.PROTECT,
  )

  def __str__(self):
    return self.title
