const generated_header = `/*

  THIS FILE IS AUTO-GENERATED - DO NOT EDIT IT DIRECTLY.

*/
`

module.exports = {
  parser: 'postcss-scss',
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