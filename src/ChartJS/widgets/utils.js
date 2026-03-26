/**
 * Pure utility functions extracted from Core.js for testability.
 * These functions have no dependency on Mendix, Dojo, or the DOM.
 */

/**
 * Convert hex color to rgba string.
 * Supports shorthand (#03F) and full (#0033FF) hex, with or without #.
 * Returns a default gray if input is null, undefined, or not a valid hex color.
 *
 * @param {string|null} hex - Hex color string
 * @param {string} alpha - Alpha value (e.g. '0.5')
 * @returns {string} rgba color string
 */
export function hexToRgb(hex, alpha) {
    if (null !== hex && undefined !== hex) {
        const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        const h = hex.replace(shorthandRegex, function (m, r, g, b) {
            return r + r + g + g + b + b;
        });

        const regex = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(h);
        if (regex) {
            const result = {
                r: parseInt(regex[1], 16),
                g: parseInt(regex[2], 16),
                b: parseInt(regex[3], 16),
            };
            return 'rgba(' + result.r + ',' + result.g + ',' + result.b + ',' + alpha + ')';
        }
    }
    return 'rgba(220,220,220,' + alpha + ')';
}

/**
 * Sort an array of objects by their `sorting` property (numeric, ascending).
 * Does not mutate the original array.
 *
 * @param {Array<{sorting: number|string}>} values
 * @returns {Array} sorted copy
 */
export function sortArrayObj(values) {
    return values.slice().sort((a, b) => {
        const aa = +(a.sorting);
        const bb = +(b.sorting);
        if (aa > bb) {
            return 1;
        }
        if (aa < bb) {
            return -1;
        }
        return 0;
    });
}

/**
 * Build a single-series Chart.js data structure from a flat data array.
 *
 * @param {Array<{label: string, value: number, backgroundColor: string, hoverBackgroundColor: string}>} data
 * @returns {{ labels: string[], datasets: [{ data: number[], backgroundColor: string[], hoverBackgroundColor: string[] }] }}
 */
export function createDataSets(data) {
    const chartData = {
        labels: [],
        datasets: [{
            data: [],
            backgroundColor: [],
            hoverBackgroundColor: [],
        }],
    };

    for (let j = 0; j < data.length; j++) {
        chartData.labels.push(data[j].label);
        chartData.datasets[0].data.push(data[j].value);
        chartData.datasets[0].backgroundColor.push(data[j].backgroundColor);
        chartData.datasets[0].hoverBackgroundColor.push(data[j].hoverBackgroundColor);
    }

    return chartData;
}
