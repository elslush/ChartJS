import { hexToRgb, sortArrayObj, createDataSets } from '../utils';
const { createMockEntity } = require('./helpers/mockEntity');

const PolarChart = require('../PolarChart/widget/PolarChart').default;

describe('PolarChart._processData', () => {
    function makeContext(overrides) {
        return Object.assign({}, PolarChart, {
            _hexToRgb: hexToRgb,
            _sortArrayObj: sortArrayObj,
            _createDataSets: createDataSets,
            _createChart: jest.fn(),
            _createLegend: jest.fn(),
            log: jest.fn(),
            id: 'test-polar-1',

            seriescolor: 'color',
            serieshighlightcolor: 'highlightcolor',
            seriesylabel: 'yvalue',
            datasetlabel: 'label',
            datasetsorting: 'sorting',
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
                label: cfg.label || 'Segment',
                yvalue: cfg.yvalue || 0,
            }),
        }));
    }

    it('produces same data structure as PieChart', () => {
        const ctx = makeContext({});
        ctx._data.datasets = makeDatasets([
            { sorting: 1, label: 'A', color: '#FF0000', yvalue: 10 },
            { sorting: 2, label: 'B', color: '#00FF00', yvalue: 20 },
        ]);

        ctx._processData();

        const chartDataArg = ctx._createChart.mock.calls[0][0];
        expect(chartDataArg).toHaveLength(2);
        expect(chartDataArg[0]).toHaveProperty('label', 'A');
        expect(chartDataArg[0]).toHaveProperty('value', 10);
        expect(chartDataArg[0]).toHaveProperty('backgroundColor');
        expect(chartDataArg[0]).toHaveProperty('hoverBackgroundColor');
    });

    it('does not check this._chart before calling _createChart (documents memory leak)', () => {
        const ctx = makeContext({});
        // Simulate an existing chart instance
        ctx._chart = { existing: true };
        ctx._data.datasets = makeDatasets([
            { sorting: 1, label: 'A', yvalue: 10 },
        ]);

        ctx._processData();

        // _createChart is always called (no conditional check for existing _chart in _processData)
        expect(ctx._createChart).toHaveBeenCalledTimes(1);
    });
});
