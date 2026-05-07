// src/components/ChatBot.jsx
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../api/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

const ChatBot = ({ sessionContext, userName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `¡Hola ${userName}! Soy **DevLoopBot**. 🤖 Estoy listo para ayudarte con esta misión. ¿Tienes alguna duda sobre el contenido?` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  // Auto-scroll al último mensaje
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setLoading(true);

    try {
      // Llamada a la Edge Function de Supabase
      const { data, error } = await supabase.functions.invoke('gemini-tutor', {
        body: {
          message: userMessage,
          history: messages.slice(-5), // Enviamos los últimos 5 mensajes para contexto
          context: sessionContext,     // El Markdown de la clase actual
          userName: userName
        }
      });

      if (error) throw error;

      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "¡Ups! Mi conexión con el satélite falló. 🛰️ Inténtalo de nuevo." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] font-poppins">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-[350px] md:w-[400px] h-[500px] bg-white rounded-[2rem] shadow-2xl border-2 border-brand-primary overflow-hidden flex flex-col"
          >
            {/* Header del Chat */}
            <div className="bg-brand-primary p-4 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🤖</span>
                <div>
                  <p className="font-black text-sm leading-none">DevLoopBot</p>
                  <p className="text-[10px] opacity-80 uppercase tracking-widest font-bold">Asistente de IA</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:rotate-90 transition-transform">✕</button>
            </div>

            {/* Cuerpo del Chat */}
            <div ref={scrollRef} className="flex-grow p-4 overflow-y-auto space-y-4 bg-gray-50/50">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-brand-primary text-white rounded-tr-none' 
                      : 'bg-white text-gray-700 border border-gray-100 rounded-tl-none'
                  }`}>
                    <div className="prose prose-sm prose-invert max-w-none">
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 animate-pulse flex gap-1">
                    <div className="w-2 h-2 bg-brand-primary rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-brand-primary rounded-full animate-bounce [animation-delay:-.3s]"></div>
                    <div className="w-2 h-2 bg-brand-primary rounded-full animate-bounce [animation-delay:-.5s]"></div>
                  </div>
                </div>
              )}
            </div>

            {/* Input del Chat */}
            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100 flex gap-2">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribe tu duda aquí..."
                className="flex-grow bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-2 text-sm outline-none focus:border-brand-primary transition-all font-medium"
              />
              <button className="bg-brand-primary text-white p-2 rounded-xl shadow-lg active:scale-95 transition-all">
                🚀
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botón Flotante */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-brand-primary text-white rounded-full shadow-[0_8px_0_0_#4338ca] flex items-center justify-center text-3xl z-50 relative"
      >
        {isOpen ? '❌' : '🤖'}
      </motion.button>
    </div>
  );
};

export default ChatBot;