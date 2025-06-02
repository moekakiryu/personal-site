from urllib import parse as urlparse

def add_scheme(url: str, use_secure = True):
  if not url.startswith('http') and not '://' in url:
    scheme = 'https' if use_secure else 'http'
    return f'${scheme}://{url}'
  return url

def dot_to_star_wildcard(url: str):
  # Urlparse expects all URLs to be prefixed with a scheme
  url_with_scheme = add_scheme(url)

  parsed = urlparse.urlparse(url_with_scheme)
  
  # If the URL includes a subdomain wildcard (.domain), prefix it with a star
  if parsed.netloc.startswith('.'):
    parsed = parsed._replace(netloc = '*' + parsed.netloc)

  return parsed.geturl()