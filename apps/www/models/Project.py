import uuid

from django.db import models
from tinymce.models import HTMLField

from .Article import Article

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

__all__ = [
  'Project',
]
