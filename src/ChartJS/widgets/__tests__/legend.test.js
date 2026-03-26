const CoreModule = require('../Core');
const Core = CoreModule.default || CoreModule;
import { hexToRgb, sortArrayObj, createDataSets } from '../utils';

describe('Core legend methods', () => {
    function makeContext(overrides) {
        return Object.assign({}, Core, {
            _hexToRgb: hexToRgb,
            _sortArrayObj: sortArrayObj,
            _createDataSets: createDataSets,
            log: jest.fn(),
            connect: jest.fn(),
            id: 'test-legend-1',
            _font: 'Helvetica Neue',
            _legendNode: document.createElement('div'),
            showLegendCustom: true,
            _chart: null,
            _activeDatasets: [],
            _chartData: { datasets: [], labels: [] },
            _execute: jest.fn(),
        }, overrides);
    }

    describe('_legendCallback', () => {
        it('generates legend HTML for 2 datasets', () => {
            const ctx = makeContext({});
            const chart = {
                id: 'chart-1',
                data: {
                    datasets: [
                        { label: 'Sales', backgroundColor: '#FF0000' },
                        { label: 'Revenue', backgroundColor: '#00FF00' },
                    ],
                },
            };

            const html = ctx._legendCallback(chart);

            expect(html).toContain('<ul');
            expect(html).toContain('chart-legend');
            expect(html).toContain('Sales');
            expect(html).toContain('Revenue');
            expect(html).toContain('#FF0000');
            expect(html).toContain('#00FF00');
        });

        it('renders li element even when label is empty', () => {
            const ctx = makeContext({});
            const chart = {
                id: 'chart-2',
                data: {
                    datasets: [
                        { label: '', backgroundColor: '#000' },
                    ],
                },
            };

            const html = ctx._legendCallback(chart);

            expect(html).toContain('<li');
            expect(html).toContain('#000');
        });

        it('renders XSS payload in label without escaping (documents vulnerability)', () => {
            const ctx = makeContext({});
            const chart = {
                id: 'chart-3',
                data: {
                    datasets: [
                        { label: '<img onerror=alert(1)>', backgroundColor: '#000' },
                    ],
                },
            };

            const html = ctx._legendCallback(chart);

            // The XSS payload is included verbatim — this documents the vulnerability
            expect(html).toContain('<img onerror=alert(1)>');
        });
    });

    describe('_legendAlternateCallback', () => {
        it('generates legend HTML from data points (single-series)', () => {
            const ctx = makeContext({});
            const chart = {
                id: 'chart-4',
                data: {
                    labels: ['Red', 'Blue', 'Green'],
                    datasets: [{
                        data: [10, 20, 30],
                        backgroundColor: ['#FF0000', '#0000FF', '#00FF00'],
                    }],
                },
            };

            const html = ctx._legendAlternateCallback(chart);

            expect(html).toContain('Red');
            expect(html).toContain('Blue');
            expect(html).toContain('Green');
            expect(html).toContain('#FF0000');
            expect(html).toContain('#0000FF');
        });
    });

    describe('_createLegend', () => {
        it('populates legendNode when showLegendCustom is true', () => {
            const ctx = makeContext({ showLegendCustom: true });
            ctx._chart = {
                generateLegend: jest.fn().mockReturnValue('<ul><li>Legend</li></ul>'),
            };

            ctx._createLegend(false);

            expect(ctx._legendNode.innerHTML).toContain('Legend');
        });

        it('does not populate legendNode when showLegendCustom is false', () => {
            const ctx = makeContext({ showLegendCustom: false });
            ctx._legendNode.innerHTML = 'original';
            ctx._chart = {
                generateLegend: jest.fn(),
            };

            ctx._createLegend(false);

            expect(ctx._legendNode.innerHTML).toBe('original');
            expect(ctx._chart.generateLegend).not.toHaveBeenCalled();
        });
    });

    describe('_onClickLegend', () => {
        it('toggles active state off for clicked legend item', () => {
            const dataset1 = { label: 'A', data: [1, 2] };
            const dataset2 = { label: 'B', data: [3, 4] };
            const ctx = makeContext({
                _activeDatasets: [
                    { dataset: dataset1, idx: 0, active: true },
                    { dataset: dataset2, idx: 1, active: true },
                ],
                _chartData: {
                    labels: ['X', 'Y'],
                    datasets: [dataset1, dataset2],
                },
                _createChart: jest.fn(),
            });

            // Mock domQuery to return fake li elements
            const mockLi1 = document.createElement('li');
            const mockLi2 = document.createElement('li');
            ctx._legendNode.appendChild(document.createElement('ul'));
            ctx._legendNode.querySelector('ul').appendChild(mockLi1);
            ctx._legendNode.querySelector('ul').appendChild(mockLi2);

            // Need to mock the dojo/query and dom-class for this test
            const domQuery = require('dojo/query');
            const domClass = require('dojo/dom-class');
            domQuery.mockReturnValue = undefined;
            // Override the imported domQuery to return our mock elements
            jest.spyOn({ domQuery }, 'domQuery').mockReturnValue([mockLi1, mockLi2]);

            ctx._onClickLegend(0, false);

            expect(ctx._activeDatasets[0].active).toBe(false);
        });

        it('toggles active state back on for re-clicked item', () => {
            const dataset1 = { label: 'A', data: [1] };
            const ctx = makeContext({
                _activeDatasets: [
                    { dataset: dataset1, idx: 0, active: false },
                ],
                _chartData: {
                    labels: ['X'],
                    datasets: [dataset1],
                },
                _createChart: jest.fn(),
            });

            const mockLi = document.createElement('li');
            ctx._legendNode.appendChild(mockLi);

            ctx._onClickLegend(0, false);

            expect(ctx._activeDatasets[0].active).toBe(true);
        });
    });

    describe('_onClickChart', () => {
        it('executes onclickDataSetMf when clicking a chart element', async () => {
            const datasetEntity = {
                getGuid: () => 'dataset-guid-1',
            };
            const ctx = makeContext({
                onclickDataSetMf: 'Module.OnClick',
                onclickDataPointMf: '',
                onclickmf: '',
                _data: {
                    datasets: [
                        { dataset: datasetEntity, points: [] },
                    ],
                },
                _chart: {
                    getElementAtEvent: jest.fn().mockReturnValue([
                        { _datasetIndex: 0, _index: 0 },
                    ]),
                },
                _chartType: 'bar',
            });

            await ctx._onClickChart({ type: 'click' });

            expect(ctx._execute).toHaveBeenCalledWith('Module.OnClick', 'dataset-guid-1');
        });

        it('uses _activeDatasets for pie chart clicks', async () => {
            const activeObj = { getGuid: () => 'active-guid-1' };
            const ctx = makeContext({
                onclickDataSetMf: 'Module.OnClick',
                onclickDataPointMf: '',
                onclickmf: '',
                _chartType: 'pie',
                _data: {
                    datasets: [
                        { dataset: { getGuid: () => 'ds-guid' }, points: [] },
                    ],
                },
                _activeDatasets: [
                    { obj: activeObj, idx: 0, active: true },
                ],
                _chart: {
                    getElementAtEvent: jest.fn().mockReturnValue([
                        { _datasetIndex: 0, _index: 0 },
                    ]),
                },
            });

            await ctx._onClickChart({ type: 'click' });

            expect(ctx._execute).toHaveBeenCalledWith('Module.OnClick', 'active-guid-1');
        });
    });
});
