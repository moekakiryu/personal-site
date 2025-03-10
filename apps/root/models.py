import uuid

from django.db import models
from django.contrib import admin
from tinymce.models import HTMLField


class Article(models.Model):
  # Metadata
  slug = models.UUIDField(
    default=uuid.uuid4,
    editable=False,
    unique=True,
    null=False,
  )
  created = models.DateTimeField(
    auto_now_add=True,
    blank=False,
  )
  updated = models.DateTimeField(
    auto_now=True,
    blank=False,
  )

  # Content Fields
  title = models.CharField(
    max_length=255,
  )
  content = HTMLField()

  def __str__(self):
    return self.title


class Project(models.Model):
  # Metadata
  slug = models.UUIDField(
    default=uuid.uuid4,
    editable=False,
    unique=True,
    null=False,
  )

  # Content Fields
  project_url = models.URLField(
    blank=True
  )
  source_url = models.URLField()
  is_featured = models.BooleanField()
  title = models.CharField(
    max_length=255,
  )
  thumbnail = models.ImageField(
    upload_to='root/projects/',
  )
  hero = models.ImageField(
    upload_to='root/projects/',
  )
  blurb = models.TextField(
    max_length=120,
  )
  article = models.OneToOneField(
    Article,
    on_delete=models.PROTECT,
  )

  def __str__(self):
    return self.title
