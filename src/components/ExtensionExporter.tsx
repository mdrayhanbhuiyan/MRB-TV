import React, { useState } from "react";
import { Download, FileCode, Check, Copy, HelpCircle, ArrowRight, CheckCircle } from "lucide-react";

export default function ExtensionExporter() {
  const [copiedFile, setCopiedFile] = useState<string | null>(null);

  const manifestCode = `{
  "manifest_version": 3,
  "name": "Bangla IPTV Player Pro",
  "version": "1.0.0",
  "description": "High-performance full-screen and popup IPTV Player with category organization and hardware-accelerated playback.",
  "permissions": [
    "storage",
    "activeTab"
  ],
  "host_permissions": [
    "<all_urls>"
  ],
  "action": {
    "default_popup": "index.html",
    "default_title": "Bangla IPTV Player Pro"
  },
  "background": {
    "service_worker": "background.js"
  }
}`;

  const backgroundCode = `// Bangla IPTV Player Pro - Background Service Worker

chrome.runtime.onInstalled.addListener(() => {
  console.log("Bangla IPTV Player Pro extension installed successfully.");
});
`;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFile(label);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-xl">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 border-b border-white/10 pb-5">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Download className="w-5 h-5" />
            </span>
            Chrome Extension Export Hub
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Build and install this IPTV player as a native desktop Google Chrome Extension.
          </p>
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px] px-2.5 py-1 bg-indigo-950/30 text-indigo-300 border border-indigo-800/50 rounded-full">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          Supports Manifest V3
        </div>
      </div>

      {/* Warning/Benefits of Extension Mode */}
      <div className="bg-indigo-950/20 border border-indigo-900/30 rounded-xl p-4 mb-6 text-slate-300 text-xs backdrop-blur-md">
        <h4 className="font-semibold text-indigo-400 flex items-center gap-1.5 mb-1.5 text-sm">
          💡 কেন ক্রোম এক্সটেনশন ব্যবহার করবেন? (Why Chrome Extension?)
        </h4>
        <p className="leading-relaxed text-slate-300">
          সাধারণ ব্রাউজার সিকিউরিটি (CORS) পলিসির কারণে অনেক ভিডিও স্ট্রিম লিঙ্কের প্লেব্যাক ওয়েবসাইটে ব্লক হয়ে যায়। 
          কিন্তু আপনি যদি এটিকে <strong>Chrome Extension</strong> হিসেবে ব্যবহার করেন, তবে এক্সটেনশন সিকিউরিটি পারমিশন ব্যবহার করে 
          <strong>১০০% চ্যানেল কোনো CORS বাধা ছাড়াই স্মুথলি প্লে হবে</strong>! সাথে হার্ডওয়্যার এক্সিলারেশন ফুল সাপোর্ট করবে।
        </p>
      </div>

      {/* Step by Step instructions */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-white mb-4">🛠️ ইন্সটলেশন গাইড (How to Install & Setup)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex flex-col justify-between backdrop-blur-md">
            <div>
              <span className="text-xs font-mono font-bold text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded border border-indigo-500/30">ধাপ ১</span>
              <h4 className="text-sm font-semibold text-slate-200 mt-2">ফাইল সংগ্রহ (Get Files)</h4>
              <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                এই অ্যাপের <strong>Settings/Export</strong> মেনু থেকে <strong>ZIP</strong> ফাইলটি ডাউনলোড করুন অথবা নিচে দেওয়া কোডগুলো দিয়ে একটি ফোল্ডারে ফাইলগুলো তৈরি করুন।
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-1 text-[11px] text-slate-500">
              ZIP or manually save code
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex flex-col justify-between backdrop-blur-md">
            <div>
              <span className="text-xs font-mono font-bold text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded border border-indigo-500/30">ধাপ ২</span>
              <h4 className="text-sm font-semibold text-slate-200 mt-2">ডেভেলপার মোড (Developer Mode)</h4>
              <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                আপনার গুগল ক্রোম ব্রাউজারে <strong>chrome://extensions/</strong> ইউআরএল-এ যান এবং ডানদিকের কোণায় থাকা <strong>Developer Mode</strong> অপশনটি চালু করুন।
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-1 text-[11px] text-slate-500 font-mono">
              chrome://extensions/
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex flex-col justify-between backdrop-blur-md">
            <div>
              <span className="text-xs font-mono font-bold text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded border border-indigo-500/30">ধাপ ৩</span>
              <h4 className="text-sm font-semibold text-slate-200 mt-2">এক্সটেনশন লোড (Load Extension)</h4>
              <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                বামদিকের কোণায় <strong>Load unpacked</strong> বাটনে ক্লিক করে আপনার আনজিপ করা ফোল্ডারটি (যেখানে build ফাইল এবং manifest.json আছে) সিলেক্ট করে দিন। ব্যাস, তৈরি হয়ে গেল আপনার এক্সটেনশন!
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-1 text-[11px] text-indigo-400">
              <CheckCircle className="w-3.5 h-3.5" /> Ready to stream!
            </div>
          </div>
        </div>
      </div>

      {/* Code Blocks */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-4">📁 এক্সটেনশন কনফিগারেশন ফাইলসমূহ (Configuration Files)</h3>
        
        <div className="space-y-6">
          {/* Manifest.json Code Block */}
          <div className="bg-black/30 border border-white/10 rounded-xl overflow-hidden backdrop-blur-md">
            <div className="bg-white/5 px-4 py-2.5 flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                <FileCode className="w-4 h-4 text-indigo-400" />
                manifest.json
              </div>
              <button
                onClick={() => copyToClipboard(manifestCode, "manifest")}
                className="px-2.5 py-1 text-xs bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 rounded-lg flex items-center gap-1.5 transition active:scale-95 font-medium"
              >
                {copiedFile === "manifest" ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-indigo-300" />
                    Copy Code
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 overflow-x-auto text-[11px] font-mono text-slate-300 bg-[#0c0d12]/40 max-h-56 leading-relaxed">
              <code>{manifestCode}</code>
            </pre>
          </div>

          {/* Background.js Code Block */}
          <div className="bg-black/30 border border-white/10 rounded-xl overflow-hidden backdrop-blur-md">
            <div className="bg-white/5 px-4 py-2.5 flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                <FileCode className="w-4 h-4 text-indigo-400" />
                background.js
              </div>
              <button
                onClick={() => copyToClipboard(backgroundCode, "background")}
                className="px-2.5 py-1 text-xs bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 rounded-lg flex items-center gap-1.5 transition active:scale-95 font-medium"
              >
                {copiedFile === "background" ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-indigo-300" />
                    Copy Code
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 overflow-x-auto text-[11px] font-mono text-slate-300 bg-[#0c0d12]/40 max-h-40 leading-relaxed">
              <code>{backgroundCode}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
