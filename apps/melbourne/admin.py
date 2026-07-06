from django.contrib import admin
from django.contrib import admin

from apps.melbourne.models import Restaurant



class RestaurantAdmin(admin.ModelAdmin):
  fieldsets = (
    (None, {
      'fields': (
        'name',
        (
        'is_favorite',
        'order',
      ),
      ),
    }),
    ('At a glance', {
      'fields': (
        'cuisine',
        'meal_type',
        'wait_type',
        'price_type',
      )
    }),
    ('More Details', {
      'fields': (
        'blurb',
        'website',
      )
    })
  )
  pass


admin.site.register(Restaurant, RestaurantAdmin)
