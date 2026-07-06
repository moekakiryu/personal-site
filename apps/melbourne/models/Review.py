import uuid

from django.db import models
from django.urls import reverse
from tinymce.models import HTMLField


class Review(models.Model):
  class WaitTypes(models.TextChoices):
    NONE = "None"
    WAIT_EXPECTED = "Wait Expected"
    LONG_WAIT_EXPECTED = "Long Wait Expected"
    BOOKING_RECOMMENDED = "Booking Recommended"
    BOOKING_REQUIRED = "Booking Required"

  class MealTypes(models.TextChoices):
    BRUNCH = "Brunch"
    LUNCH = "Lunch"
    DINNER = "Dinner"
    DESSERT = "Dessert"
    SNACK = "Snack"

  # Metadata
  slug = models.UUIDField(
    default=uuid.uuid4,
    editable=False,
    unique=True,
    null=False,
  )

  wait_type = models.CharField(
    max_length=30,
    choices=WaitTypes.choices
  )

  meal_type = models.CharField(
    max_length=10,
    choices=MealTypes.choices
  )

  is_favorite = models.BooleanField()

  # Content Fields
  title = models.CharField(
    max_length=255,
  )
  blurb = models.TextField(
    max_length=120,
  )

  def __str__(self):
    return self.title


__all__ = [
  'Review',
]
