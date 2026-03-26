---
name: view-charts
description: "Preview and screenshot Chart.js widget charts using Playwright. Use when: visualizing charts, viewing chart output, taking screenshots of charts, checking chart rendering, previewing the widget, debugging chart appearance."
argument-hint: "Describe which chart types to view or 'all' for all 8 types"
---

# View Charts with Playwright

Preview all 8 Chart.js widget chart types in a browser using Playwright and capture screenshots.

## When to Use

- Visually verify chart rendering after code changes
- Screenshot charts for documentation or review
- Debug chart appearance, layout, or configuration issues
- Compare chart output before/after modifications

## Chart Types Available

| Type | Widget File | Chart.js `type` |
|------|------------|-----------------|
| Bar | `BarChart/widget/BarChart.js` | `bar` |
| Horizontal Bar | `HorizontalBarChart/widget/HorizontalBarChart.js` | `horizontalBar` |
| Stacked Bar | `StackedBarChart/widget/StackedBarChart.js` | `bar` (stacked) |
| Line | `LineChart/widget/LineChart.js` | `line` |
| Pie | `PieChart/widget/PieChart.js` | `pie` |
| Doughnut | `DoughnutChart/widget/DoughnutChart.js` | `doughnut` |
| Polar Area | `PolarChart/widget/PolarChart.js` | `polarArea` |
| Radar | `RadarChart/widget/RadarChart.js` | `radar` |

## Prerequisites

- Playwright browser tools must be available (`open_browser_page`, `screenshot_page`, `run_playwright_code`)
- Python 3 (for the HTTP server)

## Procedure

### Step 1 — Start the HTTP server

The demo page loads Chart.js 2.7.2 from a CDN, so it needs HTTP (not `file://`).

```bash
cd /home/ai/ChartJS/test && python3 -m http.server 8765
```

Run this as a **background process**. It serves the `test/` directory on port 8765.

### Step 2 — Open the demo page

Use the Playwright `open_browser_page` tool:

```
url: http://localhost:8765/demo.html
```

### Step 3 — Screenshot the charts

The page is a 2-column grid with 4 rows. It requires scrolling to capture all charts.

**Top section** (Bar + Horizontal Bar): Take a screenshot immediately after opening.

**Middle section** (Stacked Bar + Line, Pie + Doughnut): Scroll to y=600:
```javascript
await page.evaluate(() => window.scrollTo(0, 600));
```

**Bottom section** (Polar Area + Radar): Scroll to bottom:
```javascript
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
```

### Step 4 — Full-page screenshot (alternative)

For a single full-page capture instead of scrolling:
```javascript
await page.screenshot({ path: '/home/ai/ChartJS/test/charts-screenshot.png', fullPage: true });
```

## Demo Page Details

- **Location**: [test/demo.html](../../../test/demo.html)
- **Chart.js version**: 2.7.2 (CDN, same version as the widget bundle)
- **Configuration**: Uses the same option patterns as the widget code — `scales`, `stacked`, `cutoutPercentage`, `beginAtZero`, `lineTension`, `pointRadius`, etc.

## Customizing the Demo

To test specific widget configurations, edit `test/demo.html`. Each chart is a separate `new Chart(...)` call that mirrors how the widget constructs charts in `_createChart()`. Modify the `data` and `options` objects to match what you want to preview.

## Cleanup

Kill the HTTP server when done:
```bash
kill $(lsof -t -i:8765)
```
