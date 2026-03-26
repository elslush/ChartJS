import defineWidget from 'widget-base-helpers/helpers/define-widget';
import Core from 'Core';
import on from 'dojo/on';
import { hitch } from 'dojo/_base/lang';

import '../../ChartJS.scss';

export default defineWidget('GanttChart.widget.GanttChart', null, {

    _chartType: 'horizontalBar',

    _chartClass: 'chartjs-gantt-chart',

    _ganttTasks: null,

    _processData() {
        this.log('_processData');

        const taskLabels = [];
        const offsets = [];
        const durations = [];
        const barColors = [];

        this._ganttTasks = [];
        this._activeDatasets = [];
        this._chartData.datasets = [];
        this._chartData.labels = [];

        const sets = this._data.datasets = this._sortArrayObj(this._data.datasets);

        for (let j = 0; j < sets.length; j++) {
            const set = sets[ j ];
            const label = set.dataset.get(this.taskLabel);
            const start = +set.dataset.get(this.taskStart);
            const end = +set.dataset.get(this.taskEnd);
            const color = set.dataset.get(this.seriescolor);

            taskLabels.push(label);
            offsets.push(start);
            durations.push(end - start);
            barColors.push(color);

            this._ganttTasks.push({
                label: label,
                start: start,
                end: end,
                obj: set.dataset,
            });

            this._activeDatasets.push({
                obj: set.dataset,
                dataset: set,
                idx: j,
                active: true,
            });
        }

        this._chartData.labels = taskLabels;
        this._chartData.datasets = [
            {
                label: '',
                data: offsets,
                backgroundColor: 'rgba(0,0,0,0)',
                hoverBackgroundColor: 'rgba(0,0,0,0)',
                borderWidth: 0,
            },
            {
                label: '',
                data: durations,
                backgroundColor: barColors,
                hoverBackgroundColor: barColors,
                borderWidth: 0,
            },
        ];

        this._createChart(this._chartData);
    },

    _loadData() {
        this._loadDataSingleSet();
    },

    _createChart(data) {
        this.log('_createChart');

        if (this._chart) {
            this._restartChart(data);
        } else {
            const ganttTasks = this._ganttTasks;

            const chartProperties = {
                type: this._chartType,
                data: data,
                options: this._chartOptions({

                    scales: {
                        xAxes: [{
                            stacked: true,
                            scaleLabel: {
                                display: '' !== this.xLabel,
                                labelString: '' !== this.xLabel ? this.xLabel : 'Day',
                                fontFamily: this._font,
                            },
                            ticks: {
                                fontFamily: this._font,
                                beginAtZero: true,
                                max: this.maxDays > 0 ? this.maxDays : undefined,
                            },
                            gridLines: {
                                display: true,
                                color: this.scaleGridLineColor || 'rgba(0,0,0,.05)',
                            },
                        }],
                        yAxes: [{
                            stacked: true,
                            ticks: {
                                fontFamily: this._font,
                            },
                            gridLines: {
                                display: false,
                            },
                        }],
                    },

                    legend: {
                        display: false,
                    },

                    tooltips: {
                        callbacks: {
                            label(tooltipItem) {
                                if (0 === tooltipItem.datasetIndex) {
                                    return null;
                                }
                                const task = ganttTasks[ tooltipItem.index ];
                                if (task) {
                                    const duration = task.end - task.start;
                                    return task.label + ': Day ' + task.start + ' \u2192 Day ' + task.end + ' (' + duration + ' days)';
                                }
                                return '';
                            },
                            title(tooltipItems) {
                                if (tooltipItems.length > 0) {
                                    return tooltipItems[ 0 ].yLabel;
                                }
                                return '';
                            },
                        },
                        filter(tooltipItem) {
                            return tooltipItem.datasetIndex !== 0;
                        },
                    },

                    animation: {
                        onComplete: hitch(this, this._animationComplete),
                    },
                }),
            };

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
