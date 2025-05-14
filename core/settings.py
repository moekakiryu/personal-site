# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.1/howto/deployment/checklist/
import os
from pathlib import Path

from utils.environment import Env, get_environment

# Project root
BASE_DIR = Path(__file__).resolve().parent.parent
CURRENT_ENVIRONMENT = get_environment('DJANGO_ENV')

# https://docs.djangoproject.com/en/5.1/ref/settings/#debug
DEBUG = CURRENT_ENVIRONMENT == Env.DEV

# Internationalization
# https://docs.djangoproject.com/en/5.1/topics/i18n/
LANGUAGE_CODE = 'en-au'
TIME_ZONE = 'Australia/Melbourne'
USE_I18N = True
USE_TZ = True

# https://docs.djangoproject.com/en/5.1/ref/settings/#silenced-system-checks
SILENCED_SYSTEM_CHECKS = [
    # HSTS Preload disabled - Chrome recommends against using this feature, see:
    # https://hstspreload.org/#preloading
    'security.W021',

    # DEBUG set to True - this is controlled by an environment variable and will
    # be False in deployed application
    'security.W018',

    # SSL Redirect is set to False - this is controlled by an environment
    # variable and will be True in deployed application
    'security.W008',
]



# --- HOSTING --- #

# https://docs.djangoproject.com/en/5.1/ref/settings/#allowed-hosts
ALLOWED_HOSTS = [
  *get_environment('DJANGO_ALLOWED_HOSTS'),
  get_environment('DJANGO_TARGET_DOMAIN')
]

# https://docs.djangoproject.com/en/5.1/ref/settings/#wsgi-application
WSGI_APPLICATION = 'core.wsgi.application'

# https://docs.djangoproject.com/en/5.1/ref/settings/#secure-ssl-redirect
# Note: Even on prod this should be safe to leave off - redirects are handled
#       by the domain provider. We will leave this setting on as a fallback.
SECURE_SSL_REDIRECT = CURRENT_ENVIRONMENT == Env.PROD

# https://docs.djangoproject.com/en/5.1/ref/settings/#secure-hsts-seconds
# See also: https://hstspreload.org/#deployment-recommendations
SECURE_HSTS_SECONDS = 604800

# https://docs.djangoproject.com/en/5.1/ref/settings/#std-setting-SECURE_HSTS_INCLUDE_SUBDOMAINS
SECURE_HSTS_INCLUDE_SUBDOMAINS = True



# --- DJANGO CORE --- #

# https://docs.djangoproject.com/en/5.1/ref/settings/#root-urlconf
ROOT_URLCONF = 'core.urls'

# https://docs.djangoproject.com/en/5.1/ref/settings/#installed-apps
INSTALLED_APPS = [
    # Django Core
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Plugins
    'tinymce',
    'axes',
    'django_hosts',

    # Local Applications
    'apps.www.apps.WwwConfig',
]

# https://docs.djangoproject.com/en/5.1/ref/settings/#middleware
MIDDLEWARE = [
    'django_hosts.middleware.HostsRequestMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'axes.middleware.AxesMiddleware',
    'django_hosts.middleware.HostsResponseMiddleware',
]


# https://docs.djangoproject.com/en/5.1/ref/settings/#templates
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [
          BASE_DIR / 'core/templates',
        ],
        'APP_DIRS': True,
        'OPTIONS': {
            'libraries': {
              'rich_content': 'core.templatetags.rich_content',
            },
            'context_processors': [
                # Django processors
                'django.template.context_processors.debug',
                'django.template.context_processors.media',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',

                # Local processors
                'core.context_processors.meta.processor',
            ],
        },
    },
]

# https://docs.djangoproject.com/en/5.1/ref/settings/#static-url
STATIC_URL = 'static/'

# https://docs.djangoproject.com/en/5.1/ref/settings/#static-root
STATIC_ROOT = f"/var/www/{(get_environment('DJANGO_TARGET_DOMAIN') or 'default').strip('.')}/static"

# https://docs.djangoproject.com/en/5.1/ref/settings/#media-url
MEDIA_URL = 'media/'

# https://docs.djangoproject.com/en/5.1/ref/settings/#media-root
MEDIA_ROOT = f"/var/www/{(get_environment('DJANGO_TARGET_DOMAIN') or 'default').strip('.')}/media"


# --- SECURITY --- #

