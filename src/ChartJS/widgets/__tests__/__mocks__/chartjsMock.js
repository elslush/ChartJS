function MockChart(ctx, config) {
    this.ctx = ctx;
    this.config = config;
    this.data = config.data || { datasets: [], labels: [] };
    this.chart = {
        canvas: document.createElement('canvas'),
    };
    this.stop = jest.fn();
    this.update = jest.fn();
    this.bindEvents = jest.fn();
    this.resize = jest.fn();
    this.destroy = jest.fn();
    this.getElementAtEvent = jest.fn().mockReturnValue([]);
    this.generateLegend = jest.fn().mockReturnValue('<ul></ul>');
}

MockChart.defaults = {
    global: {
        tooltipEvents: [],
        tooltipXOffset: 0,
    },
};

module.exports = MockChart;
