# Javascript Guidelines

All scripts for this site are compiled with `esbuild`. These scripts should be
saved in `apps/www/scripts`.

## Components

All new components should be saved in the `apps/www/scripts/modules` folder,
and be named in camelCase after the component they are implementing.


### BaseComponent components

A `BaseComponent` class has been provided to simplify the creation process.
Using this class is optional but recommended.

### Manual components

If the `BaseComponent` class is **not** used to make a new component, the new
file must export an `init()` function as an entry point to attach all listeners
to the relevant HTML elements.

This function will be called with no arguments and should return `undefined`.

### Integration

After the new component has been created, import it in
`apps/www/docs/scripts/index.js` and append it to the relevant array.

## External Files

Some third party libraries require a javascript file to be embedded on the site
to function correctly. If this happens, save all of these files in the
`apps/www/scripts/external` folder, and name the file after the library that
requires it.

Any scripts saved in this file will not be minified or processed, but served
as-is, including any comments (to allow for license headers).
