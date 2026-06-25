import React, { useEffect, useState } from "react";
import { 
  Play, 
  Tv, 
  Search, 
  Star, 
  Laptop, 
  Smartphone, 
  Grid, 
  List, 
  Compass, 
  HelpCircle, 
  Flame, 
  RefreshCw, 
  ArrowRight, 
  Globe, 
  Cpu, 
  Download 
} from "lucide-react";
import { IPTVChannel, PlaylistData } from "./types";
import VideoPlayer from "./components/VideoPlayer";
import ExtensionExporter from "./components/ExtensionExporter";

export default function App() {
  const [channels, setChannels] = useState<IPTVChannel[]>([]);
  const [groups, setGroups] = useState<string[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>("All");
  const [selectedChannel, setSelectedChannel] = useState<IPTVChannel | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Custom or default M3U playlist URL
  const defaultPlaylistUrl = "https://is.gd/yQuS1g.m3u";
  const [playlistUrl, setPlaylistUrl] = useState(defaultPlaylistUrl);
  const [urlInput, setUrlInput] = useState(defaultPlaylistUrl);

  // Layout mode states
  const [activeTab, setActiveTab] = useState<"player" | "exporter">("player");
  const [isPopupMode, setIsPopupMode] = useState(false); // Toggle extension simulator frame
  const [viewStyle, setViewStyle] = useState<"grid" | "list">("list");

  // Load favorites on startup
  useEffect(() => {
    const saved = localStorage.getItem("iptv_favorites");
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse favorites", e);
      }
    }
  }, []);

  // Fetch playlist data
  useEffect(() => {
    const fetchPlaylist = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/playlist?url=${encodeURIComponent(playlistUrl)}`);
        if (!response.ok) {
          throw new Error(`Server returned ${response.status} ${response.statusText}`);
        }
        const data: PlaylistData = await response.json();
        
        setChannels(data.channels || []);
        setGroups(data.groups || []);
        
        // Auto-select first channel if available
        if (data.channels && data.channels.length > 0) {
          setSelectedChannel(data.channels[0]);
        } else {
          setSelectedChannel(null);
        }
      } catch (err: any) {
        console.error("Fetch error:", err);
        setError(err.message || "Could not connect to the playlist server.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlaylist();
  }, [playlistUrl]);

  // Handle Favorites toggle
  const toggleFavorite = (channelId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent choosing the channel
    const nextFavorites = favorites.includes(channelId)
      ? favorites.filter((id) => id !== channelId)
      : [...favorites, channelId];

    setFavorites(nextFavorites);
    localStorage.setItem("iptv_favorites", JSON.stringify(nextFavorites));
  };

  // Submit new playlist URL
  const handlePlaylistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) {
      setPlaylistUrl(urlInput.trim());
    }
  };

  // Reset playlist URL to default
  const handleResetPlaylist = () => {
    setUrlInput(defaultPlaylistUrl);
    setPlaylistUrl(defaultPlaylistUrl);
  };

  // Filter channels based on selected category and search query
  const filteredChannels = channels.filter((channel) => {
    // 1. Group filtering
    if (selectedGroup === "⭐ Favorites") {
      if (!favorites.includes(channel.id)) return false;
    } else if (selectedGroup !== "All") {
      if (channel.group !== selectedGroup) return false;
    }

    // 2. Search filtering
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      const nameMatch = channel.name.toLowerCase().includes(query);
      const groupMatch = channel.group.toLowerCase().includes(query);
      return nameMatch || groupMatch;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-[#0c0d12] text-slate-100 font-sans flex flex-col relative overflow-x-hidden selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Background Mesh Gradients */}
      <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-100px] right-[-100px] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[150px] pointer-events-none"></div>
      
      {/* Dynamic Header */}
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-xl sticky top-0 z-30 px-4 py-3 md:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Tv className="w-5 h-5 text-white stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-tight text-white leading-none">Bangla IPTV Player Pro</h1>
                <span className="px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[9px] font-bold font-mono tracking-wider uppercase border border-indigo-500/30">Ext V1</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">High-Performance Stream & Extension Suite</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 backdrop-blur-md">
            <button
              onClick={() => setActiveTab("player")}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                activeTab === "player"
                  ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/20 font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-current" /> Player
            </button>
            <button
              onClick={() => setActiveTab("exporter")}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                activeTab === "exporter"
                  ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/20 font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Download className="w-3.5 h-3.5" /> Chrome Extension Hub
            </button>
          </div>

          {/* Layout Mode Toggles */}
          <div className="hidden md:flex items-center gap-2">
            <span className="text-[11px] text-slate-500 font-medium mr-1">Preview View:</span>
            <button
              onClick={() => setIsPopupMode(false)}
              className={`p-1.5 rounded-lg border transition ${
                !isPopupMode
                  ? "bg-indigo-500/20 text-indigo-400 border-indigo-500/30"
                  : "bg-transparent text-slate-500 border-transparent hover:text-slate-300"
              }`}
              title="Full-Screen Web Mode"
            >
              <Laptop className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsPopupMode(true)}
              className={`p-1.5 rounded-lg border transition ${
                isPopupMode
                  ? "bg-indigo-500/20 text-indigo-400 border-indigo-500/30"
                  : "bg-transparent text-slate-500 border-transparent hover:text-slate-300"
              }`}
              title="Extension Popup Mode"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>

        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 flex flex-col justify-center relative z-10">
        
        {isPopupMode && activeTab === "player" ? (
          /* ==========================================
             SIMULATED CHROME EXTENSION POPUP FRAME
             ========================================== */
          <div className="flex flex-col items-center py-4">
            <div className="mb-4 text-center">
              <span className="px-3 py-1 bg-white/5 border border-white/10 backdrop-blur-md rounded-full text-xs text-slate-400 font-mono">
                📱 Simulated Chrome Extension Popup (400 × 600)
              </span>
            </div>
            
            <div className="w-[380px] h-[600px] bg-[#0d0e14]/90 border-[6px] border-white/10 rounded-[32px] shadow-2xl overflow-hidden flex flex-col relative backdrop-blur-2xl">
              
              {/* Simulated Extension Header */}
              <div className="bg-white/5 px-4 py-3 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-indigo-500 flex items-center justify-center">
                    <Tv className="w-3.5 h-3.5 text-white font-bold" />
                  </div>
                  <span className="text-xs font-bold text-white tracking-tight">Bangla IPTV Pro</span>
                </div>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-indigo-950/40 text-indigo-300 border border-indigo-900/30">CORS Bypassed</span>
              </div>

              {/* Dynamic Video Stage in Extension Popup */}
              <div className="bg-black/40">
                <VideoPlayer
                  url={selectedChannel?.url || ""}
                  name={selectedChannel?.name || "No Channel Selected"}
                  logo={selectedChannel?.logo}
                />
              </div>

              {/* Search in popup */}
              <div className="px-3 py-2 bg-white/5 border-b border-white/10 flex items-center gap-1.5">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 w-3.5 h-3.5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="চ্যানেল খুঁজুন (Search channels)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-[11px] placeholder-slate-600 rounded-lg pl-7 pr-3 py-1.5 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 text-white transition"
                  />
                </div>
              </div>

              {/* Categories scroll in popup */}
              <div className="px-3 py-1.5 bg-white/5 flex gap-1 overflow-x-auto scrollbar-none border-b border-white/10">
                <button
                  onClick={() => setSelectedGroup("All")}
                  className={`px-2 py-1 rounded text-[10px] whitespace-nowrap transition font-medium ${
                    selectedGroup === "All"
                      ? "bg-indigo-500 text-white"
                      : "bg-white/5 text-slate-400 hover:text-white"
                  }`}
                >
                  All ({channels.length})
                </button>
                
                {favorites.length > 0 && (
                  <button
                    onClick={() => setSelectedGroup("⭐ Favorites")}
                    className={`px-2 py-1 rounded text-[10px] whitespace-nowrap transition font-medium flex items-center gap-1 ${
                      selectedGroup === "⭐ Favorites"
                        ? "bg-indigo-500 text-white"
                        : "bg-white/5 text-indigo-300 hover:bg-white/10"
                    }`}
                  >
                    ⭐ Saved ({favorites.length})
                  </button>
                )}

                {groups.map((grp) => (
                  <button
                    key={grp}
                    onClick={() => setSelectedGroup(grp)}
                    className={`px-2 py-1 rounded text-[10px] whitespace-nowrap transition font-medium ${
                      selectedGroup === grp
                        ? "bg-indigo-500 text-white"
                        : "bg-white/5 text-slate-400 hover:text-white"
                    }`}
                  >
                    {grp}
                  </button>
                ))}
              </div>

              {/* Channels list scroll in popup */}
              <div className="flex-1 overflow-y-auto p-3 bg-black/20 space-y-1.5">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <RefreshCw className="w-6 h-6 text-indigo-500 animate-spin mb-2" />
                    <span className="text-[10px] text-slate-500 font-mono">Loading streams...</span>
                  </div>
                ) : filteredChannels.length === 0 ? (
                  <div className="text-center py-10 text-slate-500 text-xs">
                    কোনো চ্যানেল পাওয়া যায়নি!
                  </div>
                ) : (
                  filteredChannels.map((channel) => {
                    const isFav = favorites.includes(channel.id);
                    const isSelected = selectedChannel?.id === channel.id;
                    return (
                      <div
                        key={channel.id}
                        onClick={() => setSelectedChannel(channel)}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition border ${
                          isSelected 
                            ? "bg-indigo-500/20 border-indigo-500/30 text-white" 
                            : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center text-[10px] font-bold overflow-hidden border border-white/10 shrink-0">
                            {channel.logo ? (
                              <img 
                                src={channel.logo} 
                                alt="" 
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            ) : null}
                            <span className="text-slate-400 uppercase">{channel.name.charAt(0)}</span>
                          </div>
                          <div className="min-w-0">
                            <h4 className={`text-xs font-semibold truncate ${isSelected ? "text-indigo-300" : "text-slate-200"}`}>
                              {channel.name}
                            </h4>
                            <span className="text-[9px] text-slate-500 block truncate">{channel.group}</span>
                          </div>
                        </div>

                        <button
                          onClick={(e) => toggleFavorite(channel.id, e)}
                          className="p-1 rounded text-slate-500 hover:text-indigo-400 transition"
                        >
                          <Star className={`w-3.5 h-3.5 ${isFav ? "text-indigo-400 fill-current" : ""}`} />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
              
              {/* Home Indicator */}
              <div className="bg-white/5 py-2 border-t border-white/10 flex justify-center">
                <div className="w-24 h-1 rounded-full bg-white/20" />
              </div>
            </div>
          </div>
        ) : activeTab === "player" ? (
          /* ==========================================
             FULL RESPONSIVE WIDESCREEN PLAYER VIEW
             ========================================== */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Control Sidebar & Channel Select (4 columns) */}
            <div className="lg:col-span-4 space-y-5">
              
              {/* Playlist Feed Selector */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-xl shadow-xl">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-indigo-400" />
                  M3U Playlist Feed (লাইভ ফিড)
                </h3>
                
                <form onSubmit={handlePlaylistSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="Enter M3U stream list URL..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg text-xs px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 bg-indigo-500 text-white hover:bg-indigo-400 rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-md shadow-indigo-500/10"
                  >
                    Load
                  </button>
                </form>

                {playlistUrl !== defaultPlaylistUrl && (
                  <button
                    onClick={handleResetPlaylist}
                    className="mt-2 text-[10px] text-slate-500 hover:text-slate-300 underline block"
                  >
                    Reset to Default Playlist
                  </button>
                )}
              </div>

              {/* Main Directory & Categories Card */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-xl shadow-xl flex flex-col max-h-[560px]">
                
                {/* Search Header */}
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="চ্যানেল খুঁজুন (Search channels/genres)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 text-xs placeholder-slate-600 rounded-lg pl-9 pr-3 py-2.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 text-white transition"
                    />
                  </div>
                </div>

                {/* Categories Tabs Carousel */}
                <div className="mb-3">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Categories (বিভাগসমূহ)</h4>
                  <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none">
                    <button
                      onClick={() => setSelectedGroup("All")}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                        selectedGroup === "All"
                          ? "bg-indigo-500 text-white font-bold"
                          : "bg-white/5 text-slate-400 hover:text-white border border-white/10"
                      }`}
                    >
                      All ({channels.length})
                    </button>

                    {favorites.length > 0 && (
                      <button
                        onClick={() => setSelectedGroup("⭐ Favorites")}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1 ${
                          selectedGroup === "⭐ Favorites"
                            ? "bg-indigo-500 text-white font-bold"
                            : "bg-white/5 text-indigo-300 hover:bg-white/10 border border-white/10"
                        }`}
                      >
                        ⭐ Saved ({favorites.length})
                      </button>
                    )}

                    {groups.map((grp) => (
                      <button
                        key={grp}
                        onClick={() => setSelectedGroup(grp)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                          selectedGroup === grp
                            ? "bg-indigo-500 text-white font-bold"
                            : "bg-white/5 text-slate-400 hover:text-white border border-white/10"
                        }`}
                      >
                        {grp}
                      </button>
                    ))}
                  </div>
                </div>

                {/* List Style Controller */}
                <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
                  <span className="text-[10px] text-slate-400 font-mono">
                    Showing {filteredChannels.length} streams
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setViewStyle("list")}
                      className={`p-1 rounded ${viewStyle === "list" ? "bg-white/10 text-indigo-400" : "text-slate-500 hover:text-slate-300"}`}
                    >
                      <List className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setViewStyle("grid")}
                      className={`p-1 rounded ${viewStyle === "grid" ? "bg-white/10 text-indigo-400" : "text-slate-500 hover:text-slate-300"}`}
                    >
                      <Grid className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Channel List Container */}
                <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 max-h-[340px]">
                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-16">
                      <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mb-2.5" />
                      <span className="text-xs text-slate-500 font-mono">Decoding M3U file content...</span>
                    </div>
                  ) : error ? (
                    <div className="text-center py-12 p-4">
                      <p className="text-red-400 text-xs font-medium">{error}</p>
                      <button 
                        onClick={() => setPlaylistUrl(defaultPlaylistUrl)}
                        className="mt-3 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg text-xs border border-white/10 transition"
                      >
                        Load Default Playlist
                      </button>
                    </div>
                  ) : filteredChannels.length === 0 ? (
                    <div className="text-center py-14 text-slate-500 text-xs">
                      এই ক্যাটাগরিতে কোনো চ্যানেল পাওয়া যায়নি!
                    </div>
                  ) : viewStyle === "list" ? (
                    // List View Layout
                    filteredChannels.map((channel) => {
                      const isFav = favorites.includes(channel.id);
                      const isSelected = selectedChannel?.id === channel.id;
                      return (
                        <div
                          key={channel.id}
                          onClick={() => setSelectedChannel(channel)}
                          className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition border ${
                            isSelected 
                              ? "bg-indigo-500/20 border-indigo-500/30 text-white" 
                              : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {/* Channel Icon */}
                            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-xs font-bold overflow-hidden border border-white/10 shrink-0">
                              {channel.logo ? (
                                <img 
                                  src={channel.logo} 
                                  alt="" 
                                  className="w-full h-full object-contain"
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                  }}
                                />
                              ) : null}
                              <span className="text-slate-500 uppercase">{channel.name.charAt(0)}</span>
                            </div>
                            <div className="min-w-0">
                              <h4 className={`text-xs font-bold truncate ${isSelected ? "text-indigo-300" : "text-slate-200"}`}>
                                {channel.name}
                              </h4>
                              <span className="text-[10px] text-slate-500 block truncate font-mono mt-0.5">{channel.group}</span>
                            </div>
                          </div>

                          <button
                            onClick={(e) => toggleFavorite(channel.id, e)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-400 hover:bg-white/10 transition"
                            title={isFav ? "Remove from Favorites" : "Save to Favorites"}
                          >
                            <Star className={`w-4 h-4 ${isFav ? "text-indigo-400 fill-current" : ""}`} />
                          </button>
                        </div>
                      );
                    })
                  ) : (
                    // Grid View Layout
                    <div className="grid grid-cols-2 gap-2">
                      {filteredChannels.map((channel) => {
                        const isFav = favorites.includes(channel.id);
                        const isSelected = selectedChannel?.id === channel.id;
                        return (
                          <div
                            key={channel.id}
                            onClick={() => setSelectedChannel(channel)}
                            className={`p-3 rounded-xl cursor-pointer transition border flex flex-col justify-between aspect-square relative ${
                              isSelected 
                                ? "bg-indigo-500/20 border-indigo-500/30 text-white" 
                                : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10"
                            }`}
                          >
                            <button
                              onClick={(e) => toggleFavorite(channel.id, e)}
                              className="absolute top-2 right-2 p-1 rounded-md text-slate-500 hover:text-indigo-400 bg-white/10 hover:bg-white/20 transition"
                            >
                              <Star className={`w-3.5 h-3.5 ${isFav ? "text-indigo-400 fill-current" : ""}`} />
                            </button>

                            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-sm font-bold overflow-hidden border border-white/10 self-center mt-3">
                              {channel.logo ? (
                                <img 
                                  src={channel.logo} 
                                  alt="" 
                                  className="w-full h-full object-contain"
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                  }}
                                />
                              ) : null}
                              <span className="text-slate-500 uppercase">{channel.name.charAt(0)}</span>
                            </div>

                            <div className="text-center mt-2">
                              <h4 className={`text-[11px] font-bold truncate ${isSelected ? "text-indigo-300" : "text-slate-200"}`}>
                                {channel.name}
                              </h4>
                              <span className="text-[9px] text-slate-500 block truncate font-mono mt-0.5">{channel.group}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>

            </div>

            {/* Right Media Player Stage (8 columns) */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Central Video Player */}
              <VideoPlayer
                url={selectedChannel?.url || ""}
                name={selectedChannel?.name || "No Channel Selected"}
                logo={selectedChannel?.logo}
              />

              {/* Selected Channel Metadata & Streaming specs */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-xl shadow-xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4 mb-4">
                  <div>
                    <h3 className="text-base font-bold text-white tracking-tight">
                      {selectedChannel ? selectedChannel.name : "Select a channel to view specs"}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                      <span className="font-mono text-slate-500">Group:</span>
                      <span className="px-2 py-0.5 bg-indigo-500/20 rounded text-indigo-300 font-medium font-mono text-[10px] border border-indigo-500/30">
                        {selectedChannel ? selectedChannel.group : "N/A"}
                      </span>
                    </p>
                  </div>
                  
                  {selectedChannel && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => toggleFavorite(selectedChannel.id, e)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition flex items-center gap-1.5 ${
                          favorites.includes(selectedChannel.id)
                            ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
                            : "bg-white/5 text-slate-400 border-white/10 hover:text-white"
                        }`}
                      >
                        <Star className={`w-3.5 h-3.5 ${favorites.includes(selectedChannel.id) ? "fill-current" : ""}`} />
                        {favorites.includes(selectedChannel.id) ? "Saved to Favorites" : "Add to Favorites"}
                      </button>
                    </div>
                  )}
                </div>

                {/* Streaming Tips / Specs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <h4 className="font-semibold text-slate-300 mb-1 flex items-center gap-1">
                      <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                      Hardware Acceleration & Decoding
                    </h4>
                    <p className="text-slate-500 leading-relaxed">
                      This application initiates native GPU decoding streams inside your web worker. 
                      This keeps the frame rate highly stable and minimizes background CPU consumption, allowing lag-free, battery-friendly playback.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-slate-300 mb-1 flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5 text-indigo-400" />
                      Direct Stream URL (সরাসরি লিঙ্ক)
                    </h4>
                    {selectedChannel ? (
                      <div className="flex items-center gap-2 mt-1.5">
                        <input
                          type="text"
                          readOnly
                          value={selectedChannel.url}
                          className="w-full bg-white/5 border border-white/10 text-[10px] p-2 rounded text-slate-400 font-mono outline-none"
                        />
                      </div>
                    ) : (
                      <p className="text-slate-500 leading-relaxed">
                        Please select a channel to display its raw .m3u8/TS direct media feed and stream attributes.
                      </p>
                    )}
                  </div>
                </div>

              </div>

            </div>

          </div>
        ) : (
          /* ==========================================
             CHROME EXTENSION EXPORT SUITE VIEW
             ========================================== */
          <div className="max-w-4xl mx-auto">
            <ExtensionExporter />
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-white/5 backdrop-blur-md py-6 mt-12 px-4 text-center">
        <div className="max-w-7xl mx-auto text-slate-500 text-xs">
          <p>© 2026 Bangla IPTV Player Pro. Built with React, Vite & High-Performance HLS Playback.</p>
          <p className="mt-1">Designed with full support for hardware-accelerated video decoding and seamless Chrome Extension integration.</p>
        </div>
      </footer>

    </div>
  );
}
