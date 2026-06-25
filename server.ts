import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import crypto from "crypto";

interface IPTVChannel {
  id: string;
  name: string;
  logo: string;
  group: string;
  url: string;
}

interface Cache {
  data: {
    channels: IPTVChannel[];
    groups: string[];
  };
  timestamp: number;
}

const playlistCache: Record<string, Cache> = {};
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes cache

// Helper function to parse M3U file contents
function parseM3U(content: string): IPTVChannel[] {
  const lines = content.split(/\r?\n/);
  const channels: IPTVChannel[] = [];
  let currentChannel: Partial<IPTVChannel> | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (line.startsWith("#EXTINF:")) {
      currentChannel = {};
      
      // Parse logo: tvg-logo="..." or logo="..."
      const logoMatch = line.match(/(?:tvg-logo|logo)="([^"]+)"/i);
      if (logoMatch) {
        currentChannel.logo = logoMatch[1];
      }

      // Parse group/category: group-title="..." or tvg-group="..."
      const groupMatch = line.match(/(?:group-title|tvg-group)="([^"]+)"/i);
      if (groupMatch) {
        currentChannel.group = groupMatch[1];
      } else {
        currentChannel.group = "General";
      }

      // Parse name: comma followed by the channel name
      const commaIndex = line.lastIndexOf(",");
      if (commaIndex !== -1) {
        currentChannel.name = line.substring(commaIndex + 1).trim();
      } else {
        currentChannel.name = "Unnamed Channel";
      }
    } else if (!line.startsWith("#") && currentChannel) {
      currentChannel.url = line;
      // Create a stable unique ID based on md5 hash of the stream URL to avoid duplicates/flickering
      const urlHash = crypto.createHash("md5").update(line).digest("hex").substring(0, 16);
      currentChannel.id = `${urlHash}-${channels.length}`;
      
      channels.push({
        id: currentChannel.id,
        name: currentChannel.name || "Unknown Channel",
        logo: currentChannel.logo || "",
        group: currentChannel.group || "General",
        url: currentChannel.url,
      });
      
      currentChannel = null;
    }
  }

  return channels;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse JSON
  app.use(express.json());

  // API to fetch and parse M3U IPTV playlist
  app.get("/api/playlist", async (req, res) => {
    const playlistUrl = (req.query.url as string) || "https://is.gd/yQuS1g.m3u";

    try {
      const now = Date.now();
      const cached = playlistCache[playlistUrl];

      // Return cached version if valid
      if (cached && now - cached.timestamp < CACHE_DURATION) {
        return res.json(cached.data);
      }

      // Fetch from target URL with short timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout

      const response = await fetch(playlistUrl, {
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Failed to fetch playlist: ${response.status} ${response.statusText}`);
      }

      const m3uText = await response.text();
      const channels = parseM3U(m3uText);

      // Extract unique sorted groups, prioritizing prominent ones
      const groupSet = new Set<string>();
      channels.forEach(ch => {
        if (ch.group) groupSet.add(ch.group);
      });
      const groups = Array.from(groupSet).sort();

      const result = { channels, groups };

      // Cache the result
      playlistCache[playlistUrl] = {
        data: result,
        timestamp: now,
      };

      res.json(result);
    } catch (error: any) {
      console.error("Error fetching or parsing M3U:", error);
      res.status(500).json({
        error: "Failed to parse IPTV playlist",
        details: error.message || error,
      });
    }
  });

  // API to serve/proxy TS stream segments if required to fix mixed content/CORS on web player
  // But streaming should ideally go directly from clients if possible, or they can use extension mode
  app.get("/api/health", (req, res) => {
    res.json({ status: "healthy", time: new Date().toISOString() });
  });

  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`IPTV Player Server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
