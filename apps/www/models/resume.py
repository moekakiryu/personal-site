from django.db import models
from tinymce.models import HTMLField


class Employer(models.Model):
  name = models.CharField(
    max_length=50
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
