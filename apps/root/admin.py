from django.contrib import admin

from apps.root.models import BlogEntry, Project

# Register your models here.
class BlogEntryAdmin(admin.ModelAdmin):
  search_fields = ['title']


class ProjectAdmin(admin.ModelAdmin):
  search_fields = ['title', 'writeup__title']
  autocomplete_fields = ['writeup']


admin.site.register(BlogEntry, BlogEntryAdmin)
admin.site.register(Project, ProjectAdmin)
