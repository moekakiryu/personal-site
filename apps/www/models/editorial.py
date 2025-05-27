import uuid

from django.db import models
from tinymce.models import HTMLField


class ArticleManager(models.Manager):
  def get_queryset(self):
    return super().get_queryset().filter(is_draft = False)

class ArticleDraftManager(models.Manager):
  def get_queryset(self):
    return super().get_queryset().filter(is_draft = True)

class Article(models.Model):
  objects = ArticleManager()
  drafts = ArticleDraftManager()

  # Metadata
  slug = models.UUIDField(
    default=uuid.uuid4,
    editable=False,
    unique=True,
    null=False,
  )
  draft_slug = models.UUIDField(
    default=uuid.uuid4,
    editable=False,
    unique=True,
    null=False
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
  is_spicy = models.BooleanField()
  is_draft = models.BooleanField(
    default=True
  )
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
  # TODO: Add SVG validation
  thumbnail = models.FileField(
    upload_to='www/projects/',
    blank=True
  )
  hero = models.FileField(
    upload_to='www/projects/',
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
