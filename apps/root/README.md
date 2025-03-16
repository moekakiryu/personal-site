# Portfolio Website

This directory contains the source code for my personal website:

[https://moekakiryu.dev](https://moekakiryu.dev)

## Build

This is almost entirely a static site, as such very little build steps are
required. Most of this site will be built and deployed automatically with the
core application. 

The only exception is the stylesheets, which must be compiled by PostCSS. To
do this, run:

```sh
yarn build:css
```

in the project root, then commit any changes. NOTE: This is NOT run
automatically on deployment. As such, all files must be built manually
beforehand.
