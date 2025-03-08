from pathlib import Path

from django.urls import resolve, Resolver404

META_KEY = '_meta'
PATH_HOME = '/'

class PageMeta:
  def __init__(self, path, resolved):
    self._path = path
    self._resolved = resolved
    self._meta = self.get_meta(resolved)

  @staticmethod
  def get_parent_path(path):
    parsed_parent = Path(path).parent
    parent_path = str(parsed_parent.as_posix())

    # Ensure there is exactly 1 trailing slash
    return f"{parent_path.rstrip('/')}/"
  
  @staticmethod
  def get_meta(resolved):
    return resolved.kwargs.get(META_KEY, {})

  @property
  def is_home(self):
    return self._path == PATH_HOME
  
  @property
  def path(self):
    return self._path
  
  @property
  def display_name(self):
    display_name_or_func = self._meta.get('display_name')

    if isinstance(display_name_or_func, str):
      return display_name_or_func
    elif display_name_or_func is None:
      return None
  
    return display_name_or_func(**self._resolved.captured_kwargs)

# Helper function to ensure all metadata is formatted correctly in each url
def url_meta(*, display_name):
  return {
    META_KEY: {
      'display_name': display_name
    }
  }

# Context Processor
def processor(request):
  current_resolved = resolve(request.path)

  # Get nearest parent with an assigned view
  # (assume '/' will always have a view)
  parent_path = PageMeta.get_parent_path(request.path)
  parent_resolved = None
  old_path = None
  while old_path != PATH_HOME and parent_resolved == None:
    try:
      parent_resolved = resolve(parent_path)
    except Resolver404:
      old_path = parent_path
      parent_path = PageMeta.get_parent_path(parent_path)
  
  current_page = PageMeta(request.path, current_resolved)
  parent_page = PageMeta(parent_path, parent_resolved)
  return {
    'meta': {
      'current': {
        'display_name': current_page.display_name,
        'is_home': current_page.is_home,
        'path': current_page.path,
      },
      'parent': {
        'display_name': parent_page.display_name,
        'is_home': parent_page.is_home,
        'path': parent_page.path,
      },
    }
  }

