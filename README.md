# Moeka Kiryu Personal Site


## System Requisites

1. Python >= 3.10.12 ([Install](https://www.python.org/downloads/release/python-31012/))

## Setup

*These steps are for a development server. For production setup, please see the [production setup guide](./docs/Production-Setup.md).*

```sh
# Create python virtual environment
python -m venv .venv
source .venv/bin/activate

# Install dependencies
python -m pip install -r requirements.txt

# Initialize development database
python manage.py migrate

# Start server
python manage.py runserver
```