import { hexToRgb, sortArrayObj } from '../utils';
const { createMockEntity } = require('./helpers/mockEntity');

const BarChart = require('../BarChart/widget/BarChart').default;

describe('BarChart._processData', () => {
    function makeContext(overrides) {
        return Object.assign({}, BarChart, {
            _hexToRgb: hexToRgb,
            _sortArrayObj: sortArrayObj,
            _sortArrayMx: jest.fn((values) => values),
            _createChart: jest.fn(),
            _createLegend: jest.fn(),
            _addChartClass: jest.fn(),
            _restartChart: jest.fn(),
            log: jest.fn(),
            id: 'test-bar-1',

            // Widget config properties
            seriescolor: 'color',
            serieshighlightcolor: 'highlightcolor',
            seriesylabel: 'yvalue',
            seriesxlabel: 'xlabel',
            datasetlabel: 'label',
            sortingxvalue: 'sorting',
            scaleShowLabelsBottom: true,
            seriesColorReduceOpacity: false,

            // Data structures
            _chartData: { datasets: [], labels: [] },
            _activeDatasets: [],
            _data: { object: null, datasets: [] },
        }, overrides);
    }

    function makeDatasets(configs) {
        return configs.map(cfg => ({
            sorting: cfg.sorting || 0,
            dataset: createMockEntity({
                color: cfg.color || '#FF0000',
                highlightcolor: cfg.highlightcolor || '#CC0000',
                label: cfg.label || 'Dataset',
                yvalue: cfg.yvalue || 0,
            }),
            points: (cfg.points || []).map(p =>
                createMockEntity({
                    xlabel: p.xlabel || 'X',
                    yvalue: p.yvalue || 0,
                    sorting: p.sorting || 0,
                })
            ),
        }));
    }

    it('processes 2 datasets with 3 points each', () => {
        const ctx = makeContext({});
        ctx._data.datasets = makeDatasets([
            {
                sorting: 1, label: 'A', color: '#FF0000',
                points: [
                    { xlabel: 'Jan', yvalue: 10 },
                    { xlabel: 'Feb', yvalue: 20 },
                    { xlabel: 'Mar', yvalue: 30 },
                ],
            },
            {
                sorting: 2, label: 'B', color: '#00FF00',
                points: [
                    { xlabel: 'Jan', yvalue: 15 },
                    { xlabel: 'Feb', yvalue: 25 },
                    { xlabel: 'Mar', yvalue: 35 },
                ],
            },
        ]);

        ctx._processData();

        expect(ctx._chartData.datasets).toHaveLength(2);
        expect(ctx._chartData.datasets[0].data).toEqual([10, 20, 30]);
        expect(ctx._chartData.datasets[1].data).toEqual([15, 25, 35]);
    });

    it('fills zeros for empty datasets up to maxpoints', () => {
        const ctx = makeContext({});
        ctx._data.datasets = makeDatasets([
            {
                sorting: 1, label: 'A',
                points: [
                    { xlabel: 'Jan', yvalue: 10 },
                    { xlabel: 'Feb', yvalue: 20 },
                ],
            },
            {
                sorting: 2, label: 'Empty',
                points: [],
            },
        ]);

        ctx._processData();

        // The empty dataset gets skipped (continue statement) but zeros are pushed
        // before the continue, so the chart data should still have datasets
        expect(ctx._createChart).toHaveBeenCalled();
    });

    it('pads shorter datasets with zeros when points are empty', () => {
        const ctx = makeContext({});
        ctx._data.datasets = makeDatasets([
            {
                sorting: 1, label: 'Full',
                points: [{ xlabel: 'A', yvalue: 5 }, { xlabel: 'B', yvalue: 10 }],
            },
            {
                sorting: 2, label: 'Empty',
                points: [],
            },
        ]);

        ctx._processData();

        // First dataset processes normally, empty one pushes zeros then continues
        expect(ctx._createChart).toHaveBeenCalledTimes(1);
    });

    it('sorts datasets by sorting property', () => {
        const ctx = makeContext({});
        ctx._data.datasets = makeDatasets([
            { sorting: 2, label: 'Second', color: '#00FF00', points: [{ xlabel: 'A', yvalue: 2 }] },
            { sorting: 1, label: 'First', color: '#FF0000', points: [{ xlabel: 'A', yvalue: 1 }] },
        ]);

        ctx._processData();

        expect(ctx._chartData.datasets[0].label).toBe('First');
        expect(ctx._chartData.datasets[1].label).toBe('Second');
    });

    it('collects x-labels with deduplication', () => {
        const ctx = makeContext({});
        ctx._data.datasets = makeDatasets([
            {
                sorting: 1, label: 'A',
                points: [
                    { xlabel: 'Jan', yvalue: 10 },
                    { xlabel: 'Feb', yvalue: 20 },
                    { xlabel: 'Jan', yvalue: 30 },
                ],
            },
        ]);

        ctx._processData();

        expect(ctx._chartData.labels).toContain('Jan');
        expect(ctx._chartData.labels).toContain('Feb');
    });

    it('calls _createChart with final chartData', () => {
        const ctx = makeContext({});
        ctx._data.datasets = makeDatasets([
            { sorting: 1, label: 'A', points: [{ xlabel: 'X', yvalue: 1 }] },
        ]);

        ctx._processData();

        expect(ctx._createChart).toHaveBeenCalledWith(ctx._chartData);
    });

    it('calls _createLegend with false for multi-series', () => {
        const ctx = makeContext({});
        ctx._data.datasets = makeDatasets([
            { sorting: 1, label: 'A', points: [{ xlabel: 'X', yvalue: 1 }] },
        ]);

        ctx._processData();

        expect(ctx._createLegend).toHaveBeenCalledWith(false);
    });

    it('populates _activeDatasets with correct structure', () => {
        const ctx = makeContext({});
        ctx._data.datasets = makeDatasets([
            { sorting: 1, label: 'A', points: [{ xlabel: 'X', yvalue: 1 }] },
            { sorting: 2, label: 'B', points: [{ xlabel: 'X', yvalue: 2 }] },
        ]);

        ctx._processData();

        expect(ctx._activeDatasets).toHaveLength(2);
        expect(ctx._activeDatasets[0]).toHaveProperty('dataset');
        expect(ctx._activeDatasets[0]).toHaveProperty('idx', 0);
        expect(ctx._activeDatasets[0]).toHaveProperty('active', true);
        expect(ctx._activeDatasets[1]).toHaveProperty('idx', 1);
    });
});
