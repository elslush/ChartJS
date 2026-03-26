/**
 * Creates a widget-like context object with Core methods available.
 * Merges Core proto, child proto, and custom overrides.
 */
const CoreModule = require('../../Core');
const Core = CoreModule.default || CoreModule;
const { hexToRgb, sortArrayObj, createDataSets } = require('../../utils');

function createWidgetContext(childProto, overrides) {
    const ctx = Object.assign(
        {},
        Core,
        childProto || {},
        {
            // Provide Core utility methods
            _hexToRgb: hexToRgb,
            _sortArrayObj: sortArrayObj,
            _createDataSets: createDataSets,

            // Default no-op functions
            log: jest.fn(),
            connect: jest.fn(),
            subscribe: jest.fn().mockReturnValue('mock-handle'),
            unsubscribe: jest.fn(),
            _executeCallback: jest.fn(function (cb) { if (cb) cb(); }),
            _execute: jest.fn(),
            _executePromise: jest.fn().mockResolvedValue([]),

            // Default DOM nodes
            domNode: document.createElement('div'),
            canvasNode: document.createElement('canvas'),
            _legendNode: document.createElement('div'),
            _numberNode: document.createElement('div'),
            _tooltipNode: null,

            // Default data structures
            _chartData: { datasets: [], labels: [] },
            _activeDatasets: [],
            _data: { object: null, datasets: [] },
            _chart: null,
            _chartJS: jest.fn(function (ctx, config) {
                return {
                    ctx: ctx,
                    config: config,
                    data: config.data || { datasets: [], labels: [] },
                    chart: { canvas: document.createElement('canvas') },
                    stop: jest.fn(),
                    update: jest.fn(),
                    bindEvents: jest.fn(),
                    resize: jest.fn(),
                    destroy: jest.fn(),
                    getElementAtEvent: jest.fn().mockReturnValue([]),
                    generateLegend: jest.fn().mockReturnValue('<ul></ul>'),
                };
            }),
            _ctx: 'mock-2d-context',

            // Default widget properties
            _font: 'Helvetica Neue',
            _handle: null,
            _mxObj: null,
            _destroyed: false,
            _resizeTimer: null,
            id: 'test-widget-1',
        },
        overrides || {}
    );

    return ctx;
}

module.exports = { createWidgetContext };
