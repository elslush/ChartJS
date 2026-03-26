import { hexToRgb, sortArrayObj, createDataSets } from '../utils';

const BarChart = require('../BarChart/widget/BarChart').default;
const LineChart = require('../LineChart/widget/LineChart').default;
const PieChart = require('../PieChart/widget/PieChart').default;
const PolarChart = require('../PolarChart/widget/PolarChart').default;
const RadarChart = require('../RadarChart/widget/RadarChart').default;
const DoughnutChart = require('../DoughnutChart/widget/DoughnutChart').default;
const ScatterChart = require('../ScatterChart/widget/ScatterChart').default;
const BubbleChart = require('../BubbleChart/widget/BubbleChart').default;
const GanttChart = require('../GanttChart/widget/GanttChart').default;
const CoreModule = require('../Core');
const Core = CoreModule.default || CoreModule;

function createMockChartJS() {
    const mockInstance = {
        data: { datasets: [], labels: [] },
        chart: { canvas: document.createElement('canvas') },
        stop: jest.fn(),
        update: jest.fn(),
        bindEvents: jest.fn(),
        resize: jest.fn(),
        destroy: jest.fn(),
        getElementAtEvent: jest.fn().mockReturnValue([]),
        generateLegend: jest.fn().mockReturnValue('<ul></ul>'),
    };
    const constructor = jest.fn(() => mockInstance);
    constructor._instance = mockInstance;
    return constructor;
}

function makeBaseContext(chartProto, overrides) {
    const chartJS = createMockChartJS();
    return Object.assign({}, Core, chartProto, {
        _hexToRgb: hexToRgb,
        _sortArrayObj: sortArrayObj,
        _createDataSets: createDataSets,
        log: jest.fn(),
        connect: jest.fn(),
        id: 'test-chart-1',

        _chartJS: chartJS,
        _ctx: 'mock-2d-context',
        _chart: null,
        _font: 'Helvetica Neue',
        _legendNode: document.createElement('div'),
        _addChartClass: jest.fn(),
        _animationComplete: jest.fn(),
        _restartChart: jest.fn(),
        _resize: jest.fn(),
        _legendCallback: jest.fn(),
        _legendAlternateCallback: jest.fn(),

        // Common config
        scaleShow: true,
        scaleShowLabelsBottom: true,
        scaleShowLabels: true,
        scaleBeginAtZero: false,
        scaleShowVerticalLines: true,
        scaleShowHorizontalLines: true,
        scaleGridLineColor: '#ccc',
        scaleLineWidth: '1',
        xLabel: '',
        yLabel: '',
        chartTitle: '',
        titleSize: 12,
        responsive: true,
        responsiveAnimationDuration: 0,
        showTooltips: true,
        showLegend: true,
        showLegendCustom: false,
        maintainAspectRatio: true,
        chartAnimation: true,
        animationDuration: 1000,
        animationEasing: 'easeOutQuart',
    }, overrides);
}

describe('BarChart._createChart', () => {
    it('creates new Chart with type bar on first render', () => {
        const ctx = makeBaseContext(BarChart, { stacked: false, horizontalStackedBar: false });
        const data = { datasets: [{ data: [1, 2] }], labels: ['A', 'B'] };

        ctx._createChart(data);

        expect(ctx._chartJS).toHaveBeenCalledTimes(1);
        const config = ctx._chartJS.mock.calls[0][1];
        expect(config.type).toBe('bar');
        expect(config.data).toBe(data);
    });

    it('calls _restartChart on re-render when _chart exists', () => {
        const ctx = makeBaseContext(BarChart, { stacked: false, horizontalStackedBar: false });
        ctx._chart = { existing: true };
        const data = { datasets: [{ data: [1] }], labels: ['A'] };

        ctx._createChart(data);

        expect(ctx._restartChart).toHaveBeenCalledWith(data);
        expect(ctx._chartJS).not.toHaveBeenCalled();
    });

    it('sets suggestedMin when scaleBeginAtZero is true', () => {
        const ctx = makeBaseContext(BarChart, {
            stacked: false,
            horizontalStackedBar: false,
            scaleBeginAtZero: true,
        });
        const data = { datasets: [], labels: [] };

        ctx._createChart(data);

        const config = ctx._chartJS.mock.calls[0][1];
        expect(config.options.scales.yAxes[0].ticks.suggestedMin).toBe(0);
    });

    it('falls back to 1.0 for invalid scaleLineWidth', () => {
        const ctx = makeBaseContext(BarChart, {
            stacked: false,
            horizontalStackedBar: false,
            scaleLineWidth: 'invalid',
        });
        const data = { datasets: [], labels: [] };

        ctx._createChart(data);

        const config = ctx._chartJS.mock.calls[0][1];
        expect(config.options.scales.xAxes[0].gridLines.lineWidth).toBe(1.0);
    });
});

