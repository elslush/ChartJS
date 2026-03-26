import { sortArrayObj } from '../utils';
const { createMockEntity } = require('./helpers/mockEntity');

const GanttChart = require('../GanttChart/widget/GanttChart').default;

describe('GanttChart._processData', () => {
    function makeContext(overrides) {
        return Object.assign({}, GanttChart, {
            _sortArrayObj: sortArrayObj,
            _createChart: jest.fn(),
            _addChartClass: jest.fn(),
            _restartChart: jest.fn(),
            log: jest.fn(),
            id: 'test-gantt-1',

            taskLabel: 'name',
            taskStart: 'start',
            taskEnd: 'end',
            seriescolor: 'color',
            datasetlabel: 'name',

            _chartData: { datasets: [], labels: [] },
            _activeDatasets: [],
            _data: { object: null, datasets: [] },
        }, overrides);
    }

    function makeDatasets(configs) {
        return configs.map(cfg => ({
            sorting: cfg.sorting || 0,
            dataset: createMockEntity({
                name: cfg.name,
                start: cfg.start,
                end: cfg.end,
                color: cfg.color || '#3498db',
            }),
            points: [],
        }));
    }

    it('builds offset and duration datasets from tasks', () => {
        const ctx = makeContext({});
        ctx._data.datasets = makeDatasets([
            { sorting: 1, name: 'Research', start: 0, end: 5, color: '#3498db' },
            { sorting: 2, name: 'Design', start: 3, end: 10, color: '#e74c3c' },
            { sorting: 3, name: 'Dev', start: 5, end: 15, color: '#2ecc71' },
        ]);

        ctx._processData();

        // Should have 2 Chart.js datasets: offset (transparent) + duration (colored)
        expect(ctx._chartData.datasets).toHaveLength(2);
        expect(ctx._chartData.datasets[0].data).toEqual([0, 3, 5]);
        expect(ctx._chartData.datasets[0].backgroundColor).toBe('rgba(0,0,0,0)');
        expect(ctx._chartData.datasets[1].data).toEqual([5, 7, 10]);
        expect(ctx._chartData.datasets[1].backgroundColor).toEqual(['#3498db', '#e74c3c', '#2ecc71']);
    });

    it('sets task labels on Y-axis', () => {
        const ctx = makeContext({});
        ctx._data.datasets = makeDatasets([
            { sorting: 1, name: 'Task A', start: 0, end: 3 },
            { sorting: 2, name: 'Task B', start: 2, end: 8 },
        ]);

        ctx._processData();

        expect(ctx._chartData.labels).toEqual(['Task A', 'Task B']);
    });

    it('stores gantt task metadata', () => {
        const ctx = makeContext({});
        ctx._data.datasets = makeDatasets([
            { sorting: 1, name: 'Alpha', start: 1, end: 5 },
            { sorting: 2, name: 'Beta', start: 3, end: 9 },
        ]);

        ctx._processData();

        expect(ctx._ganttTasks).toHaveLength(2);
        expect(ctx._ganttTasks[0].label).toBe('Alpha');
        expect(ctx._ganttTasks[0].start).toBe(1);
        expect(ctx._ganttTasks[0].end).toBe(5);
        expect(ctx._ganttTasks[1].label).toBe('Beta');
        expect(ctx._ganttTasks[1].start).toBe(3);
        expect(ctx._ganttTasks[1].end).toBe(9);
    });

    it('handles single task', () => {
        const ctx = makeContext({});
        ctx._data.datasets = makeDatasets([
            { sorting: 1, name: 'Only Task', start: 2, end: 7, color: '#f39c12' },
        ]);

        ctx._processData();

        expect(ctx._chartData.datasets[0].data).toEqual([2]);
        expect(ctx._chartData.datasets[1].data).toEqual([5]);
        expect(ctx._chartData.labels).toEqual(['Only Task']);
    });

    it('calls _createChart with chart data', () => {
        const ctx = makeContext({});
        ctx._data.datasets = makeDatasets([
            { sorting: 1, name: 'T1', start: 0, end: 3 },
        ]);

        ctx._processData();

        expect(ctx._createChart).toHaveBeenCalledWith(ctx._chartData);
    });

    it('populates _activeDatasets with task objects', () => {
        const ctx = makeContext({});
        ctx._data.datasets = makeDatasets([
            { sorting: 1, name: 'X', start: 0, end: 5 },
            { sorting: 2, name: 'Y', start: 5, end: 10 },
        ]);

        ctx._processData();

        expect(ctx._activeDatasets).toHaveLength(2);
        expect(ctx._activeDatasets[0].idx).toBe(0);
        expect(ctx._activeDatasets[1].idx).toBe(1);
        expect(ctx._activeDatasets[0].active).toBe(true);
    });
});
