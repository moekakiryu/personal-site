require('dotenv').config({
  path: [
    '../../.env',
    '../../.env.local',
    '../../.env.dev',
    '../../.env.prod',
  ]
})

const generated_header = `/*

  THIS FILE IS AUTO-GENERATED - DO NOT EDIT IT DIRECTLY.

*/
`

module.exports = {
  parser: 'postcss-scss',
  map: process.env.DJANGO_ENV === 'dev',
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
