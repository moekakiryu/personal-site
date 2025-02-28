import string

from django import template
from django.template.defaultfilters import stringfilter
from lxml.etree import HTMLParser, fromstring as xml_parse

register = template.Library()
html_parser = HTMLParser()

@register.filter(is_safe=True)
@stringfilter
def rich_preview(value, arg):
    try:
        expected_length = int(arg)
    except ValueError:
        return value

    parsed = xml_parse(value, html_parser)
    if not parsed:
        return value
    
    parent = parsed.find('body')
    words = []
    i = 0
    while i < len(parent) and len(words) < expected_length:
        node = parent[i]
        if node.text:
            words.extend(''.join(node.itertext()).split(' '))
        i += 1

    if len(words) < expected_length:
        return ' '.join(words)
    return ' '.join(words[:expected_length]).strip().strip(string.punctuation) + '...'