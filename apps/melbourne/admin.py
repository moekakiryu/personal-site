from django.contrib import admin
from django.contrib import admin

from apps.melbourne.models import Restaurant



class RestaurantAdmin(admin.ModelAdmin):
  fieldsets = (
    (None, {
      'fields': (
        'name',
      ),
    }),
    ('At a glance', {
      'fields': (
        'price_type',
        'wait_type',
        'meal_type',
        'cover_type',
        'cuisine',
      )
    }),
    ('More Details', {
      'fields': (
        'blurb',
        'website',
        'order',
        'is_favorite',
      )
    })
  )
  pass


admin.site.register(Restaurant, RestaurantAdmin)
