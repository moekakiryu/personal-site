from django_hosts import patterns, host

host_patterns = patterns('apps',
    host(r'', 'root.urls', name='root'),
    host(r'metro', 'metro.urls', name='metro'),
)