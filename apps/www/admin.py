from django.contrib import admin

from apps.www.models import Article, Project, Employer, Contract


class ArticleAdmin(admin.ModelAdmin):
  search_fields = ['title']
  readonly_fields=(
     'slug',
     'draft_slug',
  )
  fieldsets = (
    ('Metadata', {
        'fields': (
           'slug',
           'draft_slug'
        )
    }),
    ('Content', {
        'fields': (
            'title',
            'content',
        ),
    }),
    ('Options', {
       'fields': (
          'is_draft',
          'is_spicy',
       )
    })
  )

  # The default Article queryset hides drafts, this overrides that so all
  # articles are visible in the admin
  def get_queryset(self, request):
    return super().get_queryset(request).model._base_manager.all()

  # Override the default search algorithm when selecting an article from a
  # Project's `article` field
  def get_search_results(self, request, article_list, search_term):
    article_list, use_distinct = super().get_search_results(request, article_list, search_term)
    active_models = request.GET.get('model_name', [])

    # If the request is coming from a dropdown in the ProjectAdmin, only show
    # fields which are able to be selected
    if 'autocomplete' in request.path and 'project' in active_models:
        # Remove articles already allocated to a project
        article_list = article_list.filter(project__isnull=True).filter(is_draft=False)

    return article_list, use_distinct


class ProjectAdmin(admin.ModelAdmin):
  search_fields = ['title', 'article__title']
  autocomplete_fields = ['article']
  fieldsets = (
      (None, {
          'fields': (
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
  list_display = ['name', 'employer','contract_dates']
  ordering = ['-end',]

  @admin.display(description="Date")
  def contract_dates(self, obj):
    start_date = obj.start.strftime('%b. %Y')
    end_date = obj.end.strftime('%b. %Y')
    return f'{start_date} - {end_date}'


admin.site.register(Article, ArticleAdmin)
admin.site.register(Project, ProjectAdmin)
admin.site.register(Employer, EmployerAdmin)
admin.site.register(Contract, ContractAdmin)
