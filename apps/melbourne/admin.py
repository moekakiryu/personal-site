from django.contrib import admin
from django.contrib import admin

from apps.melbourne.models import Restaurant



class RestaurantAdmin(admin.ModelAdmin):
  pass


admin.site.register(Restaurant, RestaurantAdmin)
