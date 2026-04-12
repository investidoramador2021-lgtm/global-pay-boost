import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";
import { useTranslation } from "react-i18next";
import sarahImg from "@/assets/support-agent-sarah.jpg";
import jamesImg from "@/assets/support-agent-james.jpg";
import priyaImg from "@/assets/support-agent-priya.jpg";

/* ── 3 Support Personas — rotate based on 8-hour shifts ── */
const PERSONAS = [
  { name: "Sarah Mitchell", role: "Customer Support", img: sarahImg, hours: [0, 8] },
  { name: "James Chen", role: "Customer Support", img: jamesImg, hours: [8, 16] },
  { name: "Priya Sharma", role: "Customer Support", img: priyaImg, hours: [16, 24] },
];

function getCurrentPersona() {
  const hour = new Date().getHours();
  return PERSONAS.find((p) => hour >= p.hours[0] && hour < p.hours[1]) || PERSONAS[0];
}

type Msg = { role: "user" | "assistant"; content: string };

/* ── Human-like typing pace: drip tokens with random delays ── */
function randomDelay(min: number, max: number) {
  return new Promise<void>((r) => setTimeout(r, min + Math.random() * (max - min)));
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/support-chat`;

function genSessionId() {
  return `chat_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

const WELCOME_MESSAGES: Record<string, (name: string) => string> = {
  en: (n) => `Hi! I'm ${n} from MRC GlobalPay support. How can I help you today? 😊`,
  es: (n) => `¡Hola! Soy ${n} del equipo de soporte de MRC GlobalPay. ¿En qué puedo ayudarte? 😊`,
  pt: (n) => `Olá! Sou ${n} do suporte MRC GlobalPay. Como posso ajudar? 😊`,
  fr: (n) => `Bonjour ! Je suis ${n} du support MRC GlobalPay. Comment puis-je vous aider ? 😊`,
  ja: (n) => `こんにちは！MRC GlobalPayサポートの${n}です。何かお手伝いできますか？😊`,
  tr: (n) => `Merhaba! MRC GlobalPay destek ekibinden ${n}. Size nasıl yardımcı olabilirim? 😊`,
  hi: (n) => `नमस्ते! मैं MRC GlobalPay सपोर्ट से ${n} हूँ। मैं आपकी कैसे मदद कर सकता/सकती हूँ? 😊`,
  vi: (n) => `Xin chào! Tôi là ${n} từ bộ phận hỗ trợ MRC GlobalPay. Tôi có thể giúp gì cho bạn? 😊`,
  af: (n) => `Hallo! Ek is ${n} van MRC GlobalPay ondersteuning. Hoe kan ek jou help? 😊`,
  fa: (n) => `سلام! من ${n} از تیم پشتیبانی MRC GlobalPay هستم. چطور می‌تونم کمکتون کنم؟ 😊`,
  ur: (n) => `السلام علیکم! میں MRC GlobalPay سپورٹ سے ${n} ہوں۔ میں آپ کی کیسے مدد کر سکتا/سکتی ہوں؟ 😊`,
  he: (n) => `שלום! אני ${n} מצוות התמיכה של MRC GlobalPay. איך אוכל לעזור? 😊`,
  uk: (n) => `Вітаю! Я ${n} з підтримки MRC GlobalPay. Чим можу допомогти? 😊`,
};

const SupportChatWidget = () => {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(genSessionId);
  const persona = useRef(getCurrentPersona());
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const lang = i18n.language?.split("-")[0] || "en";

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // Welcome message in the user's language
  useEffect(() => {
    if (open && messages.length === 0) {
      const p = persona.current;
      const greet = WELCOME_MESSAGES[lang] || WELCOME_MESSAGES.en;
      setMessages([{ role: "assistant", content: greet(p.name) }]);
    }
  }, [open, lang]);

  const saveLog = useCallback(
    async (userMsg: string, aiMsg: string) => {
      try {
        await supabase.from("support_chat_logs" as any).insert({
          session_id: sessionId,
          persona_name: persona.current.name,
          user_message: userMsg,
          ai_response: aiMsg,
          page_url: window.location.pathname,
        } as any);
      } catch {
        /* silent */
      }
    },
    [sessionId]
  );

  const updateAssistant = (text: string) => {
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (last?.role === "assistant" && prev.length > 1 && prev[prev.length - 2]?.role === "user") {
        return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: text } : m));
      }
      return [...prev, { role: "assistant", content: text }];
    });
  };

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    const userMsg: Msg = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    const allMessages = [...messages, userMsg].filter((m) => m.role === "user" || m.role === "assistant");

    try {
      // Simulate initial "reading & typing" delay (0.8–2s) like a real person
      await randomDelay(800, 2000);

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: allMessages, persona: persona.current.name, language: lang }),
      });

      if (!resp.ok || !resp.body) throw new Error("Failed");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let sseBuffer = "";
      const tokenQueue: string[] = [];
      let streamDone = false;
      let fullResponse = "";

      // Producer: read SSE stream and push tokens into queue
      const readStream = async () => {
        // eslint-disable-next-line no-constant-condition
        while (true) {
          const { done, value } = await reader.read();
          if (done) { streamDone = true; break; }
          sseBuffer += decoder.decode(value, { stream: true });

          let idx: number;
          while ((idx = sseBuffer.indexOf("\n")) !== -1) {
            let line = sseBuffer.slice(0, idx);
            sseBuffer = sseBuffer.slice(idx + 1);
            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (!line.startsWith("data: ")) continue;
            const json = line.slice(6).trim();
            if (json === "[DONE]") { streamDone = true; return; }
            try {
              const parsed = JSON.parse(json);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) tokenQueue.push(content);
            } catch {
              sseBuffer = line + "\n" + sseBuffer;
              break;
            }
          }
        }
      };

      // Consumer: drip tokens at human-like pace
      const drip = async () => {
        let displayed = "";
        while (!streamDone || tokenQueue.length > 0) {
          if (tokenQueue.length > 0) {
            const chunk = tokenQueue.shift()!;
            // Drip character by character for short chunks, word-by-word for longer
            const chars = chunk.split("");
            for (const char of chars) {
              displayed += char;
              fullResponse = displayed;
              updateAssistant(displayed);
              // Vary speed: pause longer on punctuation, shorter on regular chars
              if (".!?".includes(char)) {
                await randomDelay(120, 350); // pause on sentence end
              } else if (char === ",") {
                await randomDelay(60, 150);
              } else if (char === "\n") {
                await randomDelay(100, 250);
              } else {
                await randomDelay(15, 45); // ~25-40 WPM typing speed
              }
            }
          } else {
            await randomDelay(30, 60); // wait for more tokens
          }
        }
      };

      // Run producer and consumer concurrently
      await Promise.all([readStream(), drip()]);

      if (fullResponse) saveLog(text, fullResponse);
    } catch {
      const fallback = "I'm sorry, I'm having trouble connecting right now. Please try again or email support@mrc-pay.com.";
      setMessages((prev) => [...prev, { role: "assistant", content: fallback }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const p = persona.current;

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-20 right-4 z-50 md:bottom-6 md:right-6 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-[0_4px_24px_-4px_hsl(var(--primary)/0.5)] flex items-center justify-center hover:scale-105 transition-transform"
          aria-label="Open support chat"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-20 right-2 z-50 md:bottom-6 md:right-6 w-[calc(100vw-16px)] max-w-[400px] h-[520px] rounded-2xl border border-border/60 bg-background shadow-[0_8px_40px_-12px_rgba(0,0,0,0.4)] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-card/80 backdrop-blur-sm border-b border-border/40">
            <div className="relative">
              <img
                src={p.img}
                alt={p.name}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/30"
                width={40}
                height={40}
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-background" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{p.name}</p>
              <p className="text-xs text-muted-foreground">{p.role} · Online</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                {m.role === "assistant" && (
                  <img src={p.img} alt="" className="w-7 h-7 rounded-full object-cover mt-1 flex-shrink-0" width={28} height={28} />
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-muted/60 text-foreground rounded-bl-md"
                  }`}
                >
                  {m.role === "assistant" ? (
                    <div className="prose prose-sm prose-invert max-w-none [&>p]:mb-1 [&>p:last-child]:mb-0">
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    </div>
                  ) : (
                    m.content
                  )}
                </div>
              </div>
            ))}
            {loading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex gap-2">
                <img src={p.img} alt="" className="w-7 h-7 rounded-full object-cover mt-1" width={28} height={28} />
                <div className="bg-muted/60 rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0ms]" />
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:150ms]" />
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-border/40 bg-card/60 backdrop-blur-sm px-3 py-2.5">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message…"
                rows={1}
                className="flex-1 resize-none bg-muted/40 border border-border/40 rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 max-h-24"
              />
              <Button
                size="icon"
                className="h-10 w-10 rounded-xl flex-shrink-0"
                onClick={send}
                disabled={!input.trim() || loading}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground/50 mt-1.5 text-center">
              Powered by MRC GlobalPay AI · Available 24/7
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default SupportChatWidget;
