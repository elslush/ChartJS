import { hexToRgb, sortArrayObj } from '../utils';
const { createMockEntity } = require('./helpers/mockEntity');

const BubbleChart = require('../BubbleChart/widget/BubbleChart').default;

describe('BubbleChart._processData', () => {
    function makeContext(overrides) {
        return Object.assign({}, BubbleChart, {
            _hexToRgb: hexToRgb,
            _sortArrayObj: sortArrayObj,
            _sortArrayMx: jest.fn((values) => values),
            _createChart: jest.fn(),
            _createLegend: jest.fn(),
            _addChartClass: jest.fn(),
            _restartChart: jest.fn(),
            log: jest.fn(),
            id: 'test-bubble-1',

            seriescolor: 'color',
            serieshighlightcolor: 'highlightcolor',
            seriesylabel: 'yvalue',
            seriesxlabel: 'xvalue',
            seriesrlabel: 'rvalue',
            datasetlabel: 'label',
            sortingxvalue: 'sorting',
            seriesColorReduceOpacity: false,

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
            }),
            points: (cfg.points || []).map(p =>
                createMockEntity({
                    xvalue: p.x,
                    yvalue: p.y,
                    rvalue: p.r,
                    sorting: p.sorting || 0,
                })
            ),
        }));
    }

    it('extracts {x, y, r} objects from datapoints', () => {
        const ctx = makeContext({});
        ctx._data.datasets = makeDatasets([
            {
                sorting: 1, label: 'A',
                points: [
                    { x: 10, y: 20, r: 15 },
                    { x: 30, y: 40, r: 8 },
                ],
            },
        ]);

        ctx._processData();

        expect(ctx._chartData.datasets).toHaveLength(1);
        expect(ctx._chartData.datasets[0].data).toEqual([
            { x: 10, y: 20, r: 15 },
            { x: 30, y: 40, r: 8 },
        ]);
    });

    it('handles multiple datasets', () => {
        const ctx = makeContext({});
        ctx._data.datasets = makeDatasets([
            { sorting: 1, label: 'A', points: [{ x: 1, y: 2, r: 3 }] },
            { sorting: 2, label: 'B', points: [{ x: 4, y: 5, r: 6 }] },
        ]);

        ctx._processData();

        expect(ctx._chartData.datasets).toHaveLength(2);
        expect(ctx._chartData.datasets[0].data).toEqual([{ x: 1, y: 2, r: 3 }]);
        expect(ctx._chartData.datasets[1].data).toEqual([{ x: 4, y: 5, r: 6 }]);
    });

    it('skips empty datasets', () => {
        const ctx = makeContext({});
        ctx._data.datasets = makeDatasets([
            { sorting: 1, label: 'Empty', points: [] },
            { sorting: 2, label: 'Full', points: [{ x: 1, y: 2, r: 3 }] },
        ]);

        ctx._processData();

        expect(ctx._chartData.datasets).toHaveLength(1);
    });

    it('handles zero radius', () => {
        const ctx = makeContext({});
        ctx._data.datasets = makeDatasets([
            { sorting: 1, label: 'A', points: [{ x: 10, y: 20, r: 0 }] },
        ]);

        ctx._processData();

        expect(ctx._chartData.datasets[0].data[0].r).toBe(0);
    });

    it('calls _createChart and _createLegend', () => {
        const ctx = makeContext({});
        ctx._data.datasets = makeDatasets([
            { sorting: 1, label: 'A', points: [{ x: 1, y: 1, r: 1 }] },
        ]);

        ctx._processData();

        expect(ctx._createChart).toHaveBeenCalledWith(ctx._chartData);
        expect(ctx._createLegend).toHaveBeenCalledWith(false);
    });
});
