const defineWidget = (name, template, proto) => proto;
const log = function () { return function () {}; };
const runCallback = function () { return function (cb) { if (cb) cb(); }; };
const executePromise = function () { return function () { return Promise.resolve([]); }; };
const execute = function () { return function () {}; };
const getData = function (opts) { return Promise.resolve([]); };

module.exports = {
    defineWidget,
    log,
    runCallback,
    executePromise,
    execute,
    getData,
};
