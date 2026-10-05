import SketchCanvas from '../components/SketchCanvas';

// [REQ-26 Canvas] "Study Sketch" - draw a quick diagram or handwritten
// note, then download it as a PNG (e.g. to attach elsewhere or print).
function SketchPage() {
  return (
    <section className="card">
      <h2 className="page-title">Study Sketch</h2>
      <p className="muted">
        Draw a quick diagram or a handwritten note with the mouse, a finger or a pen.
        Use <strong>Download PNG</strong> to save it. (Sketches are not stored on the server.)
      </p>
      <SketchCanvas />
    </section>
  );
}

export default SketchPage;
