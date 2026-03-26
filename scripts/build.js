const path = require('path');
const fs = require('fs-extra');
const webpack = require('webpack');

// Clean
const dirsToRemove = ['dist', 'build'];
dirsToRemove.forEach(dir => {
    const fullPath = path.resolve(__dirname, '..', dir);
    fs.removeSync(fullPath);
    console.log(`Cleaned ${dir}/`);
});

// Build
const config = require('../webpack.config.js');
webpack(config, (err, stats) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(stats.toString({ colors: true, modules: false }));
    if (stats.hasErrors()) {
        process.exit(1);
    }
});
