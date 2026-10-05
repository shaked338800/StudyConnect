import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import {
  SERIES_COLOR, GRID_COLOR, AXIS_COLOR, TEXT_MUTED, TEXT_STRONG,
  WIDTH, HEIGHT, MARGIN, createTooltip, moveTooltip, hideTooltip
} from './chartTheme';

const MAX_BAR_WIDTH = 32;
const CHAR_WIDTH = 7; // about how wide one 12px character is

// Shorten a course name only if it does not fit in its slot (full name is in the tooltip)
function shortName(name, maxChars) {
  return name.length > maxChars ? name.slice(0, maxChars - 1) + '…' : name;
}

// A bar whose top corners are rounded (4px) and whose bottom is square
function barPath(x, y, width, height) {
  const r = Math.min(4, height, width / 2);
  return `M${x},${y + height} V${y + r} Q${x},${y} ${x + r},${y} H${x + width - r} Q${x + width},${y} ${x + width},${y + r} V${y + height} Z`;
}

// [REQ-29 D3.js] Bar chart: number of posts per course.
// data: [{ course, count }, ...] - straight from MongoDB (via $.ajax).
//
// React renders ONE empty <div ref={containerRef}>. Everything inside it
// (the <svg>, axes, bars, tooltip) is created by D3 in useEffect.
function PostsByCourseChart({ data }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || data.length === 0) return;

    // 1. Start clean: remove the previous drawing (no duplicate SVGs)
    d3.select(container).selectAll('*').remove();

    const innerWidth = WIDTH - MARGIN.left - MARGIN.right;
    const innerHeight = HEIGHT - MARGIN.top - MARGIN.bottom;

    // 2. The SVG. viewBox = our coordinate system; CSS makes it 100% wide.
    const svg = d3.select(container)
      .append('svg')
      .attr('viewBox', `0 0 ${WIDTH} ${HEIGHT}`)
      .attr('role', 'img')
      .attr('aria-label', 'Bar chart: number of posts per course');
    const chart = svg.append('g').attr('transform', `translate(${MARGIN.left},${MARGIN.top})`);

    // 3. Scales: turn data values into pixel positions
    const x = d3.scaleBand()                 // one "band" (slot) per course
      .domain(data.map((d) => d.course))
      .range([0, innerWidth])
      .padding(0.25);
    const maxCount = d3.max(data, (d) => d.count);
    const y = d3.scaleLinear()               // 0..max posts -> bottom..top
      .domain([0, maxCount])
      .nice()
      .range([innerHeight, 0]);

    // 4. Horizontal gridlines + Y axis (whole numbers only)
    const tickCount = Math.min(maxCount, 5);
    chart.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(y).ticks(tickCount).tickSize(-innerWidth).tickFormat(''))
      .call((g) => g.selectAll('line').attr('stroke', GRID_COLOR))
      .call((g) => g.select('.domain').remove());
    chart.append('g')
      .call(d3.axisLeft(y).ticks(tickCount).tickFormat(d3.format('d')))
      .call((g) => g.select('.domain').attr('stroke', AXIS_COLOR))
      .call((g) => g.selectAll('.tick line').remove())
      .call((g) => g.selectAll('text').attr('fill', TEXT_MUTED).attr('font-size', 12));

    // 5. X axis with the course names (shortened only if they don't fit their slot)
    const tilted = data.length > 5;
    const maxChars = tilted ? 22 : Math.max(6, Math.floor(x.step() / CHAR_WIDTH));
    const xAxis = chart.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x).tickFormat((name) => shortName(name, maxChars)).tickSizeOuter(0))
      .call((g) => g.select('.domain').attr('stroke', AXIS_COLOR))
      .call((g) => g.selectAll('.tick line').remove())
      .call((g) => g.selectAll('text').attr('fill', TEXT_MUTED).attr('font-size', 12));
    if (tilted) {
      // many courses: tilt the names so they don't overlap
      xAxis.selectAll('text').attr('text-anchor', 'end').attr('transform', 'rotate(-30)').attr('dx', '-0.4em').attr('dy', '0.6em');
    }

    // 6. Axis titles. "Course" goes below the course names: we measure how tall
    // the X axis really is (tilted names need more room), and make the SVG
    // taller if needed so the title is never cut off.
    const xAxisHeight = xAxis.node().getBBox().height;
    const courseTitleY = innerHeight + Math.max(62, xAxisHeight + 22);
    svg.attr('viewBox', `0 0 ${WIDTH} ${Math.max(HEIGHT, MARGIN.top + courseTitleY + 12)}`);
    chart.append('text')
      .attr('x', innerWidth / 2).attr('y', courseTitleY)
      .attr('text-anchor', 'middle').attr('fill', TEXT_MUTED).attr('font-size', 13)
      .text('Course');
    chart.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2).attr('y', -44)
      .attr('text-anchor', 'middle').attr('fill', TEXT_MUTED).attr('font-size', 13)
      .text('Number of posts');

    // 7. The bars - D3 "data join": one <path> per data row
    const barWidth = Math.min(x.bandwidth(), MAX_BAR_WIDTH);
    const barX = (d) => x(d.course) + (x.bandwidth() - barWidth) / 2;
    chart.selectAll('.bar')
      .data(data)
      .join('path')
      .attr('class', 'bar')
      .attr('fill', SERIES_COLOR)
      .attr('d', (d) => barPath(barX(d), y(d.count), barWidth, innerHeight - y(d.count)));

    // 8. The value on top of each bar
    chart.selectAll('.bar-value')
      .data(data)
      .join('text')
      .attr('class', 'bar-value')
      .attr('x', (d) => x(d.course) + x.bandwidth() / 2)
      .attr('y', (d) => y(d.count) - 6)
      .attr('text-anchor', 'middle')
      .attr('fill', TEXT_STRONG)
      .attr('font-size', 12)
      .attr('font-weight', 600)
      .text((d) => d.count);

    // 9. Hover: an invisible rectangle over each whole slot (bigger than the bar)
    const tooltip = createTooltip(d3, container);
    chart.selectAll('.hit')
      .data(data)
      .join('rect')
      .attr('class', 'hit')
      .attr('x', (d) => x(d.course))
      .attr('y', 0)
      .attr('width', x.bandwidth())
      .attr('height', innerHeight)
      .attr('fill', 'transparent')
      .on('pointermove', (event, d) => {
        chart.selectAll('.bar').attr('opacity', (b) => (b === d ? 1 : 0.55));
        moveTooltip(tooltip, container, event, [`${d.count} post${d.count === 1 ? '' : 's'}`, d.course]);
      })
      .on('pointerleave', () => {
        chart.selectAll('.bar').attr('opacity', 1);
        hideTooltip(tooltip);
      });

    // Cleanup when the data changes or the component disappears
    return () => {
      d3.select(container).selectAll('*').remove();
    };
  }, [data]);

  if (data.length === 0) {
    return <p className="chart-empty">No posts yet - write a post and this chart will show it.</p>;
  }
  return <div ref={containerRef} className="chart-container" />;
}

export default PostsByCourseChart;
