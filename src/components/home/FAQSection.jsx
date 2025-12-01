import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQS = [
  {
    question: "What is FlashFusion and how does it work?",
    answer: "FlashFusion is an AI-powered development platform that transforms your concepts into production-ready applications, content, and revenue streams in minutes."
  },
  {
    question: "How does the AI content generation work?",
    answer: "Our AI uses advanced language models to generate code, copy, and creative assets based on your specifications, with 98% accuracy."
  },
  {
    question: "How secure is my data and content?",
    answer: "We use bank-level encryption, SOC 2 compliance, and never share your data. Your intellectual property remains 100% yours."
  },
  {
    question: "Can I use FlashFusion content for commercial purposes?",
    answer: "Yes! All content generated on FlashFusion is yours to use commercially without restrictions."
  },
  {
    question: "Do you offer a free trial?",
    answer: "Yes, all plans come with a 14-day free trial. No credit card is required to get started."
  }
];

function AccordionItem({ question, answer, isOpen, onClick }) {
  return (
    <div className="border-b border-gray-700 py-6">
      <button
        onClick={onClick}
        className="w-full flex justify-between items-center text-left group"
      >
        <h3 className="text-lg font-medium text-white group-hover:text-orange-400 transition-colors">
          {question}
        </h3>
        {isOpen ? (
          <ChevronUp className="text-orange-400 flex-shrink-0" />
        ) : (
          <ChevronDown className="text-gray-400 group-hover:text-orange-400 transition-colors flex-shrink-0" />
        )}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="mt-4 text-gray-400 leading-relaxed">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FAQSection() {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <section id="faq" className="py-32 px-6 bg-slate-900/90 backdrop-blur-md">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold mb-4 text-white font-['Space_Grotesk']">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-400">
            Find answers to common questions about FlashFusion.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800/50 border border-gray-700 rounded-xl p-8"
        >
          {FAQS.map((faq, index) => (
            <AccordionItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={openFaq === index}
              onClick={() => setOpenFaq(openFaq === index ? null : index)}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}