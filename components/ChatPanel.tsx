"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Loader2, MessageSquare } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  id?: string;
}

export function ChatPanel({ snippetId, code }: { snippetId: string; code: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/chat?snippetId=${snippetId}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setMessages(data);
      })
      .catch(console.error);
  }, [snippetId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const msgText = input;
    setInput("");
    
    const newMessages: ChatMessage[] = [...messages, { role: "user", content: msgText }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          snippetId,
          code,
          message: msgText,
          history: messages
        })
      });
      const data = await res.json();
      if (data.reply) {
        setMessages([...newMessages, { role: "assistant", content: data.reply, id: data.id }]);
      }
    } catch {
      alert("Failed to send message");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px] bg-white border-2 border-gray-200 rounded-lg shadow-lg overflow-hidden">
      <div className="px-6 py-3 bg-gradient-to-r from-gray-50 to-white border-b-2 border-gray-200 flex items-center gap-2">
        <MessageSquare size={20} className="text-primary-600" />
        <span className="text-gray-900 font-bold text-lg">Chat with Code</span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50/50 relative">
        {messages.length === 0 && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center text-center px-4">
            <p className="text-gray-500 font-medium bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200">
              Ask a question about this snippet to get started.
            </p>
          </div>
        )}
        
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-xl p-4 text-sm shadow-sm border ${
              m.role === 'user' 
                ? 'bg-primary-600 text-white border-primary-700 rounded-tr-sm' 
                : 'bg-white text-gray-800 border-gray-200 rounded-tl-sm'
            }`}>
              {m.role === 'user' ? (
                <p className="whitespace-pre-wrap">{m.content}</p>
              ) : (
                <div className="prose prose-sm max-w-none prose-pre:bg-gray-100 prose-pre:text-gray-800 prose-pre:p-3 prose-pre:rounded-lg prose-pre:border prose-pre:border-gray-200 prose-pre:overflow-x-auto prose-p:my-1">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {m.content}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-xl p-4 bg-white border border-gray-200 text-gray-500 text-sm flex items-center gap-3 shadow-sm rounded-tl-sm font-medium">
              <Loader2 size={16} className="animate-spin text-primary-600" /> AI is thinking...
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="p-4 bg-white border-t-2 border-gray-200 flex gap-2 items-center">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Ask a question about this code..."
          className="flex-1 bg-white border-2 border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 placeholder-gray-400 transition-all"
        />
        <button
          onClick={sendMessage}
          disabled={isLoading || !input.trim()}
          className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 px-4 py-2.5 rounded-lg text-white transition-all shadow-md hover:shadow-lg flex items-center justify-center"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
