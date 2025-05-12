from django.contrib import admin

from apps.www.models import Article, Project, Employer, Contract


class ArticleAdmin(admin.ModelAdmin):
  search_fields = ['title']

  def get_search_results(self, request, article_list, search_term):
    article_list, use_distinct = super().get_search_results(request, article_list, search_term)
    active_models = request.GET.get('model_name', [])

    # If the request is coming from a dropdown in the ProjectAdmin, only show
    # fields which are able to be selected
    if 'autocomplete' in request.path and 'project' in active_models:
        # Remove articles already allocated to a project
        article_list = article_list.filter(project__isnull=True)

    return article_list, use_distinct


class ProjectAdmin(admin.ModelAdmin):
  search_fields = ['title', 'article__title']
  autocomplete_fields = ['article']
  fieldsets = (
      (None, {
          "fields": (
              'title',
              'is_featured',
          ),
      }),
      ('Location', {
        'fields': (
          'project_url',
          'source_url',
        )
      }),
      ('Images', {
        'fields': (
          'hero',
          'thumbnail',
        )
      }),
      ('Writeup', {
        'fields': (
          'blurb',
          'article',
        ),
        'classes': ['wide']
      })
  )


class EmployerAdmin(admin.ModelAdmin):
   pass


class ContractAdmin(admin.ModelAdmin):
   pass


admin.site.register(Article, ArticleAdmin)
admin.site.register(Project, ProjectAdmin)
admin.site.register(Employer, EmployerAdmin)
admin.site.register(Contract, ContractAdmin)
