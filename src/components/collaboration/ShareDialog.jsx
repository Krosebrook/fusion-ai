import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Share2, Copy, Mail, Link2, Download, CheckCircle2, X
} from "lucide-react";

export default function ShareDialog({ title, data, type = "config", onClose }) {
  const [copied, setCopied] = useState(false);
  const [shareMethod, setShareMethod] = useState("link");

  const generateShareableLink = () => {
    const encoded = btoa(JSON.stringify(data));
    return `${window.location.origin}/shared/${type}/${encoded}`;
  };

  const shareableLink = generateShareableLink();

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="rounded-2xl border border-white/10 max-w-lg w-full overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.98) 100%)",
            backdropFilter: "blur(20px)"
          }}
        >
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                <Share2 className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Share {title}
                </h3>
                <p className="text-xs text-gray-400">Collaborate with your team</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5 text-gray-400" />
            </Button>
          </div>

          <div className="p-6 space-y-4">
            {/* Share Methods */}
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={shareMethod === "link" ? "default" : "outline"}
                onClick={() => setShareMethod("link")}
                className={shareMethod === "link" ? "bg-gradient-to-r from-blue-500 to-purple-500" : ""}
              >
                <Link2 className="w-4 h-4 mr-2" />
                Link
              </Button>
              <Button
                size="sm"
                variant={shareMethod === "download" ? "default" : "outline"}
                onClick={() => setShareMethod("download")}
                className={shareMethod === "download" ? "bg-gradient-to-r from-blue-500 to-purple-500" : ""}
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>

            {/* Share Link */}
            {shareMethod === "link" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-xs text-gray-400 mb-2">Shareable Link</p>
                  <div className="flex gap-2">
                    <Input
                      value={shareableLink}
                      readOnly
                      className="bg-black/20 border-white/10 text-white font-mono text-xs"
                    />
                    <Button
                      onClick={handleCopyLink}
                      className={copied ? "bg-green-500" : "bg-blue-500"}
                    >
                      {copied ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <p className="text-xs text-blue-400">
                    Anyone with this link can view and import this {type}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Download */}
            {shareMethod === "download" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="p-6 rounded-xl border border-dashed border-white/20 text-center">
                  <Download className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-400 mb-4">
                    Download {type} as JSON file
                  </p>
                  <Button
                    onClick={handleDownload}
                    className="bg-gradient-to-r from-blue-500 to-purple-500"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download JSON
                  </Button>
                </div>

                <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <p className="text-xs text-purple-400">
                    File can be imported back into any pipeline configuration
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}