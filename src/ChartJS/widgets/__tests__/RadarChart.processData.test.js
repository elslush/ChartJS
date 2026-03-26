import { hexToRgb, sortArrayObj } from '../utils';
const { createMockEntity } = require('./helpers/mockEntity');

const RadarChart = require('../RadarChart/widget/RadarChart').default;

describe('RadarChart._processData', () => {
    function makeContext(overrides) {
        return Object.assign({}, RadarChart, {
            _hexToRgb: hexToRgb,
            _sortArrayObj: sortArrayObj,
            _sortArrayMx: jest.fn((values) => values),
            _createChart: jest.fn(),
            _createLegend: jest.fn(),
            _addChartClass: jest.fn(),
            _restartChart: jest.fn(),
            log: jest.fn(),
            id: 'test-radar-1',

            seriescolor: 'color',
            serieshighlightcolor: 'highlightcolor',
            seriesylabel: 'yvalue',
            seriesxlabel: 'xlabel',
            datasetlabel: 'label',
            sortingxvalue: 'sorting',
            scaleShowLabelsBottom: true,
            seriesColorReduceOpacity: true,

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
                label: cfg.label || 'Radar',
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

    it('creates dataset without fill or tension properties (unlike LineChart)', () => {
        const ctx = makeContext({});
        ctx._data.datasets = makeDatasets([
            { sorting: 1, label: 'A', points: [{ xlabel: 'Speed', yvalue: 8 }] },
        ]);

        ctx._processData();

        const dataset = ctx._chartData.datasets[0];
        expect(dataset).not.toHaveProperty('fill');
        expect(dataset).not.toHaveProperty('tension');
        expect(dataset).toHaveProperty('data');
        expect(dataset).toHaveProperty('label');
    });

    it('always includes labels regardless of scaleShowLabelsBottom (differs from BarChart)', () => {
        const ctx = makeContext({ scaleShowLabelsBottom: false });
        ctx._data.datasets = makeDatasets([
            {
                sorting: 1, label: 'A',
                points: [
                    { xlabel: 'Speed', yvalue: 8 },
                    { xlabel: 'Power', yvalue: 6 },
                ],
            },
        ]);

        ctx._processData();

        // RadarChart always pushes xlabels (no scaleShowLabelsBottom check in xlabels push)
        expect(ctx._chartData.labels).toContain('Speed');
        expect(ctx._chartData.labels).toContain('Power');
    });
});
