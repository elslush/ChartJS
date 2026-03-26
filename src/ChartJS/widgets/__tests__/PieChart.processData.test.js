import { hexToRgb, sortArrayObj, createDataSets } from '../utils';
const { createMockEntity } = require('./helpers/mockEntity');

const PieChart = require('../PieChart/widget/PieChart').default;

describe('PieChart._processData', () => {
    function makeContext(overrides) {
        return Object.assign({}, PieChart, {
            _hexToRgb: hexToRgb,
            _sortArrayObj: sortArrayObj,
            _createDataSets: createDataSets,
            _createChart: jest.fn(),
            _createLegend: jest.fn(),
            log: jest.fn(),
            id: 'test-pie-1',

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
                label: cfg.label || 'Slice',
                yvalue: cfg.yvalue || 0,
            }),
        }));
    }

    it('processes 3 datasets into chartData array', () => {
        const ctx = makeContext({});
        ctx._data.datasets = makeDatasets([
            { sorting: 1, label: 'Red', color: '#FF0000', yvalue: 30 },
            { sorting: 2, label: 'Green', color: '#00FF00', yvalue: 50 },
            { sorting: 3, label: 'Blue', color: '#0000FF', yvalue: 20 },
        ]);

        ctx._processData();

        // _createChart is called with the chartData array
        const chartDataArg = ctx._createChart.mock.calls[0][0];
        expect(chartDataArg).toHaveLength(3);
        expect(chartDataArg[0].label).toBe('Red');
        expect(chartDataArg[0].value).toBe(30);
        expect(chartDataArg[1].label).toBe('Green');
        expect(chartDataArg[2].label).toBe('Blue');
    });

    it('applies rgba colors when seriesColorReduceOpacity is true', () => {
        const ctx = makeContext({ seriesColorReduceOpacity: true });
        ctx._data.datasets = makeDatasets([
            { sorting: 1, label: 'Test', color: '#FF0000', yvalue: 10 },
        ]);

        ctx._processData();

        const chartDataArg = ctx._createChart.mock.calls[0][0];
        expect(chartDataArg[0].backgroundColor).toBe('rgba(255,0,0,0.5)');
        expect(chartDataArg[0].hoverBackgroundColor).toBe('rgba(255,0,0,0.75)');
    });

    it('uses raw hex colors when seriesColorReduceOpacity is false', () => {
        const ctx = makeContext({ seriesColorReduceOpacity: false });
        ctx._data.datasets = makeDatasets([
            { sorting: 1, label: 'Test', color: '#FF0000', highlightcolor: '#CC0000', yvalue: 10 },
        ]);

        ctx._processData();

        const chartDataArg = ctx._createChart.mock.calls[0][0];
        expect(chartDataArg[0].backgroundColor).toBe('#FF0000');
        expect(chartDataArg[0].hoverBackgroundColor).toBe('#CC0000');
    });

    it('populates _activeDatasets with obj reference (single-series style)', () => {
        const ctx = makeContext({});
        ctx._data.datasets = makeDatasets([
            { sorting: 1, label: 'A', yvalue: 10 },
            { sorting: 2, label: 'B', yvalue: 20 },
        ]);

        ctx._processData();

        expect(ctx._activeDatasets).toHaveLength(2);
        expect(ctx._activeDatasets[0]).toHaveProperty('obj');
        expect(ctx._activeDatasets[0]).toHaveProperty('dataset');
        expect(ctx._activeDatasets[0]).toHaveProperty('idx', 0);
        expect(ctx._activeDatasets[0]).toHaveProperty('active', true);
    });

    it('calls _createLegend with true for single-series', () => {
        const ctx = makeContext({});
        ctx._data.datasets = makeDatasets([
            { sorting: 1, label: 'A', yvalue: 10 },
        ]);

        ctx._processData();

        expect(ctx._createLegend).toHaveBeenCalledWith(true);
    });
});