describe('LineChart._createChart', () => {
    it('applies maxYValue as ticks.max', () => {
        const ctx = makeBaseContext(LineChart, {
            maxYValue: 100,
            maxTickSize: 0,
            isStacked: false,
            roundY: '',
            pointDot: true,
            pointRadius: 3,
            pointBorderWidth: 1,
            pointHitRadius: 10,
            pointHoverRadius: 4,
            pointHoverBorderWidth: 2,
            datasetStroke: true,
            datasetStrokeWidth: 2,
            datasetFill: true,
        });
        const data = { datasets: [], labels: [] };

        ctx._createChart(data);

        const config = ctx._chartJS.mock.calls[0][1];
        expect(config.options.scales.yAxes[0].ticks.max).toBe(100);
    });

    it('applies roundY in tick callback', () => {
        const ctx = makeBaseContext(LineChart, {
            maxYValue: null,
            maxTickSize: 0,
            isStacked: false,
            roundY: '2',
            pointDot: true,
            pointRadius: 3,
            pointBorderWidth: 1,
            pointHitRadius: 10,
            pointHoverRadius: 4,
            pointHoverBorderWidth: 2,
            datasetStroke: true,
            datasetStrokeWidth: 2,
            datasetFill: true,
        });
        const data = { datasets: [], labels: [] };

        ctx._createChart(data);

        const config = ctx._chartJS.mock.calls[0][1];
        const callback = config.options.scales.yAxes[0].ticks.callback;
        expect(callback(3.14159)).toBe('3.14');
    });
});

describe('PieChart._createChart', () => {
    it('sets cutoutPercentage to 0 for pie type', () => {
        const ctx = makeBaseContext(PieChart, {
            _chartType: 'pie',
            segmentStrokeColor: '#fff',
            segmentShowStroke: true,
            segmentStrokeWidth: 2,
            animateRotate: true,
            animateScale: false,
            percentageInnerCutout: 50,
            numberInside: '',
            _data: { object: { get: () => null }, datasets: [] },
        });
        const data = [{ label: 'A', value: 10, backgroundColor: '#f00', hoverBackgroundColor: '#c00' }];

        ctx._createChart(data);

        const config = ctx._chartJS.mock.calls[0][1];
        expect(config.options.cutoutPercentage).toBe(0);
    });

    it('sets cutoutPercentage from percentageInnerCutout for doughnut type', () => {
        const ctx = makeBaseContext(PieChart, {
            _chartType: 'doughnut',
            segmentStrokeColor: '#fff',
            segmentShowStroke: true,
            segmentStrokeWidth: 2,
            animateRotate: true,
            animateScale: false,
            percentageInnerCutout: 50,
            numberInside: '',
            _data: { object: { get: () => null }, datasets: [] },
        });
        const data = [{ label: 'A', value: 10, backgroundColor: '#f00', hoverBackgroundColor: '#c00' }];

        ctx._createChart(data);

        const config = ctx._chartJS.mock.calls[0][1];
        expect(config.options.cutoutPercentage).toBe(50);
    });
});

describe('PolarChart._createChart', () => {
    it('always creates new Chart without checking _chart (documents memory leak)', () => {
        const ctx = makeBaseContext(PolarChart, {
            chartTitle: '',
            titleSize: 12,
            scaleBeginAtZero: true,
            polarScaleShowLabelBackdrop: true,
            polarScaleBackdropColor: 'rgba(255,255,255,0.75)',
            polarScaleBackdropPaddingY: 2,
            polarScaleBackdropPaddingX: 2,
            polarScaleShowLine: true,
            segmentShowStroke: true,
            segmentStrokeColor: '#fff',
            segmentStrokeWidth: 2,
            animationSteps: 100,
            animateRotate: true,
            animateScale: true,
            showTooltips: true,
        });
        // Simulate existing chart
        ctx._chart = { existing: true };
        const data = [{ label: 'A', value: 5, backgroundColor: '#f00', hoverBackgroundColor: '#c00' }];

        ctx._createChart(data);

        // PolarChart always creates a new chart, never calls _restartChart
        expect(ctx._chartJS).toHaveBeenCalledTimes(1);
    });
});

