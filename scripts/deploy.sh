# This is very basic and flaky, this should be updated with extra checks and fallbacks in the future

# Verify this script is being run in the correct directory
# Note: We assume that finding an django entry is enough verification for this
if [ ! -f manage.py ]; then
  echo "Unable to find Django project. Please ensure this script is run from the project root."
  exit 1;
fi

# Activate python virtual environment
if [ ! -f .venv/bin/activate ]; then
  echo "Python virtual environment not initialized"
  exit 1
fi
source .venv/bin/activate

echo -e "\n\n-- Installing new requirements --"
python3 -m pip install -r requirements.txt

echo -e "\n\n-- Collecting Django updates --"
python3 manage.py collectstatic --no-input

echo -e "\n\n-- Collecting Django updates --"
python3 manage.py migrate

# Deactivate python virtual environment since all python operations have been completed
deactivate

echo -e "\n\n-- Restarting gunicorn service --"
sudo systemctl restart gunicorn
