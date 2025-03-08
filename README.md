# Moeka Kiryu Personal Site


## System Requisites

1. Python >= 3.10.12 ([Install](https://www.python.org/downloads/release/python-31012/))
2. Volta ([Install](https://docs.volta.sh/guide/getting-started))

## Setup

*These steps are for a development server. For production setup, please see the [production setup guide](./docs/Production-Setup.md).*

1. Create an `.env.dev` file in the project root. A `.env.dev.example` file has been provided and can be used as a template.

2. Run the following commands in your terminal

```sh
# Create python virtual environment
python -m venv .venv
source .venv/bin/activate

# Install node dependencies
yarn install

# Install python dependencies
python -m pip install -r requirements.txt

# Initialize development database
python manage.py migrate

# Start server
python manage.py runserver

# (Optional) Start PostCSS build agent
yarn dev:css
```

## Guidelines

1. [CSS / Styling](./docs/Styling.md)
2. [Source Countrol](./docs/Source-Control.md)