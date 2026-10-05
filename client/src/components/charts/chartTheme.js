// Shared look of the two D3 charts.
// The series color is the app's primary blue (checked: enough contrast on white).
export const SERIES_COLOR = '#3b5bdb';
export const SURFACE = '#ffffff';     // card background - used for the 2px ring around dots
export const GRID_COLOR = '#e9ecef';  // light hairlines
export const AXIS_COLOR = '#ced4da';
export const TEXT_MUTED = '#6b7280';  // axis text
export const TEXT_STRONG = '#1f2937'; // value labels

// Every chart is drawn in this coordinate system; the SVG's viewBox makes it
// scale down to the width of the page.
export const WIDTH = 760;
export const HEIGHT = 340;
export const MARGIN = { top: 28, right: 24, bottom: 72, left: 64 };

// A tooltip <div> that D3 creates INSIDE the chart container (React never
// touches the container's children). Text is set with .text(), never .html().
export function createTooltip(d3, container) {
  return d3.select(container).append('div').attr('class', 'chart-tooltip').style('opacity', 0);
}

// Places the tooltip next to the pointer, relative to the container
export function moveTooltip(tooltip, container, event, lines) {
  const box = container.getBoundingClientRect();
  tooltip.selectAll('*').remove();
  tooltip.append('strong').text(lines[0]); // the value first (what the reader wants)
  tooltip.append('span').text(lines[1]);   // then what it belongs to
  tooltip
    .style('left', `${event.clientX - box.left + 12}px`)
    .style('top', `${event.clientY - box.top - 12}px`)
    .style('opacity', 1);
}

export function hideTooltip(tooltip) {
  tooltip.style('opacity', 0);
}
