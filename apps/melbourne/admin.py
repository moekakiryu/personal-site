from django.contrib import admin
from django.contrib import admin

from apps.melbourne.models import Review



class ReviewAdmin(admin.ModelAdmin):
  pass


admin.site.register(Review, ReviewAdmin)
