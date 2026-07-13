# Portfolio Website

This directory contains the source code for a mircosite displaying my favorite
restaurants around Melbourne.

[https://melbourne.raymondlewandowski.dev](https://melbourne.raymondlewandowski.dev)

## Commands

All app-specific commands are run with yarn. For django app management, please
interact with `manage.py` in the root directory for this project.

| Name                | Description
|---------------------|------------------
| `build`             | Build all static assets for this application (see commands below)
| `build:css`         | Build and minify css files
| `build:js`          | Build and minify js files
| `build:js:external` | Build and minify external js files to be hosted by this application
| `dev`               | Start static file build scripts in watch mode
| `dev:css`           | Build css files in watch mode
| `dev:js`            | Build js files in watch mode

## Build

This is almost entirely a static site, as such very little build steps are
required. This site will be built and deployed automatically with the
core application.
