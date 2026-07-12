import React, { useState, useRef, useEffect } from 'react';

const VideoPlayer = ({ src, onComplete, onProgress, initialProgress = 0, autoPlay = false }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [maxTimeWatched, setMaxTimeWatched] = useState(0);

  const maxTimeWatchedRef = useRef(0);
  const onProgressRef = useRef(onProgress);
  const onCompleteRef = useRef(onComplete);
  const initialProgressRef = useRef(initialProgress);

  useEffect(() => {
    onProgressRef.current = onProgress;
    onCompleteRef.current = onComplete;
  }, [onProgress, onComplete]);

  // Sync maxTimeWatched with initialProgress from DB
  useEffect(() => {
    const val = initialProgress > 0 ? initialProgress : 0;
    setMaxTimeWatched(val);
    maxTimeWatchedRef.current = val;
    initialProgressRef.current = val;
  }, [initialProgress, src]);

  // Handle initial seek when initialProgress is loaded or changed
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !initialProgress || initialProgress <= 0) return;

    const performSeek = () => {
      if (video.duration > 0 && initialProgress < video.duration) {
        // Only seek if we are far from the initialProgress (e.g. at the beginning)
        if (Math.abs(video.currentTime - initialProgress) > 1.5) {
          video.currentTime = initialProgress;
        }
      }
    };

    // If metadata is already loaded, seek immediately
    if (video.readyState >= 1) {
      performSeek();
    } else {
      // Otherwise wait for metadata to load
      video.addEventListener('loadedmetadata', performSeek, { once: true });
      return () => {
        video.removeEventListener('loadedmetadata', performSeek);
      };
    }
  }, [initialProgress, src]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let isInitialSeeked = false;

    const updateTime = () => {
      setCurrentTime(video.currentTime);
      
      // Update max watched time gradually as the video plays
      if (video.currentTime > maxTimeWatchedRef.current) {
        // Prevent setting maxTimeWatched to a cheated value during seek transition
        if (video.currentTime <= maxTimeWatchedRef.current + 3) {
          maxTimeWatchedRef.current = video.currentTime;
          setMaxTimeWatched(video.currentTime);
        }
      }

      if (onProgressRef.current && video.duration > 0) {
        onProgressRef.current({
          currentTime: video.currentTime,
          duration: video.duration,
          percent: (video.currentTime / video.duration) * 100
        });
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      if (initialProgressRef.current > 0 && initialProgressRef.current < video.duration && !isInitialSeeked) {
        video.currentTime = initialProgressRef.current;
        isInitialSeeked = true;
      }
      if (autoPlay) {
        video.play().catch(e => console.log('Autoplay prevented', e));
      }
    };

    const handleEnded = () => {
      if (onCompleteRef.current) onCompleteRef.current();
    };

    const handleSeeking = () => {
      // ANTI-CHEAT: If user seeks past the furthest watched point + 2s buffer, force them back
      if (video.currentTime > maxTimeWatchedRef.current + 2) {
        video.currentTime = maxTimeWatchedRef.current;
      }
    };

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('seeking', handleSeeking);
    video.addEventListener('play', () => setIsPlaying(true));
    video.addEventListener('pause', () => setIsPlaying(false));

    isInitialSeeked = false;

    // If video is already loaded (e.g. from cache), trigger metadata handler manually
    if (video.readyState >= 1) {
      handleLoadedMetadata();
    }

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('seeking', handleSeeking);
      video.removeEventListener('play', () => setIsPlaying(true));
      video.removeEventListener('pause', () => setIsPlaying(false));
    };
  }, [src, autoPlay]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play().catch(console.error);
      } else {
        videoRef.current.pause();
      }
    }
  };

  const formatTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds)) return '00:00';
    const m = Math.floor(timeInSeconds / 60).toString().padStart(2, '0');
    const s = Math.floor(timeInSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleTimelineClick = (e) => {
    if (duration === 0 || !videoRef.current) return;
    const timeline = e.currentTarget;
    const rect = timeline.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = clickX / rect.width;
    const targetTime = percent * duration;

    // Only allow seeking backward or up to the max time watched
    if (targetTime <= maxTimeWatched + 1) {
      videoRef.current.currentTime = targetTime;
    } else {
      videoRef.current.currentTime = maxTimeWatched;
    }
  };

  return (
    <div className="custom-video-wrapper" style={{ width: '100%', background: '#1e293b', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)' }}>
      {/* Video element */}
      <video
        ref={videoRef}
        src={src}
        className="custom-video"
        disablePictureInPicture
        onClick={togglePlay}
        onContextMenu={(e) => e.preventDefault()}
        style={{ width: '100%', display: 'block', maxHeight: '55vh', background: '#000', cursor: 'pointer' }}
      />
      
      {/* Custom Controls fixed below the video */}
      <div style={{ background: '#0f172a', padding: '15px', display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid #334155' }}>
        {/* Timeline */}
        <div 
          onClick={handleTimelineClick}
          style={{ position: 'relative', height: '6px', background: 'rgba(255, 255, 255, 0.2)', borderRadius: '3px', cursor: 'pointer' }}
        >
          {/* Buffered / Max watched track */}
          <div 
            style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${duration > 0 ? (maxTimeWatched / duration) * 100 : 0}%`, background: 'rgba(255, 255, 255, 0.4)', borderRadius: '3px' }}
          ></div>
          {/* Current progress */}
          <div 
            style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`, background: '#00B1B0', borderRadius: '3px' }}
          ></div>
        </div>

        {/* Buttons Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button 
              onClick={togglePlay} 
              style={{ background: 'none', border: 'none', color: '#fff', fontSize: '18px', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {isPlaying ? '⏸' : '▶'}
            </button>
            <span style={{ fontSize: '13px', fontFamily: 'monospace', color: '#cbd5e1' }}>
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ fontSize: '12px', color: '#94a3b8', background: '#1e293b', padding: '3px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              🔒 Khóa tua nhanh
            </span>
            <button 
              onClick={() => {
                if (videoRef.current) {
                  if (videoRef.current.requestFullscreen) videoRef.current.requestFullscreen();
                  else if (videoRef.current.webkitRequestFullscreen) videoRef.current.webkitRequestFullscreen();
                  else if (videoRef.current.msRequestFullscreen) videoRef.current.msRequestFullscreen();
                }
              }} 
              style={{ background: 'none', border: 'none', color: '#fff', fontSize: '16px', cursor: 'pointer', padding: 0 }}
            >
              🔲
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
