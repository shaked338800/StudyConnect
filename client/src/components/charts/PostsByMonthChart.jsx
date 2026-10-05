import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import {
  SERIES_COLOR, SURFACE, GRID_COLOR, AXIS_COLOR, TEXT_MUTED, TEXT_STRONG,
  WIDTH, HEIGHT, MARGIN, createTooltip, moveTooltip, hideTooltip
} from './chartTheme';

// "2026-03" -> "Mar 2026"
const formatMonth = (d) => d3.timeFormat('%b %Y')(new Date(d.year, d.month - 1, 1));

// [REQ-29 D3.js] Line chart: number of posts per month.
// data: [{ year, month, label, count }, ...] - from MongoDB (via $.ajax),
// already in time order and with empty months filled in as 0.
function PostsByMonthChart({ data }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || data.length === 0) return;

    // 1. Start clean (no duplicate SVGs when the data is refreshed)
    d3.select(container).selectAll('*').remove();

    const innerWidth = WIDTH - MARGIN.left - MARGIN.right;
    const innerHeight = HEIGHT - MARGIN.top - MARGIN.bottom;

    const svg = d3.select(container)
      .append('svg')
      .attr('viewBox', `0 0 ${WIDTH} ${HEIGHT}`)
      .attr('role', 'img')
      .attr('aria-label', 'Line chart: number of posts per month');
    const chart = svg.append('g').attr('transform', `translate(${MARGIN.left},${MARGIN.top})`);

    // 2. Scales. scalePoint = evenly spaced positions, one per month.
    const x = d3.scalePoint()
      .domain(data.map((d) => d.label))
      .range([0, innerWidth])
      .padding(0.5);
    const maxCount = d3.max(data, (d) => d.count);
    const y = d3.scaleLinear()
      .domain([0, Math.max(maxCount, 1)])
      .nice()
      .range([innerHeight, 0]);

    // 3. Gridlines + Y axis (whole numbers)
    const tickCount = Math.min(Math.max(maxCount, 1), 5);
    chart.append('g')
      .call(d3.axisLeft(y).ticks(tickCount).tickSize(-innerWidth).tickFormat(''))
      .call((g) => g.selectAll('line').attr('stroke', GRID_COLOR))
      .call((g) => g.select('.domain').remove());
    chart.append('g')
      .call(d3.axisLeft(y).ticks(tickCount).tickFormat(d3.format('d')))
      .call((g) => g.select('.domain').attr('stroke', AXIS_COLOR))
      .call((g) => g.selectAll('.tick line').remove())
      .call((g) => g.selectAll('text').attr('fill', TEXT_MUTED).attr('font-size', 12));

    // 4. X axis: month names. With many months, show only every n-th name.
    const step = Math.ceil(data.length / 8);
    const shownLabels = data.filter((d, i) => i % step === 0).map((d) => d.label);
    const labelText = Object.fromEntries(data.map((d) => [d.label, formatMonth(d)]));
    const monthAxis = chart.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x).tickValues(shownLabels).tickFormat((label) => labelText[label]).tickSizeOuter(0))
      .call((g) => g.select('.domain').attr('stroke', AXIS_COLOR))
      .call((g) => g.selectAll('.tick line').attr('stroke', AXIS_COLOR))
      .call((g) => g.selectAll('text').attr('fill', TEXT_MUTED).attr('font-size', 12));
    if (shownLabels.length > 6) {
      // many month names: tilt them so they don't overlap
      monthAxis.selectAll('text').attr('text-anchor', 'end').attr('transform', 'rotate(-30)').attr('dx', '-0.4em').attr('dy', '0.6em');
    }

    // 5. Axis titles
    chart.append('text')
      .attr('x', innerWidth / 2).attr('y', innerHeight + 62)
      .attr('text-anchor', 'middle').attr('fill', TEXT_MUTED).attr('font-size', 13)
      .text('Month');
    chart.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2).attr('y', -44)
      .attr('text-anchor', 'middle').attr('fill', TEXT_MUTED).attr('font-size', 13)
      .text('Number of posts');

    // 6. A light area under the line, then the line itself.
    // d3.line() turns the data points into the SVG path "d" text.
    const area = d3.area()
      .x((d) => x(d.label))
      .y0(innerHeight)
      .y1((d) => y(d.count));
    chart.append('path').datum(data).attr('fill', SERIES_COLOR).attr('opacity', 0.1).attr('d', area);

    const line = d3.line()
      .x((d) => x(d.label))
      .y((d) => y(d.count));
    chart.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', SERIES_COLOR)
      .attr('stroke-width', 2)
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round')
      .attr('d', line);

    // 7. A dot for every month (white ring keeps it readable on the line)
    chart.selectAll('.dot')
      .data(data)
      .join('circle')
      .attr('class', 'dot')
      .attr('cx', (d) => x(d.label))
      .attr('cy', (d) => y(d.count))
      .attr('r', 4)
      .attr('fill', SERIES_COLOR)
      .attr('stroke', SURFACE)
      .attr('stroke-width', 2);

    // 8. Label only the LAST month's value (not every point)
    const last = data[data.length - 1];
    chart.append('text')
      .attr('x', x(last.label))
      .attr('y', y(last.count) - 12)
      .attr('text-anchor', 'middle')
      .attr('fill', TEXT_STRONG)
      .attr('font-size', 12)
      .attr('font-weight', 600)
      .text(last.count);

    // 9. Hover: a vertical line snaps to the nearest month + tooltip
    const tooltip = createTooltip(d3, container);
    const crosshair = chart.append('line')
      .attr('y1', 0).attr('y2', innerHeight)
      .attr('stroke', AXIS_COLOR).attr('stroke-width', 1)
      .style('opacity', 0);
    chart.append('rect')
      .attr('width', innerWidth).attr('height', innerHeight)
      .attr('fill', 'transparent')
      .on('pointermove', (event) => {
        const [mouseX] = d3.pointer(event); // pointer position in chart coordinates
        const nearest = d3.least(data, (d) => Math.abs(x(d.label) - mouseX));
        crosshair.attr('x1', x(nearest.label)).attr('x2', x(nearest.label)).style('opacity', 1);
        chart.selectAll('.dot').attr('r', (d) => (d === nearest ? 6 : 4));
        moveTooltip(tooltip, container, event, [`${nearest.count} post${nearest.count === 1 ? '' : 's'}`, formatMonth(nearest)]);
      })
      .on('pointerleave', () => {
        crosshair.style('opacity', 0);
        chart.selectAll('.dot').attr('r', 4);
        hideTooltip(tooltip);
      });

    return () => {
      d3.select(container).selectAll('*').remove();
    };
  }, [data]);

  if (data.length === 0) {
    return <p className="chart-empty">No posts yet - the monthly activity will appear here.</p>;
  }
  return <div ref={containerRef} className="chart-container" />;
}

export default PostsByMonthChart;
