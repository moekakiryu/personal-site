#!/bin/bash

# Verify this script is being run in the correct directory
# Note: We assume that finding an django entry is enough verification for this
if [ ! -f manage.py ]; then
  echo "Unable to find Django project. Please ensure this script is run from the project root."
  exit 1;
fi

# Verify that node and yarn are installed (assume they are the correct versions due to volta)
if [ ! -x "$(command -v node)" ] || [ ! -x "$(command -v yarn)" ]; then
  echo "Info: Unable to find node and yarn. Attempting to load from Volta.";

  # Volta adds itself to the user's bashrc file, which is not loaded in git
  # hooks. If this is running from inside a hook, add the volta directory to
  # PATH manually.
  export PATH="$HOME/.volta/bin:$PATH";

  if [ ! -x "$(command -v node)" ] || [ ! -x "$(command -v yarn)" ]; then
    echo "Error: Attempt unsuccessful. Please ensure node and yarn are installed correctly.";
    exit 1;
  else
    echo "Success."
  fi
fi

# Activate python virtual environment
if [ ! -f .venv/bin/activate ]; then
  echo "Python virtual environment not initialized"
  exit 1
fi
source .venv/bin/activate

echo -e "\n\n-- Installing new requirements --"
yarn install --immutable
python3 -m pip install -r requirements.txt

echo -e "\n\n-- Collecting Django updates --"
python3 manage.py collectstatic --no-input

echo -e "\n\n-- Collecting Django updates --"
python3 manage.py migrate

# Deactivate python virtual environment since all python operations have been completed
deactivate

echo -e "\n\n-- Restarting gunicorn service --"
sudo systemctl restart gunicorn

echo -e "Deployment Complete.\n"
