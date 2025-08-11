import { useCallback, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";
import "./index.css";

type DetectionMap = Record<string, string>;

const API_URL = "http://127.0.0.1:5000/upload";

function useUpload() {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string>("");
  const [results, setResults] = useState<DetectionMap | null>(null);
  const [videoObjectUrl, setVideoObjectUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  const upload = useCallback(async (file: File) => {
    setIsUploading(true);
    setResults(null);
    setStatus("");
    setProgress(0);

    const formData = new FormData();
    formData.append("video", file);

    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", API_URL, true);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const pct = Math.round((e.loaded / e.total) * 100);
          setProgress(pct);
        }
      };

      xhr.onload = () => {
        try {
          if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            setStatus(response.message ?? "Upload complete");
            if (response.detection_results) {
              setResults(response.detection_results as DetectionMap);
            }
            resolve();
          } else {
            setStatus("Upload failed");
            reject(new Error("Upload failed"));
          }
        } catch (err) {
          setStatus("Invalid server response");
          reject(err);
        } finally {
          setProgress(0);
          setIsUploading(false);
        }
      };

      xhr.onerror = () => {
        setStatus("Network error");
        setIsUploading(false);
        reject(new Error("Network error"));
      };

      xhr.send(formData);
    });
  }, []);

  const setVideo = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    setVideoObjectUrl(url);
  }, []);

  return { progress, status, results, videoObjectUrl, isUploading, upload, setVideo };
}

function ProgressBar({ value }: { value: number }) {
  const display = Math.min(100, Math.max(0, value));
  return (
    <div className="w-full h-3 rounded-full glass overflow-hidden">
      <motion.div
        className="h-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-purple-500"
        initial={{ width: 0 }}
        animate={{ width: `${display}%` }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
      />
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="px-2 py-1 text-xs rounded-full bg-white/10 border border-white/20">
      {children}
    </span>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-start">
      <span className="text-xs text-white/60">{label}</span>
      <span className="text-base font-semibold">{value}</span>
    </div>
  );
}

export default function App() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { progress, status, results, videoObjectUrl, isUploading, upload, setVideo } = useUpload();
  const [fileName, setFileName] = useState<string>("");

  const resultCounts = useMemo(() => {
    if (!results) return null;
    const counts: Record<string, number> = {};
    Object.values(results).forEach((label) => {
      counts[label] = (counts[label] || 0) + 1;
    });
    return counts;
  }, [results]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setVideo(file);
  };

  const onUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;
    await upload(file);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-30 backdrop-blur-md/0">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl glass grid place-items-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 3l7 4v10l-7 4-7-4V7l7-4z" stroke="white" strokeOpacity=".9" strokeWidth="1.2"/>
                <circle cx="12" cy="12" r="3.5" fill="url(#g)"/>
                <defs>
                  <linearGradient id="g" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#8B5CF6"/>
                    <stop offset="1" stopColor="#6D28D9"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="font-semibold">Deepfake Detection</div>
            <Badge>Beta</Badge>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <Stat label="Security" value="On-device + Cloud" />
            <Stat label="Model" value="Hybrid CNN/ViT" />
            <Stat label="API" value="Flask" />
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-10 grid lg:grid-cols-2 gap-8 items-start">
          {/* Left: Upload + Preview */}
          <motion.section
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="glass rounded-2xl p-6 md:p-8 shadow-2xl/30"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold tracking-tight">Upload a video to analyze</h2>
              <Badge>MP4, MOV, WEBM</Badge>
            </div>

            <form onSubmit={onUpload} className="space-y-6">
              <div
                className={clsx(
                  "rounded-xl border border-white/15 p-4 md:p-6 transition-colors",
                  "bg-gradient-to-b from-white/5 to-white/[0.03] hover:from-white/10 hover:to-white/[0.06]"
                )}
              >
                <input
                  ref={fileInputRef}
                  id="fileInput"
                  type="file"
                  accept="video/*"
                  onChange={onFileChange}
                  className="block w-full text-sm text-white/80 file:mr-4 file:rounded-lg file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-white hover:file:bg-white/20 cursor-pointer"
                />
                {fileName && (
                  <p className="mt-3 text-xs text-white/70">Selected: {fileName}</p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={isUploading || !fileName}
                  className={clsx(
                    "inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-medium",
                    "bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-400 hover:to-purple-500",
                    "focus:outline-none focus:ring-2 focus:ring-violet-500/50 disabled:opacity-50"
                  )}
                >
                  {isUploading ? "Uploading…" : "Upload & Analyze"}
                </button>
                <AnimatePresence>
                  {isUploading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1">
                      <ProgressBar value={progress} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {status && (
                <p className="text-sm text-white/80">{status}</p>
              )}

              <AnimatePresence>
                {videoObjectUrl && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="mt-2 rounded-xl overflow-hidden border border-white/15"
                  >
                    <video src={videoObjectUrl} controls className="w-full aspect-video bg-black/40" />
                  </motion.div>
                )}
              </AnimatePresence>
            </form>

            {/* Decorative hero image */}
            <div className="mt-8 grid grid-cols-2 gap-4">
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1600&auto=format&fit=crop"
                alt="AI face composite"
                className="rounded-xl object-cover h-36 w-full opacity-90"
              />
              <img
                src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1600&auto=format&fit=crop"
                alt="Neural grids"
                className="rounded-xl object-cover h-36 w-full opacity-90"
              />
            </div>
          </motion.section>

          {/* Right: Results */}
          <motion.section
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="glass rounded-2xl p-6 md:p-8"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold tracking-tight">Deepfake Detection Results</h2>
              {resultCounts && (
                <div className="flex items-center gap-2 text-xs">
                  {Object.entries(resultCounts).map(([k, v]) => (
                    <Badge key={k}>{k}: {v}</Badge>
                  ))}
                </div>
              )}
            </div>

            {!results ? (
              <div className="mt-8 text-sm text-white/70">
                Upload a video to see frame-level predictions and summaries here.
              </div>
            ) : (
              <div className="mt-6 space-y-6">
                <div className="max-h-72 overflow-auto code-scroll rounded-xl border border-white/10 bg-black/30 p-4 text-xs leading-relaxed">
                  <pre className="whitespace-pre-wrap break-words">
                    {JSON.stringify(results, null, 2)}
                  </pre>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(results).slice(0, 6).map(([frame, label]) => (
                    <div key={frame} className="rounded-xl overflow-hidden border border-white/10 bg-white/[0.02]">
                      <div className="h-28 bg-gradient-to-br from-purple-700/40 to-violet-600/40 grid place-items-center">
                        <span className="text-xs px-2 py-1 rounded bg-black/40 border border-white/10">
                          {frame}
                        </span>
                      </div>
                      <div className="p-3 text-sm flex items-center justify-between">
                        <span className="text-white/80">{label}</span>
                        <span className={clsx("w-2 h-2 rounded-full", label.toLowerCase().includes("deepfake") ? "bg-rose-400" : "bg-emerald-400")}></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.section>
        </div>
      </main>

      <footer className="py-8 text-center text-xs text-white/60">
        Built with React, Tailwind, and framer-motion
      </footer>
    </div>
  );
}
