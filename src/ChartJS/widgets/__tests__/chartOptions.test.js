const CoreModule = require('../Core');
const Core = CoreModule.default || CoreModule;

describe('Core._chartOptions', () => {
    function makeContext(overrides) {
        return Object.assign({}, Core, {
            log: jest.fn(),
            _font: 'Helvetica Neue',
            chartTitle: '',
            titleSize: 12,
            responsive: true,
            responsiveAnimationDuration: 0,
            showTooltips: true,
            showLegend: true,
            maintainAspectRatio: true,
            chartAnimation: true,
            animationDuration: 1000,
            animationEasing: 'easeOutQuart',
        }, overrides);
    }

    it('sets title display to true when chartTitle is non-empty', () => {
        const ctx = makeContext({ chartTitle: 'Sales Report' });
        const opts = ctx._chartOptions({});

        expect(opts.title.display).toBe(true);
        expect(opts.title.text).toBe('Sales Report');
    });

    it('sets title display to false when chartTitle is empty', () => {
        const ctx = makeContext({ chartTitle: '' });
        const opts = ctx._chartOptions({});

        expect(opts.title.display).toBe(false);
    });

    it('passes through responsive setting', () => {
        const ctx = makeContext({ responsive: true });
        const opts = ctx._chartOptions({});
        expect(opts.responsive).toBe(true);

        const ctx2 = makeContext({ responsive: false });
        const opts2 = ctx2._chartOptions({});
        expect(opts2.responsive).toBe(false);
    });

    it('sets tooltips enabled based on showTooltips', () => {
        const ctx = makeContext({ showTooltips: false });
        const opts = ctx._chartOptions({});
        expect(opts.tooltips.enabled).toBe(false);
    });

    it('sets legend display based on showLegend', () => {
        const ctx = makeContext({ showLegend: true });
        const opts = ctx._chartOptions({});
        expect(opts.legend.display).toBe(true);
    });

    it('disables animation when chartAnimation is false', () => {
        const ctx = makeContext({ chartAnimation: false });
        const opts = ctx._chartOptions({});
        expect(opts.animation).toBe(false);
    });

    it('configures animation duration and easing when chartAnimation is true', () => {
        const ctx = makeContext({
            chartAnimation: true,
            animationDuration: 500,
            animationEasing: 'easeInOutQuad',
        });
        const opts = ctx._chartOptions({});

        expect(opts.animation.duration).toBe(500);
        expect(opts.animation.easing).toBe('easeInOutQuad');
    });

    it('merges custom scales into output', () => {
        const ctx = makeContext({});
        const opts = ctx._chartOptions({
            scales: {
                yAxes: [{ ticks: { beginAtZero: true } }],
            },
        });

        expect(opts.scales).toBeDefined();
        expect(opts.scales.yAxes[0].ticks.beginAtZero).toBe(true);
    });

    it('merges legendCallback into output', () => {
        const callback = jest.fn();
        const ctx = makeContext({});
        const opts = ctx._chartOptions({ legendCallback: callback });

        expect(opts.legendCallback).toBe(callback);
    });
});
