import { hexToRgb } from '../utils';

const StackedBarChart = require('../StackedBarChart/widget/StackedBarChart').default;

describe('StackedBarChart', () => {
    it('has stacked property set to true by default', () => {
        expect(StackedBarChart.stacked).toBe(true);
    });

    describe('_createSet', () => {
        function makeContext(overrides) {
            return Object.assign({}, StackedBarChart, {
                _hexToRgb: hexToRgb,
                log: jest.fn(),
            }, overrides);
        }

        it('includes pointColor in output (differs from BarChart)', () => {
            const ctx = makeContext({
                scaleShowLabelsBottom: true,
                seriesColorReduceOpacity: true,
            });

            const result = ctx._createSet('Stacked', '#00FF00', '#00CC00', [5, 10]);

            expect(result.pointColor).toBe('rgba(0,255,0,0.8)');
            expect(result.data).toEqual([5, 10]);
        });

        it('uses 0.5 opacity for borderColor (not 0.8 like BarChart)', () => {
            const ctx = makeContext({
                scaleShowLabelsBottom: true,
                seriesColorReduceOpacity: true,
            });

            const result = ctx._createSet('Test', '#FF0000', '#CC0000', [1]);

            expect(result.borderColor).toBe('rgba(255,0,0,0.5)');
        });
    });
});
