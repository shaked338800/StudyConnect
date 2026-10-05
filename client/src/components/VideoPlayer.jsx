import { useRef, useState } from 'react';

const SPEEDS = [1, 1.5, 2];

// [REQ-26 React + Video] HTML5 <video> player for a post.
// - The browser's own controls (controls attribute) work as usual.
// - Our React buttons control the SAME element through a ref
//   (videoRef.current is the real <video> DOM element).
// - onPlay / onPause keep React state in sync even when the user
//   uses the native controls instead of our buttons.
function VideoPlayer({ src }) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [loadError, setLoadError] = useState(false);

  function togglePlay() {
    const video = videoRef.current;
    if (video.paused) {
      // play() returns a promise. It can be refused without the video being
      // broken (e.g. browser autoplay rules, or Pause clicked right away), so we
      // just stay paused. Real loading problems are handled by onError below.
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }

  function changeSpeed(newSpeed) {
    videoRef.current.playbackRate = newSpeed;
    setSpeed(newSpeed);
  }

  function restart() {
    videoRef.current.currentTime = 0;
  }

  if (loadError) {
    return (
      <div className="video-error">
        This video could not be loaded. Check that the link points to a .mp4 or .webm file:{' '}
        <a href={src} target="_blank" rel="noopener noreferrer">{src}</a>
      </div>
    );
  }

  return (
    <div className="video-player">
      <video
        ref={videoRef}
        src={src}
        controls
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onError={() => setLoadError(true)}
      >
        Your browser does not support HTML5 video.
      </video>

      <div className="video-controls">
        <button className="btn" type="button" onClick={togglePlay}>{playing ? 'Pause' : 'Play'}</button>
        <button className="btn btn-secondary" type="button" onClick={restart}>Restart</button>
        <span className="muted small">Speed:</span>
        {SPEEDS.map((s) => (
          <button
            key={s}
            type="button"
            className={'btn btn-small' + (speed === s ? '' : ' btn-secondary')}
            onClick={() => changeSpeed(s)}
          >
            {s}x
          </button>
        ))}
      </div>
    </div>
  );
}

export default VideoPlayer;
