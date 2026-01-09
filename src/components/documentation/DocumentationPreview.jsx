import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";

export default function DocumentationPreview({ documentation }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/10 p-8"
      style={{
        background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.98) 100%)",
        backdropFilter: "blur(20px)",
        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4)"
      }}
    >
      <h1 className="text-4xl font-bold text-white mb-8" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
        {documentation.title}
      </h1>

      {documentation.metadata && (
        <div className="flex gap-6 mb-8 pb-6 border-b border-white/10 text-sm text-gray-400">
          {documentation.metadata.version && (
            <span>Version: {documentation.metadata.version}</span>
          )}
          {documentation.metadata.lastUpdated && (
            <span>Updated: {new Date(documentation.metadata.lastUpdated).toLocaleDateString()}</span>
          )}
        </div>
      )}

      <div className="space-y-8">
        {documentation.sections.map((section, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 text-sm">
                {idx + 1}
              </span>
              {section.title}
            </h2>
            
            <div className="prose prose-invert prose-sm max-w-none mb-6">
              <ReactMarkdown>{section.content}</ReactMarkdown>
            </div>

            {section.subsections && section.subsections.length > 0 && (
              <div className="ml-8 space-y-4">
                {section.subsections.map((sub, subIdx) => (
                  <div key={subIdx} className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-2">{sub.title}</h3>
                    <div className="prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown>{sub.content}</ReactMarkdown>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}