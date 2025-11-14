import { useState } from "react";
import { Bot } from "lucide-react";
import { motion } from "framer-motion";
import CopilotChat from "./CopilotChat";

export default function CopilotButton() {
  const [showChat, setShowChat] = useState(false);

  return (
    <>
      {!showChat && (
        <motion.button
          onClick={() => setShowChat(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #FF7B00, #00B4D8)',
            border: 'none',
            boxShadow: '0 8px 32px rgba(255, 123, 0, 0.3)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999
          }}
        >
          <Bot size={28} style={{ color: '#FFFFFF' }} />
        </motion.button>
      )}

      {showChat && (
        <CopilotChat onClose={() => setShowChat(false)} />
      )}
    </>
  );
}