import os
from enum import Enum

from dotenv import dotenv_values

from typing import Literal

# --- Environment Variables --- #

VariableNames = Literal[
  # Global environment switch ('dev' | 'prod')
  'DJANGO_ENV',

  # Django cryptographic secret key
  # See: https://docs.djangoproject.com/en/5.1/ref/settings/#secret-key
  'DJANGO_SECRET',

  # Comma-separated list of allowed domains for our application
  # See: https://docs.djangoproject.com/en/5.1/ref/settings/#allowed-hosts
  'DJANGO_ALLOWED_HOSTS',

  # The public URL where the site will be hosted
  'DJANGO_TARGET_DOMAIN',
]

class Env(Enum):
  DEV = 'dev'
  PROD = 'prod'


# --- Load and parse values --- #

# Getters
def _enum_getter(mapping):
  def _getter(value):
    if value in mapping:
      return mapping.get(value)
    raise ValueError(f"'{value}' not found in environment mapping")
  return _getter

def _csv_getter():
  def _getter(value):
    if not value:
      return []
    return [v.strip() for v in value.split(',')]
  return _getter

# Load variables from files
_base_environment = {
  **dotenv_values('.env'),
  **dotenv_values('.env.local'),
  **dotenv_values('.env.dev'),
  **dotenv_values('.env.prod'),
  **os.environ,
}

# Apply tranformations as needed
_variable_transformations = {
  'DJANGO_ENV': _enum_getter({
    'dev': Env.DEV,
    'prod': Env.PROD
  }),
  'DJANGO_ALLOWED_HOSTS': _csv_getter()
}


# --- Public Api --- #
def get_environment(name: VariableNames):
  if name in _variable_transformations:
    return _variable_transformations[name](_base_environment.get(name))

  if name in _base_environment:
    return _base_environment.get(name)  
  
  return None
