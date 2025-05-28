import uuid

from django.db import models
from django.urls import reverse
from tinymce.models import HTMLField

class ArticleManager(models.Manager):
  def get_queryset(self):
    return super().get_queryset().filter(is_draft = False)
  
  def get_draft(self, *, slug):
    return super().get_queryset().get(draft_slug = slug, is_draft = True)

class Article(models.Model):
  objects = ArticleManager()

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

  def get_absolute_url(self):
    preview_slug = self.draft_slug if self.is_draft else self.slug

    return reverse('www.article', kwargs={ 'article_id': preview_slug })

__all__ = [
  'Article',
]
