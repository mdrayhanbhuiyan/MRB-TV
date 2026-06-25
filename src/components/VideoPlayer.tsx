import React, { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { Play, Pause, Volume2, VolumeX, Maximize, RefreshCw, Cpu, AlertTriangle } from "lucide-react";

interface VideoPlayerProps {
  url: string;
  name: string;
  logo?: string;
}

export default function VideoPlayer({ url, name, logo }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isHardwareAccel, setIsHardwareAccel] = useState(true);

  // Watch for source changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !url) return;

    setIsLoading(true);
    setError(null);
    setIsPlaying(false);

    // Clean up existing Hls instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    // Check if the stream is HLS (usually contains .m3u8)
    const isHlsStream = url.includes(".m3u8") || url.includes("m3u8");

    if (isHlsStream) {
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true, // Uses background worker for decoding (hardware-accelerated friendly)
          lowLatencyMode: true,
          backBufferLength: 90,
          capLevelToPlayerSize: true, // Auto-optimizes quality to prevent frame lag
        });

        hlsRef.current = hls;
        hls.loadSource(url);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setIsLoading(false);
          video.play()
            .then(() => setIsPlaying(true))
            .catch(() => {
              // Auto-play might be blocked by browser policies
              setIsPlaying(false);
            });
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          console.warn("HLS.js error:", data);
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                setError("Network error. The stream server might be offline or blocked by CORS restrictions.");
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                setError("Media parsing error. Attempting recovery...");
                hls.recoverMediaError();
                break;
              default:
                setError("An unrecoverable player error occurred. Please verify stream availability.");
                hls.destroy();
                break;
            }
            setIsLoading(false);
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        // Fallback for native HLS support (Safari)
        video.src = url;
        video.addEventListener("loadedmetadata", () => {
          setIsLoading(false);
          video.play()
            .then(() => setIsPlaying(true))
            .catch(() => setIsPlaying(false));
        });
        video.addEventListener("error", () => {
          setError("Failed to load stream. Ensure this link is online and has standard formats.");
          setIsLoading(false);
        });
      } else {
        setError("Your browser does not support HLS streaming. Please use Chrome, Edge, or Safari.");
        setIsLoading(false);
      }
    } else {
      // Direct stream (MP4/WebM etc.)
      video.src = url;
      video.load();
      video.play()
        .then(() => {
          setIsLoading(false);
          setIsPlaying(true);
        })
        .catch((err) => {
          console.error("Direct play error:", err);
          setError("Failed to play video. Check stream accessibility.");
          setIsLoading(false);
        });
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [url]);

  // Handlers for controls
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const val = parseFloat(e.target.value);
    video.volume = val;
    setVolume(val);
    setIsMuted(val === 0);
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.requestFullscreen) {
      video.requestFullscreen();
    } else if ((video as any).webkitRequestFullscreen) {
      (video as any).webkitRequestFullscreen();
    } else if ((video as any).msRequestFullscreen) {
      (video as any).msRequestFullscreen();
    }
  };

  const reloadStream = () => {
    const currentUrl = url;
    videoRef.current?.load();
    if (hlsRef.current) {
      hlsRef.current.loadSource(currentUrl);
      hlsRef.current.startLoad();
    }
  };

  return (
    <div className="relative w-full aspect-video rounded-3xl overflow-hidden bg-black/40 border border-white/10 shadow-2xl group flex flex-col justify-between backdrop-blur-xl">
      {/* Upper Status Bar & Channel Details */}
      <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-[#0c0d12]/90 to-transparent flex items-center justify-between z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="flex items-center gap-3">
          {logo && (
            <img 
              src={logo} 
              alt="" 
              className="w-8 h-8 rounded-md bg-white/5 object-contain p-0.5 border border-white/10"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          )}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-tight leading-none">
              {name || "No Channel Selected"}
            </h4>
            <span className="text-[10px] text-indigo-400 font-mono mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              Live Stream
            </span>
          </div>
        </div>

        {/* Hardware Acceleration & Refresh Indicator */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsHardwareAccel(!isHardwareAccel)}
            className={`px-2 py-1 rounded text-[10px] font-mono font-medium flex items-center gap-1 border transition ${
              isHardwareAccel 
                ? "bg-indigo-950/40 text-indigo-300 border-indigo-500/30" 
                : "bg-white/5 text-slate-400 border-white/10"
            }`}
            title="Hardware Acceleration leverages GPU decoding inside your browser"
          >
            <Cpu className={`w-3.5 h-3.5 ${isHardwareAccel ? "animate-spin-slow text-indigo-400" : ""}`} />
            {isHardwareAccel ? "GPU Decoded (On)" : "GPU Decoded (Off)"}
          </button>
          
          <button
            onClick={reloadStream}
            className="p-1.5 rounded-md bg-white/5 text-slate-300 hover:text-white border border-white/10 transition"
            title="Reload Stream"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Video Window */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden">
        {url ? (
          <video
            ref={videoRef}
            className="w-full h-full object-contain"
            onClick={togglePlay}
            playsInline
            style={{
              imageRendering: "auto",
              // Inline hardware acceleration prompts
              transform: isHardwareAccel ? "translate3d(0, 0, 0)" : "none",
              backfaceVisibility: isHardwareAccel ? "hidden" : "visible",
            }}
          />
        ) : (
          <div className="text-center p-6 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4 shadow-inner backdrop-blur-md">
              <Play className="w-8 h-8 text-slate-400 translate-x-0.5" />
            </div>
            <p className="text-slate-300 font-medium text-sm">Please Select a Channel from the List</p>
            <p className="text-slate-500 text-xs mt-1 max-w-xs leading-relaxed">
              Click any category and channel on the side panels to start playing.
            </p>
          </div>
        )}

        {/* Loading Spinner */}
        {isLoading && (
          <div className="absolute inset-0 bg-[#0c0d12]/70 flex flex-col items-center justify-center z-10 backdrop-blur-sm">
            <RefreshCw className="w-10 h-10 text-indigo-500 animate-spin mb-3" />
            <p className="text-indigo-200 text-xs font-mono">Connecting to Live Feed...</p>
          </div>
        )}

        {/* Error HUD */}
        {error && (
          <div className="absolute inset-0 bg-[#0c0d12]/95 flex flex-col items-center justify-center p-6 text-center z-20 backdrop-blur-md">
            <div className="w-12 h-12 rounded-full bg-red-950/50 border border-red-800/50 flex items-center justify-center mb-3">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <p className="text-red-400 text-sm font-semibold max-w-sm mb-1">{error}</p>
            <p className="text-slate-500 text-xs max-w-md mb-4 leading-relaxed">
              Note: This is often caused by standard browser security (CORS) blocking video streams outside its source website. 
              <strong> Exporting and loading as a Chrome Extension bypasses this completely!</strong>
            </p>
            <button
              onClick={reloadStream}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white rounded-lg border border-white/10 text-xs font-medium transition flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retry Playback
            </button>
          </div>
        )}
      </div>

      {/* Customized Bottom Control Bar */}
      {url && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#0c0d12]/95 to-transparent flex items-center justify-between z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="p-2 rounded-full bg-indigo-500 text-white hover:bg-indigo-400 hover:scale-105 transition active:scale-95 shadow-lg shadow-indigo-500/20"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current translate-x-0.5" />}
            </button>

            {/* Volume Control */}
            <div className="flex items-center gap-2">
              <button onClick={toggleMute} className="text-slate-400 hover:text-white transition">
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 h-1 rounded bg-white/10 accent-indigo-500 cursor-pointer appearance-none outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400">
            {/* Stream Tech Tag */}
            <span className="px-1.5 py-0.5 bg-white/5 rounded text-[9px] text-indigo-300 font-mono uppercase tracking-widest border border-white/10">
              {url.includes(".m3u8") ? "HLS (.m3u8)" : "DIRECT"}
            </span>

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-md hover:bg-white/5 text-slate-400 hover:text-white transition"
              title="Fullscreen"
            >
              <Maximize className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
