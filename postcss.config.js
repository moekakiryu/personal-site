module.exports = {
  plugins: [
    require('postcss-import'),
    require('postcss-nested'),
    require('postcss-custom-media'),
    require('postcss-nested-props'),
    require('autoprefixer'),
    require('cssnano'),
  ]
}