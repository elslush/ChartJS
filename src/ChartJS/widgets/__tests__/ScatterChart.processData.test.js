import { hexToRgb, sortArrayObj } from '../utils';
const { createMockEntity } = require('./helpers/mockEntity');

const ScatterChart = require('../ScatterChart/widget/ScatterChart').default;

describe('ScatterChart._processData', () => {
    function makeContext(overrides) {
        return Object.assign({}, ScatterChart, {
            _hexToRgb: hexToRgb,
            _sortArrayObj: sortArrayObj,
            _sortArrayMx: jest.fn((values) => values),
            _createChart: jest.fn(),
            _createLegend: jest.fn(),
            _addChartClass: jest.fn(),
            _restartChart: jest.fn(),
            log: jest.fn(),
            id: 'test-scatter-1',

            seriescolor: 'color',
            serieshighlightcolor: 'highlightcolor',
            seriesylabel: 'yvalue',
            seriesxlabel: 'xvalue',
            datasetlabel: 'label',
            sortingxvalue: 'sorting',
            seriesColorReduceOpacity: false,
            pointRadius: 6,
            pointBorderWidth: 1,
            pointHitRadius: 10,

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
                    sorting: p.sorting || 0,
                })
            ),
        }));
    }

    it('extracts {x, y} objects from datapoints', () => {
        const ctx = makeContext({});
        ctx._data.datasets = makeDatasets([
            {
                sorting: 1, label: 'A', color: '#FF0000',
                points: [
                    { x: 10, y: 20 },
                    { x: 30, y: 40 },
                ],
            },
        ]);

        ctx._processData();

        expect(ctx._chartData.datasets).toHaveLength(1);
        expect(ctx._chartData.datasets[0].data).toEqual([
            { x: 10, y: 20 },
            { x: 30, y: 40 },
        ]);
    });

    it('handles multiple datasets', () => {
        const ctx = makeContext({});
        ctx._data.datasets = makeDatasets([
            {
                sorting: 1, label: 'A',
                points: [{ x: 1, y: 2 }, { x: 3, y: 4 }],
            },
            {
                sorting: 2, label: 'B',
                points: [{ x: 5, y: 6 }, { x: 7, y: 8 }],
            },
        ]);

        ctx._processData();

        expect(ctx._chartData.datasets).toHaveLength(2);
        expect(ctx._chartData.datasets[0].data).toEqual([{ x: 1, y: 2 }, { x: 3, y: 4 }]);
        expect(ctx._chartData.datasets[1].data).toEqual([{ x: 5, y: 6 }, { x: 7, y: 8 }]);
    });

    it('skips empty datasets', () => {
        const ctx = makeContext({});
        ctx._data.datasets = makeDatasets([
            { sorting: 1, label: 'Empty', points: [] },
            { sorting: 2, label: 'Full', points: [{ x: 1, y: 2 }] },
        ]);

        ctx._processData();

        expect(ctx._chartData.datasets).toHaveLength(1);
        expect(ctx._chartData.datasets[0].data).toEqual([{ x: 1, y: 2 }]);
    });

    it('does not produce xlabels (scatter uses numeric axes)', () => {
        const ctx = makeContext({});
        ctx._data.datasets = makeDatasets([
            { sorting: 1, label: 'A', points: [{ x: 10, y: 20 }] },
        ]);

        ctx._processData();

        expect(ctx._chartData.labels).toEqual([]);
    });

    it('calls _createChart and _createLegend', () => {
        const ctx = makeContext({});
        ctx._data.datasets = makeDatasets([
            { sorting: 1, label: 'A', points: [{ x: 1, y: 1 }] },
        ]);

        ctx._processData();

        expect(ctx._createChart).toHaveBeenCalledWith(ctx._chartData);
        expect(ctx._createLegend).toHaveBeenCalledWith(false);
    });
});
