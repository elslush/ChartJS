import defineWidget from 'widget-base-helpers/helpers/define-widget';
import Core from 'Core';
import on from 'dojo/on';
import { hitch } from 'dojo/_base/lang';

import '../../ChartJS.scss';

export default defineWidget('ScatterChart.widget.ScatterChart', null, {

    _chartType: 'scatter',

    _chartClass: 'chartjs-scatter-chart',

    pointRadius: 6,
    pointBorderWidth: 1,
    pointHitRadius: 10,

    _processData() {
        this.log('_processData');

        let set = {
            points: [],
        };
        let color = "";
        let highlightcolor = "";
        let label = "";
        let j = null;
        let i = null;
        let _set = null;

        this._chartData.datasets = [];
        this._chartData.labels = [];

        const sets = this._data.datasets = this._sortArrayObj(this._data.datasets);

        for (j = 0; j < sets.length; j++) {
            set = sets[ j ];

            if (0 === set.points.length) {
                logger.warn(this.id + " - empty dataset");
                continue;
            }

            set.points = this._sortArrayMx(set.points, this.sortingxvalue);
            color = set.dataset.get(this.seriescolor);
            highlightcolor = this.serieshighlightcolor ? set.dataset.get(this.serieshighlightcolor) : color;
            label = set.dataset.get(this.datasetlabel);

            const points = [];
            for (i = 0; i < set.points.length; i++) {
                points.push({
                    x: +set.points[ i ].get(this.seriesxlabel),
                    y: +set.points[ i ].get(this.seriesylabel),
                });
            }

            _set = this._createSet(label, color, highlightcolor, points);

            this._chartData.datasets.push(_set);
            this._activeDatasets.push({
                dataset: _set,
                idx: j,
                active: true,
            });
        }

        this._createChart(this._chartData);

        this._createLegend(false);
    },

    _createSet(label, color, highlightcolor, points) {
        return {
            label: label,
            backgroundColor: this.seriesColorReduceOpacity ? this._hexToRgb(color, "0.5") : color,
            borderColor: this.seriesColorReduceOpacity ? this._hexToRgb(color, "0.8") : color,
            hoverBackgroundColor: this.seriesColorReduceOpacity ? this._hexToRgb(highlightcolor, "0.75") : highlightcolor,
            hoverBorderColor: this.seriesColorReduceOpacity ? this._hexToRgb(highlightcolor, "1") : highlightcolor,
            data: points,
            pointRadius: this.pointRadius,
            pointBorderWidth: this.pointBorderWidth,
            pointHitRadius: this.pointHitRadius,
        };
    },

    _createChart(data) {
        this.log('_createChart');

        if (this._chart) {
            this._restartChart(data);
        } else {
            let lineWidth = parseFloat(this.scaleLineWidth);
            if (isNaN(lineWidth)) {
                lineWidth = 1.0;
            }

            const chartProperties = {
                type: this._chartType,
                data: data,
                options: this._chartOptions({

                    scales: {
                        xAxes: [{
                            type: 'linear',
                            position: 'bottom',
                            display: this.scaleShow,
                            scaleLabel: {
                                display: '' !== this.xLabel,
                                labelString: '' !== this.xLabel ? this.xLabel : '',
                                fontFamily: this._font,
                            },
                            ticks: {
                                fontFamily: this._font,
                                beginAtZero: this.scaleBeginAtZero,
                            },
                            gridLines: {
                                display: this.scaleShowVerticalLines,
                                color: this.scaleGridLineColor,
                                lineWidth,
                            },
                        }],
                        yAxes: [{
                            display: this.scaleShow,
                            scaleLabel: {
                                display: '' !== this.yLabel,
                                labelString: '' !== this.yLabel ? this.yLabel : '',
                                fontFamily: this._font,
                            },
                            ticks: {
                                fontFamily: this._font,
                                beginAtZero: this.scaleBeginAtZero,
                                display: this.scaleShowLabels,
                            },
                            gridLines: {
                                display: this.scaleShowHorizontalLines,
                                color: this.scaleGridLineColor,
                                lineWidth,
                            },
                        }],
                    },

                    legendCallback: this._legendCallback.bind(this),

                    animation: {
                        onComplete: hitch(this, this._animationComplete),
                    },
                }),
            };

            if (this.scaleBeginAtZero) {
                chartProperties.options.scales.xAxes[ 0 ].ticks.suggestedMin = 0;
                chartProperties.options.scales.yAxes[ 0 ].ticks.suggestedMin = 0;
            }

            this._chart = new this._chartJS(this._ctx, chartProperties);

            this.connect(window, "resize", () => {
                this._resize();
            });

            // Add class to determine chart type
            this._addChartClass(this._chartClass);

            on(this._chart.chart.canvas, "click", hitch(this, this._onClickChart));
        }
    },

}, Core);
