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
    blank=True
  )
  hero = models.ImageField(
    upload_to='root/projects/',
    blank=True
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


# --- Resume Models --- #

class Employer(models.Model):
  name = models.CharField(
    max_length=30
  )

  def __str__(self):
    return self.name


class Contract(models.Model):
  employer = models.ForeignKey(
    to=Employer,
    on_delete=models.PROTECT,
    blank=False
  )
  name = models.CharField(
    max_length=255,
    blank=False
  )
  start = models.DateField(
    blank=False
  )
  end = models.DateField(
    blank=False
  )
  description = HTMLField()

  def __str__(self):
    return f'({self.employer.name}) {self.name}'
