var path = require("path");
var glob = require('glob'),
 srcPath = path.resolve(__dirname, './src');
function getDevEntry(cwd) {

    var entry = {};
    glob.sync('**/*.js', {cwd: cwd}).forEach(function (item, i) {
        var file = item.replace('.js', '');
        entry[file] = [
            cwd+'/'+item
        ];
    });
    return entry;
}
module.exports = {
  entry: getDevEntry(srcPath),
  output: {
    path: path.resolve(__dirname, "build"),
    publicPath: "/assets/",
    filename: "[name].js"
  },
  resolve: {
    extensions: ['', '.js'],
    alias: {
      lib: path.join(__dirname, 'src/lib'),
      util: path.join(__dirname, 'src/util')
    }
  },
  loaders: [
      {
        test: /\.js?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015']
        }
      }
  ]
};
