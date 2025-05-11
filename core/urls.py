from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic.base import TemplateView

from utils.environment import Env, get_environment

admin_url = get_environment('DJANGO_ADMIN_URL') or 'admin/'

urlpatterns = [
    # Django
    path(admin_url, admin.site.urls),

    # Plugins
    path('tinymce/', include('tinymce.urls')),

    # Meta
    path('robots.txt', TemplateView.as_view(template_name = 'robots.txt', content_type = "text/plain")),

    # Local Applications
    path('', include('apps.root.urls')),
    path('metro/', include('apps.metroTunnel.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
