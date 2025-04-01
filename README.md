# Moeka Kiryu Portfolio


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

# Compile all static assets
yarn build

# Start server
python manage.py runserver

# (Optional) Run dev build agents
yarn dev
```

## Commands

### Django Commands

See: https://docs.djangoproject.com/en/5.1/ref/django-admin/#available-commands

### Yarn Commands

| Name                | Description 
|---------------------|------------------
| `build`             | Run build scripts for all applications
| `dev`               | Run dev scripts for all applications

## Project Index

1. [Portfolio Website](./apps/root/README.md)

## Guidelines

1. [Source Countrol](./docs/Source-Control.md)