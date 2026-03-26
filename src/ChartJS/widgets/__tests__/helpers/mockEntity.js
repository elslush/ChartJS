/**
 * Factory for creating mock Mendix entity objects.
 * Simulates the .get() and .getGuid() interface.
 */
function createMockEntity(attrs) {
    return {
        get: function (attr) {
            return attrs[attr] !== undefined ? attrs[attr] : null;
        },
        getGuid: function () {
            return attrs._guid || 'mock-guid-' + Math.random().toString(36).slice(2, 8);
        },
        isNumeric: function (attr) {
            return typeof attrs[attr] === 'number';
        },
        isNumber: function (attr) {
            return typeof attrs[attr] === 'number';
        },
        set: function (attr, val) {
            attrs[attr] = val;
        },
    };
}

module.exports = { createMockEntity };
