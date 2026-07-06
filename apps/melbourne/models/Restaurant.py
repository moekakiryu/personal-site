import uuid

from django.db import models
from django.urls import reverse
from tinymce.models import HTMLField


class Restaurant(models.Model):
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
    BAR = "Bar"

  slug = models.UUIDField(
    default=uuid.uuid4,
    editable=False,
    unique=True,
    null=False,
  )

  name = models.CharField(
    max_length=255,
  )

  cuisine = models.CharField(
    max_length=255,
  )

  # Metadata
  meal_type = models.CharField(
    max_length=10,
    choices=MealTypes.choices
  )

  wait_type = models.CharField(
    max_length=30,
    choices=WaitTypes.choices
  )

  is_favorite = models.BooleanField()

  # Content Fields

  blurb = models.TextField(
    max_length=120,
  )

  def __str__(self):
    return self.name


__all__ = [
  'Restaurant',
]
