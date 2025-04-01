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

const isDevelopEnvironment = process.env.DJANGO_ENV === 'dev'

module.exports = {
  parser: 'postcss-scss',
  map: isDevelopEnvironment,
  plugins: [
    // Default Plugins
    require('postcss-import'),
    require('postcss-nested'),
    require('postcss-custom-media'),
    require('postcss-prune-var'),
    
    ...(isDevelopEnvironment ? [
      // Development Plugins
      require('postcss-header')({
        header: generated_header
      }),
    ]: [
      // Production Plugins
      require('autoprefixer'),
      require('cssnano'),
    ])
  ]
}
