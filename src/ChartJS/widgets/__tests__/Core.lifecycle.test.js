const CoreModule = require('../Core');
const Core = CoreModule.default || CoreModule;
const { createMockEntity } = require('./helpers/mockEntity');
import { hexToRgb, sortArrayObj, createDataSets } from '../utils';

describe('Core lifecycle', () => {
    function makeContext(overrides) {
        return Object.assign({}, Core, {
            _hexToRgb: hexToRgb,
            _sortArrayObj: sortArrayObj,
            _createDataSets: createDataSets,
            log: jest.fn(),
            connect: jest.fn(),
            subscribe: jest.fn().mockReturnValue('mock-handle'),
            unsubscribe: jest.fn(),
            _executeCallback: jest.fn(function (cb) { if (cb) cb(); }),
            _execute: jest.fn(),
            _executePromise: jest.fn().mockResolvedValue([]),

            domNode: document.createElement('div'),
            canvasNode: document.createElement('canvas'),
            _legendNode: document.createElement('div'),
            _tooltipNode: null,
            _chart: null,
            _handle: null,
            _mxObj: null,
            _destroyed: false,
            _data: { object: null, datasets: [] },
            _datasetCounter: 0,
            _processData: jest.fn(),

            id: 'test-core-1',
            responsive: true,
            responsiveRatio: 0,
            width: 400,
            height: 300,
            datasourcemf: 'TestModule.DS_GetData',
            datasetentity: 'TestModule.DataSet/TestModule.Context_DataSet',
            datapointentity: 'TestModule.DataPoint/TestModule.DataSet_DataPoint',
            datasetsorting: 'SortOrder',
        }, overrides);
    }

    describe('update', () => {
        it('subscribes and loads data when given a valid object', () => {
            const ctx = makeContext({
                _loadData: jest.fn(),
            });
            const mxObj = createMockEntity({ _guid: 'guid-123' });
            const callback = jest.fn();

            ctx.update(mxObj, callback);

            expect(ctx._mxObj).toBe(mxObj);
            expect(ctx.subscribe).toHaveBeenCalledWith(
                expect.objectContaining({ guid: mxObj.getGuid() })
            );
            expect(ctx._loadData).toHaveBeenCalled();
            expect(callback).toHaveBeenCalled();
        });

        it('hides domNode and fires callback when object is null', () => {
            const ctx = makeContext({
                _loadData: jest.fn(),
            });
            const callback = jest.fn();

            ctx.update(null, callback);

            expect(ctx._mxObj).toBeNull();
            expect(ctx._loadData).not.toHaveBeenCalled();
            expect(ctx.domNode.style.display).toBe('none');
            expect(callback).toHaveBeenCalled();
        });

        it('unsubscribes previous handle before re-subscribing', () => {
            const ctx = makeContext({
                _loadData: jest.fn(),
                _handle: 'old-handle',
            });
            const mxObj = createMockEntity({ _guid: 'guid-456' });

            ctx.update(mxObj, jest.fn());

            expect(ctx.unsubscribe).toHaveBeenCalledWith('old-handle');
        });
    });

    describe('_loadData', () => {
        it('processes datasets when microflow returns data', async () => {
            const datasetObj = createMockEntity({
                _guid: 'ds-1',
                'TestModule.DataSet': ['dp-1', 'dp-2'],
            });
            const contextObj = createMockEntity({
                _guid: 'ctx-1',
                'TestModule.DataSet/TestModule.Context_DataSet': ['ds-1'],
            });

            const ctx = makeContext({
                _dataset: 'TestModule.DataSet/TestModule.Context_DataSet',
                _datapoint: 'TestModule.DataPoint/TestModule.DataSet_DataPoint',
                _mxObj: createMockEntity({ _guid: 'mxobj-1' }),
            });

            // Mock _executePromise to return an object with datasets
            ctx._executePromise = jest.fn().mockResolvedValue([contextObj]);

            await ctx._loadData();

            expect(ctx._executePromise).toHaveBeenCalledWith(
                'TestModule.DS_GetData',
                'mxobj-1'
            );
        });

        it('logs warning when microflow returns empty array', async () => {
            const ctx = makeContext({
                _mxObj: createMockEntity({ _guid: 'mxobj-2' }),
            });
            ctx._executePromise = jest.fn().mockResolvedValue([]);
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

            await ctx._loadData();

            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('has not returned any objects')
            );
            consoleSpy.mockRestore();
        });

        it('logs error when microflow throws', async () => {
            const ctx = makeContext({
                _mxObj: createMockEntity({ _guid: 'mxobj-3' }),
            });
            ctx._executePromise = jest.fn().mockRejectedValue(new Error('MF failed'));
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

            await ctx._loadData();

            expect(consoleSpy).toHaveBeenCalled();
            consoleSpy.mockRestore();
        });
    });

    describe('_loadDataSingleSet', () => {
        it('processes datasets and calls _processData', async () => {
            const dataset1 = createMockEntity({
                _guid: 'ds-1',
                SortOrder: 1,
            });
            const dataset2 = createMockEntity({
                _guid: 'ds-2',
                SortOrder: 2,
            });
            const contextObj = createMockEntity({
                _guid: 'ctx-1',
            });
            // The context object returns dataset GUIDs
            contextObj.get = jest.fn((attr) => {
                if (attr === 'TestModule.DataSet/TestModule.Context_DataSet') return ['ds-1', 'ds-2'];
                return null;
            });

            const ctx = makeContext({
                _dataset: 'TestModule.DataSet/TestModule.Context_DataSet',
                _mxObj: createMockEntity({ _guid: 'mxobj-4' }),
            });
            ctx._executePromise = jest.fn().mockResolvedValue([contextObj]);

            // Mock getData to return datasets
            const origGetData = require('widget-base-helpers').getData;
            require('widget-base-helpers').getData = jest.fn().mockResolvedValue([dataset1, dataset2]);

            await ctx._loadDataSingleSet();

            expect(ctx._processData).toHaveBeenCalled();
            expect(ctx._data.datasets).toHaveLength(2);

            // Restore
            require('widget-base-helpers').getData = origGetData;
        });
    });

    describe('datasetAdd', () => {
        it('decrements counter and adds to datasets', () => {
            const ctx = makeContext({
                _datasetCounter: 2,
                _data: { object: null, datasets: [] },
            });
            const dataset = createMockEntity({ SortOrder: 1 });
            const points = [createMockEntity({ x: 1 }), createMockEntity({ x: 2 })];

            ctx.datasetAdd(dataset, points);

            expect(ctx._datasetCounter).toBe(1);
            expect(ctx._data.datasets).toHaveLength(1);
            expect(ctx._data.datasets[0].dataset).toBe(dataset);
            expect(ctx._data.datasets[0].points).toBe(points);
            expect(ctx._processData).not.toHaveBeenCalled();
        });

        it('calls _processData when counter reaches 0', () => {
            const ctx = makeContext({
                _datasetCounter: 1,
                _data: { object: null, datasets: [] },
            });
            const dataset = createMockEntity({ SortOrder: 1 });

            ctx.datasetAdd(dataset, []);

            expect(ctx._datasetCounter).toBe(0);
            expect(ctx._processData).toHaveBeenCalled();
        });

        it('does not call _processData when _destroyed is true', () => {
            const ctx = makeContext({
                _datasetCounter: 1,
                _destroyed: true,
                _data: { object: null, datasets: [] },
            });
            const dataset = createMockEntity({ SortOrder: 1 });

            ctx.datasetAdd(dataset, []);

            expect(ctx._processData).not.toHaveBeenCalled();
        });
    });

    describe('cleanup', () => {
        it('unsubscribes handle when present', async () => {
            const ctx = makeContext({
                _handle: 'test-handle',
            });

            await ctx.cleanup();

            expect(ctx.unsubscribe).toHaveBeenCalledWith('test-handle');
        });

        it('destroys tooltip node when present', async () => {
            const tooltipNode = document.createElement('div');
            const ctx = makeContext({
                _handle: null,
                _tooltipNode: tooltipNode,
            });

            // Should not throw
            await ctx.cleanup();
        });
    });
});
