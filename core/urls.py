from posixpath import join as join_path

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic.base import TemplateView

from utils.environment import Env, get_environment

from filebrowser.sites import site as filebrowser_site

admin_url = get_environment('DJANGO_ADMIN_URL') or 'admin/'

urlpatterns = [
    # Admin Plugins
    path(f"{join_path(admin_url, 'filebrowser')}/", filebrowser_site.urls),

    # Django
    path(admin_url, admin.site.urls),

    # Plugins
    path('tinymce/', include('tinymce.urls')),

    # Meta
    path('robots.txt', TemplateView.as_view(template_name = 'robots.txt', content_type = "text/plain")),

    # Local Applications
    path('', include('apps.www.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
