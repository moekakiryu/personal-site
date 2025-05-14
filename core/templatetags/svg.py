from django import template
from django.utils.safestring import mark_safe
from lxml.etree import fromstring as xml_parse, tostring as xml_dump

register = template.Library()

# TODO: This may be better as a tag
@register.filter(is_safe=True)
def svg(value, arg = None):
  content = value.read().decode()

  # Reset the file cursor
  value.open()

  tree = xml_parse(content)
  
  if (arg):
    tree.set('class', arg)

  # TODO: This is a XSS issue, there should be at least some sanitization before converting into HTML
  svg = xml_dump(tree, encoding="unicode", method="html")

  return mark_safe(svg)