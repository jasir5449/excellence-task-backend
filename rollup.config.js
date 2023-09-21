const commonjs = require('@rollup/plugin-commonjs');
module.exports = {
    input : "server.js",
    output: {
        file : "build/index.js",
        format: "cjs"
    },
    plugins:[commonjs()]
}