import os
from enum import Enum

from dotenv import dotenv_values

from typing import Literal

# Load values from files
_base_environment = {
  **dotenv_values('.env'),
  **dotenv_values('.env.local'),
  **dotenv_values('.env.dev'),
  **dotenv_values('.env.prod'),
  **os.environ,
}

# Getters
def _enum_getter(mapping):
  def _getter(value):
    if value in mapping:
      return mapping.get(value)
    raise ValueError(f"'{value}' not found in environment mapping")
  return _getter


# Public Api
VariableNames = Literal[
  # Global environment switch ('dev' | 'prod')
  'ENV',

  # Django cryptographic secret key
  # See: https://docs.djangoproject.com/en/5.1/ref/settings/#secret-key
  'DJANGO_SECRET',
]

class Env(Enum):
  DEV = 'dev'
  PROD = 'prod'

def get_environment(name: VariableNames):
  getters = {
    'ENV': _enum_getter({
      'dev': Env.DEV,
      'prod': Env.PROD
    })
  }

  if name in getters:
    return getters[name](_base_environment.get(name))

  if name in _base_environment:
    return _base_environment.get(name)  
  
  raise ValueError(f'Unable to load environment variable: {name}')
