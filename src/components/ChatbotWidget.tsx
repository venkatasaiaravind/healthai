import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, X, Send, Bot, User, 
  Sparkles, ShieldAlert, ShoppingBag, ArrowRight,
  Maximize2, Minimize2, Trash2, Zap, ShieldCheck
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { collection, addDoc, query, where, orderBy, onSnapshot, doc, updateDoc, arrayUnion, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { RootState } from '../store';
import { ChatMessage } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  const { user, profile } = useSelector((state: RootState) => state.auth);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user || !isOpen) return;

    if (!sessionId) {
      setSessionId(Math.random().toString(36).substring(7));
      setMessages([
        { 
          role: 'bot', 
          content: `Hi ${user.displayName}! I'm your HealthAI research assistant. I can help you find botanical lineages, understand detailed nutritional archives, and optimize your health rhythm. How can I assist you today?`, 
          timestamp: new Date() 
        }
      ]);
    }
  }, [user, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text: string = input) => {
    if (!text.trim() || !user || loading) return;

    const userMessage: ChatMessage = { role: 'user', content: text, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = text;
    setInput('');
    setLoading(true);

    try {
      if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'undefined' || process.env.GEMINI_API_KEY === '') {
        throw new Error('API_KEY_MISSING');
      }

      const history = messages
        .slice(1) // Skip initial greeting
        .map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }]
        }));

      // Double check history starts with user if not empty
      while (history.length > 0 && history[0].role !== 'user') {
        history.shift();
      }

      // Ensure roles alternate correctly
      const finalHistory = [];
      for (const item of history) {
        if (finalHistory.length === 0 || finalHistory[finalHistory.length - 1].role !== item.role) {
          finalHistory.push(item);
        }
      }

      const healthConditions = profile?.healthConditions?.join(', ') || 'None';
      const dietaryPreference = profile?.dietaryPreference || 'Not specified';
      const allergies = profile?.allergies?.join(', ') || 'None';

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        config: {
          systemInstruction: `You are HealthAI's health assistant.
            The user has these conditions: ${healthConditions}.
            Their dietary preference is ${dietaryPreference}.
            Their allergies are ${allergies}.
            You help users find healthy products, understand nutrition, and make better food choices.
            Do NOT give medical diagnoses. Always recommend consulting a doctor for medical conditions.
            Keep responses helpful, professional, and personalized. Use clear, botanical, and sophisticated tone.`,
        },
        contents: [
          ...finalHistory,
          { role: 'user', parts: [{ text: currentInput }] }
        ],
      });

      const botReply = response.text || 'I apologize, but I encountered an error processing your request archive.';
      const botMessage: ChatMessage = { role: 'bot', content: botReply, timestamp: new Date() };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat error', error);
      let errorMessage = "I'm sorry, I'm having trouble connecting to the neural archive right now.";
      if (error instanceof Error && error.message === 'API_KEY_MISSING') {
        errorMessage = "System Configuration Error: The digital archive requires a valid GEMINI_API_KEY to function. Please verify your environment settings.";
      }
      setMessages(prev => [...prev, { role: 'bot', content: errorMessage, timestamp: new Date() }]);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    "Recommend a protein lineage",
    "Diabetic optimization advice",
    "Heart-healthy archive explore",
    "Metabolic goal assistance"
  ];

  if (!user) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            className={`bg-cream shadow-2xl border border-olive/10 mb-4 flex flex-col overflow-hidden transition-all duration-500 ${
              isFullScreen 
                ? 'fixed inset-4 md:inset-10 w-auto h-auto rounded-[48px]' 
                : 'w-[90vw] md:w-[400px] h-[600px] rounded-[40px]'
            }`}
          >
            {/* Header */}
            <div className="bg-olive p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20">
                   <Zap className="w-6 h-6" />
                </div>
                <div>
                   <h3 className="text-xl serif italic leading-none">Healthy Intelligence</h3>
                   <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mt-1">AI Assistant • Online</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setIsFullScreen(!isFullScreen)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                   {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                   <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-sand/10">
              {messages.length <= 1 && (
                <div className="text-center py-10">
                   <div className="w-16 h-16 bg-sand rounded-full flex items-center justify-center mx-auto mb-4 border border-olive/5">
                      <MessageSquare className="w-8 h-8 text-olive/40" />
                   </div>
                   <h4 className="serif italic text-xl text-ink mb-2">Greetings, {user?.displayName || 'User'}</h4>
                   <p className="text-xs text-ink/40 leading-relaxed max-w-[200px] mx-auto font-medium">How may I assist in optimizing your biological rhythm today?</p>
                   
                   <div className="flex flex-wrap justify-center gap-2 mt-8">
                     {quickActions.map((action, i) => (
                       <button 
                        key={i} 
                        onClick={() => handleSend(action)}
                        className="px-4 py-2 bg-paper border border-olive/5 text-[10px] font-black text-olive uppercase tracking-widest rounded-full hover:bg-olive hover:text-white transition-all shadow-sm"
                       >
                         {action}
                       </button>
                     ))}
                   </div>
                </div>
              )}
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-3xl text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-olive text-white shadow-lg shadow-olive/10' 
                      : 'bg-paper text-ink shadow-sm border border-olive/5'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                   <div className="bg-paper p-4 rounded-3xl flex items-center gap-2 border border-olive/5 shadow-sm">
                      <div className="w-2 h-2 bg-olive rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-olive rounded-full animate-bounce [animation-delay:0.2s]"></div>
                      <div className="w-2 h-2 bg-olive rounded-full animate-bounce [animation-delay:0.4s]"></div>
                   </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Disclaimer Bar */}
            <div className="px-6 py-2 bg-sand border-t border-olive/5 flex items-center gap-2">
               <ShieldCheck className="w-3 h-3 text-olive/30" />
               <p className="text-[9px] font-black uppercase tracking-widest text-olive/30 italic leading-none pt-0.5">Informational Archive Access only. Consult a practitioner for health advice.</p>
            </div>

            {/* Input Area */}
            <form 
              onSubmit={(e) => { 
                e.preventDefault(); 
                e.stopPropagation();
                handleSend(); 
              }} 
              className="p-6 bg-paper border-t border-olive/5 relative z-10"
            >
              <div className="relative flex items-center gap-3">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask the research assistant..."
                  autoComplete="off"
                  className="w-full pl-6 pr-14 py-4 bg-cream border border-olive/10 rounded-full outline-none focus:ring-2 focus:ring-olive/10 focus:border-olive transition-all text-sm font-medium"
                />
                <button 
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="absolute right-2 bg-olive text-white p-3 rounded-full hover:bg-olive/90 transition-all disabled:bg-olive/30 shadow-lg shadow-olive/10 z-10 cursor-pointer flex items-center justify-center"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="w-16 h-16 bg-olive text-white rounded-full flex items-center justify-center shadow-2xl shadow-olive/40 relative z-[75] border-4 border-paper group cursor-pointer"
        aria-label={isOpen ? "Close Chatbot" : "Open Chatbot"}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6 group-hover:rotate-12 transition-transform" />}
        {!isOpen && (
           <div className="absolute -top-1 -right-1 w-5 h-5 bg-sand rounded-full border-2 border-olive flex items-center justify-center">
             <div className="w-1.5 h-1.5 bg-olive rounded-full animate-ping"></div>
           </div>
        )}
      </motion.button>
    </div>
  );
}
