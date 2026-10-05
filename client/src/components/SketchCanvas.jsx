import { useEffect, useRef, useState } from 'react';

// The drawing surface has a FIXED size in pixels. On screen, CSS stretches it
// to the available width, so toCanvasPoint() converts screen coordinates.
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 450;
const BACKGROUND = '#ffffff';

// [REQ-26 React + Canvas] A simple study sketch pad.
// - useRef gives us the real <canvas> DOM element (canvasRef.current).
// - canvas.getContext('2d') is the 2D drawing API (lines, colors, fill).
// - Pointer Events work for mouse, touch and pen with the same code.
function SketchCanvas() {
  const canvasRef = useRef(null);
  // "Am I drawing right now?" and "where was the pointer last time?"
  // These are refs, not state: changing them must NOT re-render React.
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef(null);

  const [color, setColor] = useState('#1f2937');
  const [brushSize, setBrushSize] = useState(4);

  // When the component appears, paint a white background
  // (otherwise the downloaded PNG would be transparent).
  useEffect(() => {
    clearCanvas();
  }, []);

  function getContext() {
    return canvasRef.current.getContext('2d');
  }

  // Screen (mouse) position -> position inside the canvas drawing surface.
  // getBoundingClientRect() = where the canvas is on screen and how big it is shown.
  // We scale because the shown size can differ from the 800x450 surface.
  function toCanvasPoint(event) {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * (canvas.width / rect.width),
      y: (event.clientY - rect.top) * (canvas.height / rect.height)
    };
  }

  function drawLine(from, to) {
    const ctx = getContext();
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';   // round ends, so single dots look like dots
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
  }

  function handlePointerDown(event) {
    // Keep receiving move/up events even if the pointer leaves the canvas
    event.currentTarget.setPointerCapture(event.pointerId);
    isDrawingRef.current = true;
    const point = toCanvasPoint(event);
    lastPointRef.current = point;
    drawLine(point, point); // a click draws a dot
  }

  function handlePointerMove(event) {
    if (!isDrawingRef.current) return;
    const point = toCanvasPoint(event);
    drawLine(lastPointRef.current, point); // connect to the previous point
    lastPointRef.current = point;
  }

  function stopDrawing() {
    isDrawingRef.current = false;
    lastPointRef.current = null;
  }

  function clearCanvas() {
    const ctx = getContext();
    ctx.fillStyle = BACKGROUND;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  // toDataURL turns the pixels into a PNG image (as a data: URL).
  // A temporary <a download> link makes the browser save it as a file.
  function downloadPng() {
    const link = document.createElement('a');
    link.href = canvasRef.current.toDataURL('image/png');
    link.download = 'study-sketch.png';
    link.click();
  }

  return (
    <div className="sketch">
      <div className="sketch-toolbar">
        <label>
          Color{' '}
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
        </label>
        <label>
          Brush size: {brushSize}px{' '}
          <input type="range" min="1" max="30" value={brushSize} onChange={(e) => setBrushSize(Number(e.target.value))} />
        </label>
        <button className="btn btn-secondary" type="button" onClick={clearCanvas}>Clear</button>
        <button className="btn" type="button" onClick={downloadPng}>Download PNG</button>
      </div>

      <canvas
        ref={canvasRef}
        className="sketch-canvas"
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={stopDrawing}
        onPointerCancel={stopDrawing}
      >
        Your browser does not support the HTML5 canvas.
      </canvas>
    </div>
  );
}

export default SketchCanvas;
