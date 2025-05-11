from django_hosts import patterns, host

host_patterns = patterns('path.to',
    host(r'', 'apps.root.urls', name='root'),
    host(r'metro', 'apps.metro.urls', name='metro'),
)