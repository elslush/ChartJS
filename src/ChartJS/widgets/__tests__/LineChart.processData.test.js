import { hexToRgb, sortArrayObj } from '../utils';
const { createMockEntity } = require('./helpers/mockEntity');

const LineChart = require('../LineChart/widget/LineChart').default;

describe('LineChart._processData', () => {
    function makeContext(overrides) {
        return Object.assign({}, LineChart, {
            _hexToRgb: hexToRgb,
            _sortArrayObj: sortArrayObj,
            _sortArrayMx: jest.fn((values) => values),
            _createChart: jest.fn(),
            _createLegend: jest.fn(),
            _addChartClass: jest.fn(),
            _restartChart: jest.fn(),
            log: jest.fn(),
            id: 'test-line-1',

            seriescolor: 'color',
            serieshighlightcolor: 'highlightcolor',
            seriesylabel: 'yvalue',
            seriesxlabel: 'xlabel',
            datasetlabel: 'label',
            sortingxvalue: 'sorting',
            scaleShowLabelsBottom: true,
            seriesColorReduceOpacity: true,
            seriescolorfilled: true,
            bezierCurve: true,
            bezierCurveTension: '0.4',

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
                label: cfg.label || 'Line',
            }),
            points: (cfg.points || []).map(p =>
                createMockEntity({
                    xlabel: p.xlabel || 'X',
                    yvalue: p.yvalue !== undefined ? p.yvalue : 0,
                    sorting: p.sorting || 0,
                })
            ),
        }));
    }

    it('sets tension from bezierCurveTension when bezierCurve is true', () => {
        const ctx = makeContext({
            bezierCurve: true,
            bezierCurveTension: '0.2',
        });
        ctx._data.datasets = makeDatasets([
            { sorting: 1, label: 'A', points: [{ xlabel: 'X', yvalue: 10 }] },
        ]);

        ctx._processData();

        expect(ctx._chartData.datasets[0].tension).toBe(0.2);
    });

    it('sets tension to 0 when bezierCurve is false', () => {
        const ctx = makeContext({
            bezierCurve: false,
            bezierCurveTension: '0.4',
        });
        ctx._data.datasets = makeDatasets([
            { sorting: 1, label: 'A', points: [{ xlabel: 'X', yvalue: 10 }] },
        ]);

        ctx._processData();

        expect(ctx._chartData.datasets[0].tension).toBe(0);
    });

    it('pushes null for empty string point values', () => {
        const ctx = makeContext({});
        ctx._data.datasets = makeDatasets([
            { sorting: 1, label: 'A', points: [{ xlabel: 'X', yvalue: '' }] },
        ]);

        ctx._processData();

        expect(ctx._chartData.datasets[0].data).toEqual([null]);
    });

    it('sets fill from seriescolorfilled', () => {
        const ctx = makeContext({ seriescolorfilled: true });
        ctx._data.datasets = makeDatasets([
            { sorting: 1, label: 'A', points: [{ xlabel: 'X', yvalue: 10 }] },
        ]);

        ctx._processData();

        expect(ctx._chartData.datasets[0].fill).toBe(true);
    });

    it('uses empty string for xlabels when scaleShowLabelsBottom is false', () => {
        const ctx = makeContext({ scaleShowLabelsBottom: false });
        ctx._data.datasets = makeDatasets([
            { sorting: 1, label: 'A', points: [{ xlabel: 'January', yvalue: 10 }] },
        ]);

        ctx._processData();

        expect(ctx._chartData.labels).toEqual(['']);
    });
});
