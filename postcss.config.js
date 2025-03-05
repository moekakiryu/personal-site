module.exports = {
  plugins: [
    require('postcss-import'),
    require('postcss-nested'),
    require('postcss-nested-props'),
    require('autoprefixer'),
    require('cssnano'),
  ]
}