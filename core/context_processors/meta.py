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

  def get_metadata(self):
    return {
      'display_name': self.display_name,
      'is_home': self.is_home,
      'path': self.path,
    }


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

  # Resolve views for all ancestors
  # (note this could have a performance impact for deep url structures)
  current_path = PageMeta.get_parent_path(request.path)
  last_path = request.path
  ancestors = {}
  while last_path != PATH_HOME:
    try:
      ancestors[current_path] = resolve(current_path)
    # If the path can't be resolved, don't add it to ancestor list
    except Resolver404:
      pass
    finally:
      last_path = current_path
      current_path = PageMeta.get_parent_path(current_path)
  
  current_page = PageMeta(request.path, current_resolved)
  ancestor_pages = [
    PageMeta(path, resolved) for path, resolved in ancestors.items()
  ]
  parent_page = ancestor_pages[0] if len(ancestors) > 0 else None

  # Compute the parent needed for breadcrumbs
  if parent_page:
    if parent_page.display_name and not parent_page.is_home:
      breadcrumb_page = parent_page
    # TODO: Instead, this should walk up the ancestry list
    elif current_page.display_name:
      breadcrumb_page = current_page
    else:
      breadcrumb_page = None
  else:
    breadcrumb_page = None

  return {
    'meta': {
      'current': current_page.get_metadata(),

      'breadcrumb': {
        **breadcrumb_page.get_metadata(),
        'is_current': breadcrumb_page == current_page,
       } if breadcrumb_page else None,

      'ancestors': [page.get_metadata() for page in ancestor_pages]
    }
  }

