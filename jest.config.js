const path = require('path');

const widgetBase = path.resolve(__dirname, 'src/ChartJS/widgets');

module.exports = {
    testEnvironment: 'jsdom',
    testMatch: ['**/__tests__/**/*.test.js'],
    setupFiles: [path.resolve(widgetBase, '__tests__/jest.setup.js')],
    transform: {
        '^.+\\.js$': 'babel-jest',
    },
    transformIgnorePatterns: [
        '/node_modules/(?!widget-base-helpers)',
    ],
    moduleNameMapper: {
        '\\.(scss|css)$': path.resolve(widgetBase, '__tests__/__mocks__/styleMock.js'),
        '\\.(html)$': path.resolve(widgetBase, '__tests__/__mocks__/htmlMock.js'),
        '^chart\\.js/dist/Chart\\.bundle\\.min\\.js$': path.resolve(widgetBase, '__tests__/__mocks__/chartjsMock.js'),
        '^widget-base-helpers$': path.resolve(widgetBase, '__tests__/__mocks__/widgetBaseHelpers.js'),
        '^widget-base-helpers/helpers/define-widget$': path.resolve(widgetBase, '__tests__/__mocks__/defineWidget.js'),
        '^Core$': path.resolve(widgetBase, 'Core.js'),
        '^BarChart/widget/BarChart$': path.resolve(widgetBase, 'BarChart/widget/BarChart.js'),
        '^PieChart/widget/PieChart$': path.resolve(widgetBase, 'PieChart/widget/PieChart.js'),
        '^ScatterChart/widget/ScatterChart$': path.resolve(widgetBase, 'ScatterChart/widget/ScatterChart.js'),
        '^BubbleChart/widget/BubbleChart$': path.resolve(widgetBase, 'BubbleChart/widget/BubbleChart.js'),
        '^GanttChart/widget/GanttChart$': path.resolve(widgetBase, 'GanttChart/widget/GanttChart.js'),
        '^dojo/_base/lang$': path.resolve(widgetBase, '__tests__/__mocks__/dojo/_base/lang.js'),
        '^dojo/on$': path.resolve(widgetBase, '__tests__/__mocks__/dojo/on.js'),
        '^dojo/dom-style$': path.resolve(widgetBase, '__tests__/__mocks__/dojo/dom-style.js'),
        '^dojo/dom-geometry$': path.resolve(widgetBase, '__tests__/__mocks__/dojo/dom-geometry.js'),
        '^dojo/dom-attr$': path.resolve(widgetBase, '__tests__/__mocks__/dojo/dom-attr.js'),
        '^dojo/dom-class$': path.resolve(widgetBase, '__tests__/__mocks__/dojo/dom-class.js'),
        '^dojo/dom-construct$': path.resolve(widgetBase, '__tests__/__mocks__/dojo/dom-construct.js'),
        '^dojo/query$': path.resolve(widgetBase, '__tests__/__mocks__/dojo/query.js'),
        '^dojo/html$': path.resolve(widgetBase, '__tests__/__mocks__/dojo/html.js'),
        '^dojo/NodeList-traverse$': path.resolve(widgetBase, '__tests__/__mocks__/dojo/NodeList-traverse.js'),
    },
};
