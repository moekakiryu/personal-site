module.exports = {
  parser: 'postcss-scss',
  plugins: [
    require('postcss-import'),
    require('postcss-nested'),
    require('postcss-custom-media'),
    require('autoprefixer'),
    require('cssnano'),
  ]
}