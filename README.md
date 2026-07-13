# Raymond Lewandowski Portfolio


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

## Folder Structure

*nb Only common files are included in this tree. Config files (such as
.gitignore and Django's asgi.py) and meta files (such as \_\_init\_\_.py) have
been excluded.*

```
personal-site
├── apps                    # Source code for individual sites
│  └── <app name>
│    ├── models/            # Django ORM configuration
│    ├── migrations/
│    │
│    ├── scripts/           # Front end content
│    ├── styles/
│    ├── static/
│    ├── templates/
│    │
│    ├── admin.py           # Django app files
│    ├── apps.py
│    ├── urls.py
│    └── views.py
│
├── core                    # Source for global Django config
│  ├── context_processors/  # Custom Django context processors
│  │
│  ├── static/              # Global static files [1]
│  ├── templatetags/        # Custom Django template tags
│  ├── templates/           # Global Django templates [2]
│  │
│  ├── hosts.py             # Subdomain configuration
│  ├── urls.py              # Top-level URL mapping
│  └── settings.py          # Main Django config
│
├── docs                    # Project documentation
├── scripts                 # Shell scripts for use by CI/CD
└── utils                   # Global python helper functions
```

1. Primarily for use in the django admin portal, but is technically usable by
   all subdomains.
2. For example, pages such as default HTTP error pages

## Project Index

1. [Portfolio Website](./apps/www/README.md)
1. [Melbourne Restaurant Recommendations](./apps/melbourne/README.md)
1. [XOR Encryption Tool](./apps/xor/README.md)

## Guidelines

1. [Source Countrol](./docs/Source-Control.md)