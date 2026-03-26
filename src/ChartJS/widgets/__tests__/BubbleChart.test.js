import { hexToRgb } from '../utils';

const BubbleChart = require('../BubbleChart/widget/BubbleChart').default;

describe('BubbleChart._createSet', () => {
    function makeContext(overrides) {
        return Object.assign({}, BubbleChart, {
            _hexToRgb: hexToRgb,
            log: jest.fn(),
        }, overrides);
    }

    it('applies opacity reduction when seriesColorReduceOpacity is true', () => {
        const ctx = makeContext({ seriesColorReduceOpacity: true });

        const points = [{x: 1, y: 2, r: 5}];
        const result = ctx._createSet('Bubbles', '#3498db', '#2980b9', points);

        expect(result.label).toBe('Bubbles');
        expect(result.data).toEqual(points);
        expect(result.backgroundColor).toBe('rgba(52,152,219,0.5)');
        expect(result.borderColor).toBe('rgba(52,152,219,0.8)');
        expect(result.hoverBackgroundColor).toBe('rgba(41,128,185,0.75)');
        expect(result.hoverBorderColor).toBe('rgba(41,128,185,1)');
    });

    it('uses raw colors when seriesColorReduceOpacity is false', () => {
        const ctx = makeContext({ seriesColorReduceOpacity: false });

        const result = ctx._createSet('Test', '#FF0000', '#CC0000', [{x: 0, y: 0, r: 3}]);

        expect(result.backgroundColor).toBe('#FF0000');
        expect(result.borderColor).toBe('#FF0000');
        expect(result.hoverBackgroundColor).toBe('#CC0000');
        expect(result.hoverBorderColor).toBe('#CC0000');
    });

    it('passes through {x, y, r} data array', () => {
        const ctx = makeContext({ seriesColorReduceOpacity: false });
        const points = [{x: 10, y: 20, r: 15}, {x: 30, y: 40, r: 8}];

        const result = ctx._createSet('Label', '#000', '#111', points);

        expect(result.data).toBe(points);
    });
});
