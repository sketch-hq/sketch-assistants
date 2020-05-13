// This is the Webpack config used by the Assistants to bundle themselves into a
// single file for usage in Sketch. Check their `build:sketch` scripts for more
// usage information.

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
