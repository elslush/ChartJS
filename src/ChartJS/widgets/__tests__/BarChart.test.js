import { hexToRgb } from '../utils';

const BarChart = require('../BarChart/widget/BarChart').default;

describe('BarChart._createSet', () => {
    function makeContext(overrides) {
        return Object.assign({}, BarChart, {
            _hexToRgb: hexToRgb,
            log: jest.fn(),
        }, overrides);
    }

    it('applies opacity reduction when seriesColorReduceOpacity is true', () => {
        const ctx = makeContext({
            scaleShowLabelsBottom: true,
            seriesColorReduceOpacity: true,
        });

        const result = ctx._createSet('Sales', '#FF0000', '#CC0000', [10, 20, 30]);

        expect(result.label).toBe('Sales');
        expect(result.data).toEqual([10, 20, 30]);
        expect(result.backgroundColor).toBe('rgba(255,0,0,0.5)');
        expect(result.borderColor).toBe('rgba(255,0,0,0.8)');
        expect(result.hoverBackgroundColor).toBe('rgba(204,0,0,0.75)');
        expect(result.hoverBorderColor).toBe('rgba(204,0,0,1)');
    });

    it('uses raw colors when seriesColorReduceOpacity is false', () => {
        const ctx = makeContext({
            scaleShowLabelsBottom: true,
            seriesColorReduceOpacity: false,
        });

        const result = ctx._createSet('Sales', '#FF0000', '#CC0000', [10]);

        expect(result.backgroundColor).toBe('#FF0000');
        expect(result.borderColor).toBe('#FF0000');
        expect(result.hoverBackgroundColor).toBe('#CC0000');
        expect(result.hoverBorderColor).toBe('#CC0000');
    });

    it('hides label when scaleShowLabelsBottom is false', () => {
        const ctx = makeContext({
            scaleShowLabelsBottom: false,
            seriesColorReduceOpacity: false,
        });

        const result = ctx._createSet('Sales', '#FF0000', '#CC0000', [10]);

        expect(result.label).toBe('');
    });

    it('shows label when scaleShowLabelsBottom is true', () => {
        const ctx = makeContext({
            scaleShowLabelsBottom: true,
            seriesColorReduceOpacity: false,
        });

        const result = ctx._createSet('My Label', '#FF0000', '#CC0000', [5]);

        expect(result.label).toBe('My Label');
    });

    it('passes through data array unchanged', () => {
        const ctx = makeContext({
            scaleShowLabelsBottom: true,
            seriesColorReduceOpacity: false,
        });
        const points = [1, 2, 3, 4, 5];

        const result = ctx._createSet('Test', '#000', '#111', points);

        expect(result.data).toBe(points);
    });
});
