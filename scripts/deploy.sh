# This is very basic and flaky, this should be updated with extra checks and fallbacks in the future
git pull
python3 manage.py collectstatic
sudo systemctl restart gunicorn