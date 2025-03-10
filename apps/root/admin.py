from django.contrib import admin

from apps.root.models import Article, Project


class ArticleAdmin(admin.ModelAdmin):
  search_fields = ['title']


class ProjectAdmin(admin.ModelAdmin):
  search_fields = ['title', 'article__title']
  autocomplete_fields = ['article']


admin.site.register(Article, ArticleAdmin)
admin.site.register(Project, ProjectAdmin)
