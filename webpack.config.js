const path = require('path')

module.exports = {
  target: 'web',
  mode: 'production',
  entry: './dist/index',
  output: {
    filename: 'sketch.js',
    path: path.resolve(process.cwd(), 'dist'),
    libraryTarget: 'var',
  },
}
