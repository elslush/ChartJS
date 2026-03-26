import { hexToRgb, sortArrayObj, createDataSets } from '../utils';

describe('hexToRgb', () => {
    it('converts standard 6-digit hex to rgba', () => {
        expect(hexToRgb('#FF0000', '1')).toBe('rgba(255,0,0,1)');
    });

    it('converts hex without # prefix', () => {
        expect(hexToRgb('00FF00', '0.5')).toBe('rgba(0,255,0,0.5)');
    });

    it('converts shorthand 3-digit hex', () => {
        expect(hexToRgb('#03F', '0.8')).toBe('rgba(0,51,255,0.8)');
    });

    it('converts black with zero alpha', () => {
        expect(hexToRgb('#000000', '0')).toBe('rgba(0,0,0,0)');
    });

    it('converts white', () => {
        expect(hexToRgb('#FFFFFF', '1')).toBe('rgba(255,255,255,1)');
    });

    it('returns default gray for null', () => {
        expect(hexToRgb(null, '0.5')).toBe('rgba(220,220,220,0.5)');
    });

    it('returns default gray for undefined', () => {
        expect(hexToRgb(undefined, '0.5')).toBe('rgba(220,220,220,0.5)');
    });

    it('returns default gray for invalid string', () => {
        expect(hexToRgb('not-a-color', '0.5')).toBe('rgba(220,220,220,0.5)');
    });

    it('returns default gray for rgb() string input', () => {
        expect(hexToRgb('rgb(255,0,0)', '0.5')).toBe('rgba(220,220,220,0.5)');
    });

    it('returns default gray for empty string', () => {
        expect(hexToRgb('', '1')).toBe('rgba(220,220,220,1)');
    });

    it('converts shorthand lowercase hex', () => {
        expect(hexToRgb('#abc', '0.3')).toBe('rgba(170,187,204,0.3)');
    });
});

describe('sortArrayObj', () => {
    it('sorts by sorting property ascending', () => {
        const input = [
            { sorting: 3, label: 'c' },
            { sorting: 1, label: 'a' },
            { sorting: 2, label: 'b' },
        ];
        const result = sortArrayObj(input);
        expect(result.map(r => r.label)).toEqual(['a', 'b', 'c']);
    });

    it('does not mutate original array', () => {
        const input = [{ sorting: 2 }, { sorting: 1 }];
        sortArrayObj(input);
        expect(input[0].sorting).toBe(2);
    });

    it('handles equal sorting values', () => {
        const input = [
            { sorting: 1, label: 'a' },
            { sorting: 1, label: 'b' },
        ];
        const result = sortArrayObj(input);
        expect(result).toHaveLength(2);
    });

    it('handles empty array', () => {
        expect(sortArrayObj([])).toEqual([]);
    });

    it('coerces string sorting values to numbers', () => {
        const input = [
            { sorting: '3', label: 'c' },
            { sorting: '1', label: 'a' },
        ];
        expect(sortArrayObj(input)[0].label).toBe('a');
    });

    it('handles negative sorting values', () => {
        const input = [
            { sorting: -5, label: 'a' },
            { sorting: 10, label: 'c' },
            { sorting: 0, label: 'b' },
        ];
        const result = sortArrayObj(input);
        expect(result.map(r => r.sorting)).toEqual([-5, 0, 10]);
    });

    it('handles single element', () => {
        const input = [{ sorting: 1, label: 'a' }];
        const result = sortArrayObj(input);
        expect(result).toEqual([{ sorting: 1, label: 'a' }]);
    });
});

describe('createDataSets', () => {
    it('transforms flat data into Chart.js structure', () => {
        const input = [
            { label: 'Red', value: 10, backgroundColor: '#FF0000', hoverBackgroundColor: '#CC0000' },
            { label: 'Blue', value: 20, backgroundColor: '#0000FF', hoverBackgroundColor: '#0000CC' },
        ];

        const result = createDataSets(input);

        expect(result.labels).toEqual(['Red', 'Blue']);
        expect(result.datasets).toHaveLength(1);
        expect(result.datasets[0].data).toEqual([10, 20]);
        expect(result.datasets[0].backgroundColor).toEqual(['#FF0000', '#0000FF']);
        expect(result.datasets[0].hoverBackgroundColor).toEqual(['#CC0000', '#0000CC']);
    });

    it('returns empty structure for empty input', () => {
        const result = createDataSets([]);
        expect(result.labels).toEqual([]);
        expect(result.datasets[0].data).toEqual([]);
    });

    it('handles single item', () => {
        const input = [
            { label: 'One', value: 42, backgroundColor: '#000', hoverBackgroundColor: '#111' },
        ];
        const result = createDataSets(input);
        expect(result.labels).toEqual(['One']);
        expect(result.datasets[0].data).toEqual([42]);
    });

    it('preserves zero values', () => {
        const input = [
            { label: 'Zero', value: 0, backgroundColor: '#000', hoverBackgroundColor: '#111' },
        ];
        const result = createDataSets(input);
        expect(result.datasets[0].data).toEqual([0]);
    });
});
