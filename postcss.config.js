const generated_header = `/*

  THIS FILE IS AUTO-GENERATED - DO NOT EDIT IT DIRECTLY.

*/
`

module.exports = {
  parser: 'postcss-scss',
  map: false, // [1]
  plugins: [
    require('postcss-import'),
    require('postcss-nested'),
    require('postcss-custom-media'),
    require('autoprefixer'),
    require('postcss-prune-var'),
    require('cssnano'),
    require('postcss-header')({
      header: generated_header
    }),
  ]
}

/**
 *  1. This project currently has to build all static files locally (instead of
 *     on the remove machine), as a result it would be difficult to 
 *     differentiate dev and production builds without multiple commands, which
 *     introduces its own set of risks.
 * 
 *     For now we will disable sourcemaps entirely, but should reassess once the
 *     remote build issues are resolved.
 */