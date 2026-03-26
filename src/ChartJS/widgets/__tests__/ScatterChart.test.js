import { hexToRgb } from '../utils';

const ScatterChart = require('../ScatterChart/widget/ScatterChart').default;

describe('ScatterChart._createSet', () => {
    function makeContext(overrides) {
        return Object.assign({}, ScatterChart, {
            _hexToRgb: hexToRgb,
            log: jest.fn(),
        }, overrides);
    }

    it('applies opacity reduction when seriesColorReduceOpacity is true', () => {
        const ctx = makeContext({
            seriesColorReduceOpacity: true,
            pointRadius: 6,
            pointBorderWidth: 1,
            pointHitRadius: 10,
        });

        const points = [{x: 1, y: 2}, {x: 3, y: 4}];
        const result = ctx._createSet('Group A', '#FF0000', '#CC0000', points);

        expect(result.label).toBe('Group A');
        expect(result.data).toEqual(points);
        expect(result.backgroundColor).toBe('rgba(255,0,0,0.5)');
        expect(result.borderColor).toBe('rgba(255,0,0,0.8)');
        expect(result.hoverBackgroundColor).toBe('rgba(204,0,0,0.75)');
        expect(result.hoverBorderColor).toBe('rgba(204,0,0,1)');
        expect(result.pointRadius).toBe(6);
        expect(result.pointBorderWidth).toBe(1);
        expect(result.pointHitRadius).toBe(10);
    });

    it('uses raw colors when seriesColorReduceOpacity is false', () => {
        const ctx = makeContext({
            seriesColorReduceOpacity: false,
            pointRadius: 4,
            pointBorderWidth: 2,
            pointHitRadius: 8,
        });

        const result = ctx._createSet('Group B', '#00FF00', '#00CC00', [{x: 5, y: 6}]);

        expect(result.backgroundColor).toBe('#00FF00');
        expect(result.borderColor).toBe('#00FF00');
        expect(result.hoverBackgroundColor).toBe('#00CC00');
        expect(result.hoverBorderColor).toBe('#00CC00');
    });

    it('includes point settings from widget config', () => {
        const ctx = makeContext({
            seriesColorReduceOpacity: false,
            pointRadius: 12,
            pointBorderWidth: 3,
            pointHitRadius: 20,
        });

        const result = ctx._createSet('Test', '#000', '#111', [{x: 0, y: 0}]);

        expect(result.pointRadius).toBe(12);
        expect(result.pointBorderWidth).toBe(3);
        expect(result.pointHitRadius).toBe(20);
    });
});
