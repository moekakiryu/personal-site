# Production Setup Instructions

These steps assume you have already sourced a domain name and hosting provider.

IMPORTANT: This guide is as complete and thorough as I can make it, but I can not guaruntee
this necessarily follows best practices, but is what worked well for me.

## System Requisites

1. Ubuntu 22.04 (or compatible system)
2. Python 3.10 ([install](https://www.python.org/downloads/release/python-31012/))
3. PostgreSQL (install: `sudo apt install libpq-dev postgresql postgresql-contrib`)
4. Nginx (install: `sudo apt install nginx`)

## Guide

### Initial Setup

1. Create a `.env.prod` file based on the values listed in `./utils/environment.py`

2. Follow the steps in [this tutorial by DitigalOcean](https://www.digitalocean.com/community/tutorials/how-to-set-up-django-with-postgres-nginx-and-gunicorn-on-ubuntu#step-2-creating-the-postgresql-database-and-user).
Please feel free to skip step 3 in that guide as that has already been completed by this repository.

3. After compeleting these steps, update your domain's DNS settings to point to your new server and
verify that the site is being hosted correctly (you may need to update your browswer's setttings to
allow `http` connections without SSL).

### Add SSL Support

1. Get and enable a valid SSL certificate from a [trusted certifying authority (CA)](https://developer.visa.com/pages/trusted_certifying_authorities).

    1. Please follow [this guide by Sectigo](https://www.sectigo.com/knowledge-base/detail/ECC-CSR-Generation-Using-OpenSSL-1527076086315/kA01N000000zFKR) to generate a private SSL key and a CSR file (needed by CAs to generate a SSL certificate).
    2. Follow any steps from your chosen CA to verify site ownership and generate an SSL certificate.

2. Save both the certificate and private key in your system. For this project, we recommend: `/etc/nginx/ssl/example_com/`
3. Update your nginx config as follows:

```diff
server {
-    listen              80;
+    listen              443 ssl;
    server_name         example.com www.example.com;

+    # SSL Certificates
+    ssl_certificate     /etc/nginx/ssl/example_com/ssl-certificate.crt;
+    ssl_certificate_key /etc/nginx/ssl/example_com/private.key;

+    # SSL Additional Config
+    ssl_protocols       TLSv1.2 TLSv1.3;
+    ssl_ecdh_curve      X25519:prime256v1:secp384r1;
+    ssl_ciphers         ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384:DHE-RSA-CHACHA20-POLY1305;
+    ssl_prefer_server_ciphers off;

    location = /favicon.ico { access_log off; log_not_found off; }
    location /static/ {
        root /var/www/yourdomain.com/static;
    }

    location / {
            include proxy_params;
            proxy_pass http://unix:/run/gunicorn.sock;
    }
}

+ # HTTP redirect
+ server {
+    listen      80;
+    listen      [::]:80;
+    server_name example.com www.example.com;
+
+    location / {
+        return 301 https://example.com$request_uri;
+    }
+}
```

4. Confirm your nginx config is valid: `sudo nginx -t`
5. Restart the nginx service: `sudo systemctl restart nginx`