# https://docs.djangoproject.com/en/5.1/ref/settings/#session-cookie-age
SESSION_COOKIE_AGE = 24 * 60 ^ 60 # (in seconds)

# https://docs.djangoproject.com/en/5.1/ref/settings/#session-cookie-name
SESSION_COOKIE_NAME = 'session'

# https://docs.djangoproject.com/en/5.1/ref/settings/#session-cookie-secure
SESSION_COOKIE_SECURE = True

# https://docs.djangoproject.com/en/5.1/ref/settings/#session-cookie-secure
CSRF_COOKIE_SECURE = True

# https://docs.djangoproject.com/en/5.1/ref/settings/#csrf-use-sessions
CSRF_USE_SESSIONS = True

# https://docs.djangoproject.com/en/5.1/ref/settings/#secret-key
if not get_environment('DJANGO_SECRET'):
  raise ValueError('Django secret key not found. Please set `DJANGO_SECRET` environment variable before continuing.')
SECRET_KEY = get_environment('DJANGO_SECRET')

# https://docs.djangoproject.com/en/5.1/ref/settings/#auth-password-validators
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# https://docs.djangoproject.com/en/5.1/ref/settings/#std-setting-AUTHENTICATION_BACKENDS
AUTHENTICATION_BACKENDS = [
  'axes.backends.AxesStandaloneBackend',
  'django.contrib.auth.backends.ModelBackend',
]


# --- DATABASE --- #

# https://docs.djangoproject.com/en/5.1/ref/settings/#databases
DATABASES = {
    Env.DEV: {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    },
    Env.PROD: {
      'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': get_environment('POSTGRESQL_DB'),
        'USER': get_environment('POSTGRESQL_USERNAME'),
        'PASSWORD': get_environment('POSTGRESQL_PASSWORD'),
        'HOST': 'localhost',
        'PORT': '',
      }
    },
}[CURRENT_ENVIRONMENT]

# https://docs.djangoproject.com/en/5.1/ref/settings/#default-auto-field
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# --- PLUGINS --- #
ROOT_HOSTCONF = "core.hosts"
DEFAULT_HOST = "www"

TINYMCE_DEFAULT_CONFIG = {
    "theme": "silver",
    "skin": "oxide-dark",
    "content_css": "tinymce-5-dark",
    "height": 500,
    "menubar": False,

    "plugins": [
      'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'print',
      'preview', 'anchor', 'searchreplace', 'visualblocks', 'code',
      'fullscreen', 'insertdatetime', 'media', 'table', 'paste', 'code', 'help',
      'wordcount', 'code', 'codesample',
    ],
    'fullscreen_native': True,
    'codesample_languages': [
      { 'text': 'JavaScript', 'value': 'javascript' },
      { 'text': 'TypeScript', 'value': 'typescript' },
      { 'text': 'CSS', 'value': 'scss' },
      { 'text': 'HTML/XML', 'value': 'markup' },
      { 'text': 'Python', 'value': 'python' },
      { 'text': 'JSON', 'value': 'json5' },
      { 'text': 'C', 'value': 'c' },
      { 'text': 'Bash', 'value': 'bash' },
      { 'text': 'GraphQL', 'value': 'graphql' },
      { 'text': 'SQL', 'value': 'sql' },
      { 'text': 'HTTP Request', 'value': 'http' },
      { 'text': 'Regular Expression', 'value': 'regex' },
    ],

    "toolbar": [
      { 'name': 'history', 'items': ['undo', 'redo']},
      { 'name': 'formatting', 'items': ['bold', 'italic', 'underline', 'strikethrough']},
      { 'name': 'layout', 'items': ['headings', 'links']},
      { 'name': 'lists', 'items': ['alignment',  'bullist', 'numlist']},
      { 'name': 'extra formatting', 'items': [ 'codesample', 'blockquote', 'subscript', 'superscript']},
      { 'name': 'indent', 'items': ['outdent', 'indent']},
      { 'name': 'extra', 'items': ['code', 'fullscreen']},
    ],
    'toolbar_groups': {
      'headings': {
        'icon': 'change-case',
        'tooltip': 'Headings',
        'items': 'h2 h3 h4 h5 h6'
      },
      'alignment': {
        'icon': 'align-center',
        'tooltip': 'Alignment',
        'items': 'alignleft aligncenter alignright alignjustify alignnone'
      },
      'links': {
        'icon': 'link',
        'tooltip': 'Add Link',
        'items': 'link unlink'
      }
    }
}