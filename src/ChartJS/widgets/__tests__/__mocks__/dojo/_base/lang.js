function clone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    try {
        return JSON.parse(JSON.stringify(obj));
    } catch (e) {
        return Object.assign({}, obj);
    }
}

function hitch(context, fn) {
    var args = Array.prototype.slice.call(arguments, 2);
    if (typeof fn === 'string') {
        fn = context[fn];
    }
    if (typeof fn !== 'function') {
        return function() {};
    }
    return fn.bind(context, ...args);
}

function mixin(target) {
    for (var i = 1; i < arguments.length; i++) {
        if (arguments[i]) {
            Object.assign(target, arguments[i]);
        }
    }
    return target;
}

module.exports = { clone, hitch, mixin };
