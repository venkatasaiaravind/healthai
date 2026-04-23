import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'motion/react';
import { 
  Bot, User, Send, Sparkles, ShieldAlert,
  Info, Trash2, LayoutGrid, MessageSquare, History
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { RootState } from '../store';
import { ChatMessage } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function ChatPage() {
  const { user, profile } = useSelector((state: RootState) => state.auth);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    setMessages([
      { 
        role: 'bot', 
        content: `Welcome to the HealthAI Interaction Lab, ${user.displayName}. I'm synced with your ${profile?.dietaryPreference} profile. How can I assist with your nutritional decisions today?`, 
        timestamp: new Date() 
      }
    ]);
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !user || loading) return;
    
    const userMsg: ChatMessage = { role: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setLoading(true);

    try {
      if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'undefined' || process.env.GEMINI_API_KEY === '') {
        throw new Error('API_KEY_MISSING');
      }

      const history = messages
        .slice(1)
        .map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }]
        }));

      // Ensure the first message in history is from user
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

      const userProfileInfo = profile 
        ? `User Profile: ${JSON.stringify(profile)}`
        : 'User Profile: Not yet configured. Provide general healthy living and nutritional advice.';

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        config: {
          systemInstruction: `You are the primary HealthAI Assistant.
            ${userProfileInfo}.
            Goal: Provide deep nutritional insights, product recommendations from our catalog, and healthy habit tips.
            Constraint: Always add a disclaimer that you are not a doctor.
            Tone: Professional, clinical, yet encouraging.`,
        },
        contents: [
          ...finalHistory,
          { role: 'user', parts: [{ text: currentInput }] }
        ],
      });

      const reply = response.text || "Connection to neural network timed out. Please retry.";
      setMessages(prev => [...prev, { role: 'bot', content: reply, timestamp: new Date() }]);
    } catch (err) {
      console.error('Chat error', err);
      let errorMessage = "Interface error. Please check your secure connection.";
      if (err instanceof Error && err.message === 'API_KEY_MISSING') {
        errorMessage = "Identity Verification Required: Gemini API Key is missing. Check archive settings.";
      }
      setMessages(prev => [...prev, { role: 'bot', content: errorMessage, timestamp: new Date() }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-6 py-10 h-[calc(100vh-120px)] flex gap-8">
       {/* Sidebar */}
       <aside className="w-80 hidden lg:flex flex-col gap-6">
          <div className="bg-gray-900 rounded-[40px] p-8 text-white shadow-2xl flex-grow overflow-hidden relative group">
             <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform duration-700">
                <Bot className="w-32 h-32" />
             </div>
             <h3 className="text-xl font-bold mb-6 flex items-center gap-3 relative z-10"><Sparkles className="w-5 h-5 text-green-500" /> AI Insights</h3>
             <p className="text-sm text-gray-400 font-medium mb-10 relative z-10 leading-relaxed">Describe your health goals or specific nutritional dilemmas for real-time AI assistance.</p>
             
             <div className="space-y-4 relative z-10">
                <HistoryItem label="Last consultation" value="2 days ago" />
                <HistoryItem label="AI Health Score" value="78/100" />
                <HistoryItem label="Top Category" value="Superfoods" />
             </div>
          </div>

          <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-xl shadow-green-900/5">
             <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Quick Topics</h4>
             <div className="flex flex-wrap gap-2">
                {['Diabetes', 'Muscle Gain', 'Heart Health', 'Weight Loss'].map(t => (
                  <span key={t} className="px-3 py-1 bg-gray-50 text-[10px] font-bold text-gray-500 rounded-full border border-gray-100">{t}</span>
                ))}
             </div>
          </div>
       </aside>

       {/* Chat Area */}
       <div className="flex-grow flex flex-col bg-white rounded-[40px] border border-gray-100 shadow-2xl shadow-green-900/5 overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-white z-10">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-green-500/20">
                   <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                   <h2 className="text-lg font-black text-gray-900 italic tracking-tight">Interactive Assistant</h2>
                   <p className="text-[10px] font-black text-green-500 uppercase tracking-widest flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div> Secure Neural Link Active
                   </p>
                </div>
             </div>
             <button onClick={() => setMessages(messages.slice(0, 1))} className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                <Trash2 className="w-5 h-5" />
             </button>
          </div>

          {/* Medical Disclaimer Bar */}
          <div className="bg-orange-50 px-6 py-2 border-b border-orange-100 flex items-center gap-3">
             <ShieldAlert className="w-4 h-4 text-orange-500" />
             <p className="text-[10px] text-orange-800 font-bold uppercase tracking-widest">Medical Disclaimer: General guidance only. See a physician for diagnosis.</p>
          </div>

          {/* Messages Container */}
          <div className="flex-grow overflow-y-auto p-8 space-y-10 scrollbar-hide">
             {messages.map((m, i) => (
               <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex gap-4 max-w-[80%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                     <div className={`w-10 h-10 rounded-2xl flex-shrink-0 flex items-center justify-center shadow-md ${m.role === 'user' ? 'bg-gray-900' : 'bg-green-500'}`}>
                        {m.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
                     </div>
                     <div className={`p-6 rounded-[32px] shadow-sm leading-relaxed ${m.role === 'user' ? 'bg-gray-900 text-white rounded-tr-none' : 'bg-gray-50 text-gray-800 border border-gray-100 rounded-tl-none'}`}>
                        <p className="text-base font-medium whitespace-pre-wrap">{m.content}</p>
                     </div>
                  </div>
               </div>
             ))}
             {loading && (
               <div className="flex justify-start">
                  <div className="flex gap-4">
                     <div className="w-10 h-10 rounded-2xl bg-green-500 flex items-center justify-center shadow-md">
                        <Bot className="w-5 h-5 text-white" />
                     </div>
                     <div className="bg-gray-50 p-6 rounded-[32px] rounded-tl-none border border-gray-100 flex gap-1.5">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-100"></div>
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-200"></div>
                     </div>
                  </div>
               </div>
             )}
             <div ref={messagesEndRef} />
          </div>

          {/* Input Panel */}
          <div className="p-8 border-t border-gray-50 flex gap-4">
             <div className="flex-grow relative bg-gray-50 rounded-3xl border border-gray-100 focus-within:ring-4 focus-within:ring-green-500/10 focus-within:border-green-500 transition-all">
                <input 
                  type="text" 
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="Ask your health question..." 
                  className="w-full bg-transparent border-none py-5 px-6 outline-none font-bold text-gray-700"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300">
                   <LayoutGrid className="w-5 h-5 hover:text-green-500 cursor-pointer transition-colors" />
                </div>
             </div>
             <button 
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="bg-green-500 text-white px-8 rounded-3xl font-black hover:bg-green-600 shadow-xl shadow-green-500/20 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-2"
             >
                Send <Send className="w-5 h-5" />
             </button>
          </div>
       </div>
    </div>
  );
}

function HistoryItem({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex items-center justify-between group">
       <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest group-hover:text-gray-300 transition-colors">{label}</span>
       <span className="text-xs font-bold text-white">{value}</span>
    </div>
  );
}