describe('RadarChart._createChart', () => {
    it('has incorrect scale.ticks.yAxes nesting (documents bug)', () => {
        const ctx = makeBaseContext(RadarChart, {
            scaleBeginAtZero: true,
            scaleShowLine: true,
            angleShowLineOut: true,
            scaleShowLabels: true,
            angleLineColor: 'rgba(0,0,0,0.1)',
            angleLineWidth: 1,
            pointLabelFontFamily: 'Arial',
            pointLabelFontStyle: 'normal',
            pointLabelFontSize: 10,
            pointLabelFontColor: '#666',
            pointDot: true,
            pointDotRadius: 3,
            pointDotStrokeWidth: 1,
            pointHitDetectionRadius: 20,
            datasetStroke: true,
            datasetStrokeWidth: 2,
            datasetFill: true,
        });
        const data = { datasets: [{ data: [1, 2, 3] }], labels: ['A', 'B', 'C'] };

        ctx._createChart(data);

        const config = ctx._chartJS.mock.calls[0][1];
        // Bug: scale.ticks.yAxes is nested incorrectly
        // Should be scale.ticks.beginAtZero, but it's scale.ticks.yAxes[0].ticks.beginAtZero
        expect(config.options.scale.ticks.yAxes).toBeDefined();
        expect(config.options.scale.ticks.yAxes[0].ticks.beginAtZero).toBe(true);
    });
});

describe('ScatterChart._createChart', () => {
    it('creates chart with type scatter and linear X-axis', () => {
        const ctx = makeBaseContext(ScatterChart, {
            pointRadius: 6,
            pointBorderWidth: 1,
            pointHitRadius: 10,
        });
        const data = { datasets: [{ data: [{x: 1, y: 2}] }], labels: [] };

        ctx._createChart(data);

        expect(ctx._chartJS).toHaveBeenCalledTimes(1);
        const config = ctx._chartJS.mock.calls[0][1];
        expect(config.type).toBe('scatter');
        expect(config.options.scales.xAxes[0].type).toBe('linear');
        expect(config.options.scales.xAxes[0].position).toBe('bottom');
    });

    it('sets suggestedMin on both axes when scaleBeginAtZero is true', () => {
        const ctx = makeBaseContext(ScatterChart, {
            scaleBeginAtZero: true,
            pointRadius: 6,
            pointBorderWidth: 1,
            pointHitRadius: 10,
        });
        const data = { datasets: [], labels: [] };

        ctx._createChart(data);

        const config = ctx._chartJS.mock.calls[0][1];
        expect(config.options.scales.xAxes[0].ticks.suggestedMin).toBe(0);
        expect(config.options.scales.yAxes[0].ticks.suggestedMin).toBe(0);
    });
});

describe('BubbleChart._createChart', () => {
    it('creates chart with type bubble and linear X-axis', () => {
        const ctx = makeBaseContext(BubbleChart, {});
        const data = { datasets: [{ data: [{x: 1, y: 2, r: 3}] }], labels: [] };

        ctx._createChart(data);

        expect(ctx._chartJS).toHaveBeenCalledTimes(1);
        const config = ctx._chartJS.mock.calls[0][1];
        expect(config.type).toBe('bubble');
        expect(config.options.scales.xAxes[0].type).toBe('linear');
        expect(config.options.scales.xAxes[0].position).toBe('bottom');
    });

    it('calls _restartChart when _chart already exists', () => {
        const ctx = makeBaseContext(BubbleChart, {});
        ctx._chart = { existing: true };
        const data = { datasets: [], labels: [] };

        ctx._createChart(data);

        expect(ctx._restartChart).toHaveBeenCalledWith(data);
        expect(ctx._chartJS).not.toHaveBeenCalled();
    });
});

describe('GanttChart._createChart', () => {
    it('creates stacked horizontalBar chart with legend disabled', () => {
        const ctx = makeBaseContext(GanttChart, {
            maxDays: 30,
            _ganttTasks: [{label: 'T1', start: 0, end: 5}],
        });
        const data = {
            labels: ['T1'],
            datasets: [
                { data: [0], backgroundColor: 'rgba(0,0,0,0)' },
                { data: [5], backgroundColor: ['#3498db'] },
            ],
        };

        ctx._createChart(data);

        expect(ctx._chartJS).toHaveBeenCalledTimes(1);
        const config = ctx._chartJS.mock.calls[0][1];
        expect(config.type).toBe('horizontalBar');
        expect(config.options.scales.xAxes[0].stacked).toBe(true);
        expect(config.options.scales.yAxes[0].stacked).toBe(true);
        expect(config.options.legend.display).toBe(false);
        expect(config.options.scales.xAxes[0].ticks.max).toBe(30);
    });

    it('does not set max when maxDays is 0', () => {
        const ctx = makeBaseContext(GanttChart, {
            maxDays: 0,
            _ganttTasks: [],
        });
        const data = { labels: [], datasets: [{ data: [] }, { data: [] }] };

        ctx._createChart(data);

        const config = ctx._chartJS.mock.calls[0][1];
        expect(config.options.scales.xAxes[0].ticks.max).toBeUndefined();
    });
});
