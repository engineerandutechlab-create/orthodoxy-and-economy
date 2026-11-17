import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { aiService } from '../../services/aiService';
import { 
  Sparkles, 
  X, 
  Send, 
  Bot, 
  Phone, 
  SendHorizontal,
  Briefcase, 
  ShoppingBag, 
  PlusCircle, 
  RotateCcw,
  BookOpen
} from 'lucide-react';

interface ChatMessage {
  sender: 'ai' | 'user';
  text: string;
}

/**
 * Clean lightweight formatter so AI replies render **bold**, links, and bullet points cleanly
 * instead of raw Markdown punctuation (###, **, ---).
 */
const renderFormattedMessage = (raw: string, isUser: boolean) => {
  const lines = raw.split('\n').filter((line) => line.trim() !== '---');
  return lines.map((line, lineIdx) => {
    const cleaned = line.replace(/^#{1,4}\s+/, '');
    const tokens = cleaned.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\(https?:\/\/[^)]+\))/g);
    return (
      <div key={lineIdx} className={lineIdx > 0 ? 'mt-1' : ''}>
        {tokens.map((tok, i) => {
          if (tok.startsWith('**') && tok.endsWith('**')) {
            return (
              <strong key={i} className={isUser ? 'font-bold text-amber-200' : 'font-bold text-slate-900'}>
                {tok.slice(2, -2)}
              </strong>
            );
          }
          const linkMatch = tok.match(/^\[([^\]]+)\]\((https?:\/\/[^)]+)\)$/);
          if (linkMatch) {
            return (
              <a
                key={i}
                href={linkMatch[2]}
                target="_blank"
                rel="noopener noreferrer"
                className={isUser ? 'underline text-amber-200' : 'underline font-semibold text-[#123B6D]'}
              >
                {linkMatch[1]}
              </a>
            );
          }
          return <React.Fragment key={i}>{tok}</React.Fragment>;
        })}
      </div>
    );
  });
};

export const AIAssistantWidget: React.FC = () => {
  const { language, jobs, products, services, businesses, setActiveTab, openModal } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [inputMsg, setInputMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const getGreeting = () => {
    switch (language) {
      case 'om':
        return 'Nagaan Waaqayyoo isiniif haa ta\'u! Ani gargaaraa AI platformii "Orthodoxy & Economy" ti. Hojiiwwan banaa, gabaa oomishaalee fi tajaajila addaa akkamitti isin gargaaru?';
      case 'ti':
        return 'ሰላም እግዚአብሔር ምሳኻትኩም ይኹን! ኣነ ናይዚ መድረኽ AI ሓጋዚ እየ። "ንቑሕ፡ ብቑዕን ጻዕረኛን ኦርቶዶክሳዊ ንዘመናዊ ኣገልግሎት!" ክፉታት ናይ ስራሕ ቦታታት ወይ ናይ ዕዳጋ ኣቕሑት ክትደልዩ ብኸመይ ክሕግዘኩም?';
      case 'en':
        return 'Peace and blessings be with you! I am the official AI Assistant for "Orthodoxy & Economy". How may I assist you with job vacancies, wholesale church items, verification, or service listings today?';
      case 'am':
      default:
        return 'ሰላም እግዚአብሔር ከእርስዎ ጋር ይሁን! እኔ የ"ኦርቶዶክስ እና ኢኮኖሚ" መድረክ ይፋዊ AI ረዳት ነኝ። "ንቁ፣ ብቁና ታታሪ ኦርቶዶክስ ዘመኑን ለዋጀ አገልግሎት!" ክፍት የሥራ ቦታዎችን፣ የጅምላ ጧፍና ዕጣን፣ ወይም የታመኑ ድርጅቶችን እንድፈልግልዎ ምን ያግዙዎታል?';
    }
  };

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'ai',
      text: getGreeting()
    }
  ]);

  // Update greeting when language changes if only default message exists
  useEffect(() => {
    if (messages.length === 1 && messages[0].sender === 'ai') {
      setMessages([{ sender: 'ai', text: getGreeting() }]);
    }
  }, [language]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

  const quickPrompts = {
    am: [
      'በአዲስ አበባ ክፍት የሥራ ቦታዎች?',
      'የጅምላ ንጹሕ የሰም ጧፍ የት ይገኛል?',
      'የአሠሪ ወይም የሻጭ ማረጋገጫ እንዴት ይሰጣል?',
      'ቀጥታ ስልክና አድራሻ ማን ነው?'
    ],
    om: [
      'Hojiiwwan banaa Finfinnee keessaa?',
      'Gabaa xoofii dammaa fi ixaanaa?',
      'Waraqaa mirkaneessaa argachuu?',
      'Lakk bilbilaa fi teessoo?'
    ],
    ti: [
      'ክፉታት ናይ ስራሕ ቦታታት ኣበይ ኣለዉ?',
      'ናይ ጅምላ ጧፍን ዕጣንን ከመይ ይርከብ?',
      'ናይ ምርግጋጽ ሰማያዊ ባጅ?',
      'ቀጥታዊ ስልኪ ቁጽሪ?'
    ],
    en: [
      'Open software developer jobs?',
      'Wholesale church candles & incense?',
      'How does verification badge work?',
      'Official contact phone number?'
    ]
  }[language] || [
    'በአዲስ አበባ ክፍት የሥራ ቦታዎች?',
    'የጅምላ ንጹሕ የሰም ጧፍ የት ይገኛል?',
    'የአሠሪ ወይም የሻጭ ማረጋገጫ እንዴት ይሰጣል?',
    'ቀጥታ ስልክና አድራሻ ማን ነው?'
  ];

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputMsg).trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = { sender: 'user', text };
    const updatedMessages = [...messages, userMessage];
    // Add placeholder AI bubble that updates live as chunks stream in
    setMessages([...updatedMessages, { sender: 'ai', text: '' }]);
    if (!textToSend) setInputMsg('');
    setIsLoading(true);

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const qTokens = text
        .toLowerCase()
        .replace(/[?!.,።፣]/g, ' ')
        .split(/\s+/)
        .filter((t) => t.length >= 2);
      const matchesTokens = (haystack: string) =>
        qTokens.length > 0 && qTokens.some((tok) => haystack.toLowerCase().includes(tok));

      const matchedJobs = jobs
        .filter((j) => matchesTokens(`${j.title} ${j.amharicTitle || ''} ${j.category} ${j.location} ${j.description}`))
        .slice(0, 5)
        .map((j) => `${j.amharicTitle || j.title} (${j.location}${j.budgetAmount ? `, ${j.budgetAmount} ETB` : ''})`);
      const matchedProducts = products
        .filter((p) => matchesTokens(`${p.title} ${p.amharicTitle || ''} ${p.category} ${p.location} ${p.description}`))
        .slice(0, 5)
        .map((p) => `${p.amharicTitle || p.title} - ${p.price} ${p.currency || 'ETB'} (${p.location})`);
      const matchedServices = services
        .filter((s) => matchesTokens(`${s.title} ${s.amharicTitle || ''} ${s.category} ${s.location} ${s.providerName || ''}`))
        .slice(0, 4)
        .map((s) => `${s.amharicTitle || s.title} by ${s.providerName || s.name || ''} (${s.location})`);
      const matchedBusinesses = businesses
        .filter((b) => matchesTokens(`${b.name || ''} ${b.nameAm || ''} ${b.category || ''} ${b.location || ''} ${b.city || ''}`))
        .slice(0, 4)
        .map((b) => `${b.nameAm || b.name} (${b.location || b.city})`);

      const summaryContext = {
        totalJobs: jobs.length,
        totalProducts: products.length,
        totalServices: services.length,
        totalBusinesses: businesses.length,
        matchedJobs,
        matchedProducts,
        matchedServices,
        matchedBusinesses,
        sampleJobTitles: jobs.slice(0, 4).map((j) => `${j.amharicTitle || j.title} (${j.location})`),
        sampleProducts: products.slice(0, 4).map((p) => `${p.amharicTitle || p.title} - ${p.price} ${p.currency || 'ETB'}`),
      };

      const recentHistory = updatedMessages.slice(-6);

      await aiService.chatAssistantStream(
        text,
        summaryContext,
        language,
        recentHistory,
        (streamedText) => {
          setMessages((prev) => {
            const next = [...prev];
            if (next.length > 0 && next[next.length - 1].sender === 'ai') {
              next[next.length - 1] = { sender: 'ai', text: streamedText };
            }
            return next;
          });
        },
        controller.signal
      );
    } catch (e) {
      if ((e as any)?.name === 'AbortError') return;
      const errText =
        language === 'am'
          ? 'ይቅርታ፣ በጊዜያዊነት ምላሽ ማግኘት አልተቻለም። እባክዎ በቀጥታ በስልክ +251 922 901 083 / +251 981 848 698 ወይም በቴሌግራም @orthodoxy_economy ያግኙን።'
          : 'AI service temporarily unavailable. Please contact administration directly at +251 922 901 083 / +251 981 848 698 or Telegram @orthodoxy_economy.';
      setMessages((prev) => {
        const next = [...prev];
        if (next.length > 0 && next[next.length - 1].sender === 'ai' && !next[next.length - 1].text) {
          next[next.length - 1] = { sender: 'ai', text: errText };
        } else {
          next.push({ sender: 'ai', text: errText });
        }
        return next;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    abortControllerRef.current?.abort();
    setIsLoading(false);
    setMessages([{ sender: 'ai', text: getGreeting() }]);
  };

  return (
    <div className="fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-50">
      
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-[#123B6D] via-[#3B1C54] to-[#581C87] text-white px-4 py-3 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2.5 border border-[#D4A72C]/40 cursor-pointer group"
          title="Open AI Assistant"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-[#D4A72C]" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-[#3B1C54]" />
          </div>
          <span className="font-ethiopic text-xs sm:text-sm font-bold tracking-tight">
            ✨ {language === 'am' ? 'የመድረኩ AI ረዳት' : language === 'om' ? 'Gargaaraa AI' : language === 'ti' ? 'AI ሓጋዚ' : 'AI Assistant'}
          </span>
        </button>
      )}

      {/* Floating Chat Window */}
      {isOpen && (
        <div className="bg-white rounded-3xl shadow-2xl border border-purple-200/80 w-[92vw] sm:w-[400px] h-[540px] max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
          
          {/* Header */}
          <div className="p-3.5 bg-gradient-to-r from-[#091B33] via-[#240F3D] to-[#3B1C54] text-white flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#123B6D] to-[#581C87] flex items-center justify-center text-[#D4A72C] border border-[#D4A72C]/30 shadow-xs">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold font-ethiopic flex items-center gap-1.5">
                  <span>{language === 'am' ? 'የመድረኩ AI ረዳት' : language === 'om' ? 'Gargaaraa AI' : language === 'ti' ? 'AI ሓጋዚ' : 'Platform AI Assistant'}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#D4A72C]/20 text-[#D4A72C] font-mono font-medium">ፈጣን AI</span>
                </h4>
                <div className="text-[10px] text-purple-200 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>{language === 'am' ? 'ንቁና ፈጣን · በቀጥታ ያነጋግሩ' : 'Active & Fast · Live Streaming'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleResetChat}
                className="p-1.5 text-purple-200 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer transition-colors"
                title={language === 'am' ? 'ውይይት አድስ' : 'Reset chat'}
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-purple-200 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer transition-colors"
                title={language === 'am' ? 'ዝጋ' : 'Close'}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Platform Shortcuts Strip */}
          <div className="px-3 py-1.5 bg-gradient-to-r from-slate-50 to-purple-50/40 border-b border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
            <span className="font-medium text-slate-500 font-ethiopic">
              {language === 'am' ? 'ፈጣን መዳረሻ፦' : 'Quick Actions:'}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => { setActiveTab('jobs'); setIsOpen(false); }}
                className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 hover:text-[#123B6D] hover:border-[#123B6D] font-medium flex items-center gap-1 cursor-pointer transition-all text-[10px]"
              >
                <Briefcase className="w-3 h-3 text-[#123B6D]" />
                <span>{language === 'am' ? 'ሥራዎች' : 'Jobs'}</span>
              </button>
              <button
                onClick={() => { setActiveTab('marketplace'); setIsOpen(false); }}
                className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 hover:text-[#123B6D] hover:border-[#123B6D] font-medium flex items-center gap-1 cursor-pointer transition-all text-[10px]"
              >
                <ShoppingBag className="w-3 h-3 text-[#D4A72C]" />
                <span>{language === 'am' ? 'ገበያ' : 'Market'}</span>
              </button>
              <button
                onClick={() => { setActiveTab('knowledge'); setIsOpen(false); }}
                className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 hover:text-[#3B1C54] hover:border-[#3B1C54] font-medium flex items-center gap-1 cursor-pointer transition-all text-[10px]"
              >
                <BookOpen className="w-3 h-3 text-[#3B1C54]" />
                <span>{language === 'am' ? 'ቀኖናዊ RAG' : 'RAG'}</span>
              </button>
              <button
                onClick={() => { openModal('post'); setIsOpen(false); }}
                className="px-2 py-0.5 rounded-md bg-[#16845B]/10 border border-[#16845B]/30 text-[#16845B] hover:bg-[#16845B] hover:text-white font-medium flex items-center gap-1 cursor-pointer transition-all text-[10px]"
              >
                <PlusCircle className="w-3 h-3" />
                <span>{language === 'am' ? 'ለጥፍ' : 'Post'}</span>
              </button>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-[#F8FAFC]">
            {messages.map((msg, i) => {
              if (!msg.text && msg.sender === 'ai') return null;
              return (
                <div
                  key={i}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs font-ethiopic leading-relaxed shadow-2xs ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-[#123B6D] to-[#3B1C54] text-white rounded-tr-xs'
                        : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-xs'
                    }`}
                  >
                    {renderFormattedMessage(msg.text, msg.sender === 'user')}
                  </div>
                </div>
              );
            })}

            {isLoading && (!messages[messages.length - 1]?.text) && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 rounded-2xl px-3.5 py-2 text-xs text-slate-600 flex items-center gap-2 shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600 animate-spin" />
                  <span className="font-ethiopic">{language === 'am' ? 'AI ረዳቱ መልስ እያዘጋጀ ነው...' : 'AI Assistant is thinking...'}</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Strip */}
          <div className="px-3 py-1.5 bg-slate-50 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[10px]">
            {quickPrompts.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                disabled={isLoading}
                className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-purple-50 hover:text-purple-800 hover:border-purple-200 font-medium transition-colors cursor-pointer shrink-0 disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Direct Contact Bar */}
          <div className="px-3 py-1.5 bg-slate-100/70 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-600 font-ethiopic">
            <span className="text-[10px] text-slate-500">
              {language === 'am' ? 'ቀጥታ አድራሻ፦' : 'Official direct contact:'}
            </span>
            <div className="flex items-center gap-1.5 flex-wrap justify-end">
              <a
                href="tel:+251922901083"
                className="flex items-center gap-1 text-[#123B6D] hover:underline font-bold text-[10px]"
              >
                <Phone className="w-3 h-3 text-[#16845B]" />
                <span>0922 901 083</span>
              </a>
              <span className="text-slate-300">/</span>
              <a
                href="tel:+251981848698"
                className="text-[#123B6D] hover:underline font-bold text-[10px]"
              >
                0981 848 698
              </a>
              <span className="text-slate-300">|</span>
              <a
                href="https://t.me/orthodoxy_economy"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-[#123B6D] hover:underline font-bold text-[10px]"
              >
                <SendHorizontal className="w-3 h-3 text-[#0284C7]" />
                <span>@orthodoxy_economy</span>
              </a>
            </div>
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-2.5 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder={language === 'am' ? 'ጥያቄዎን እዚህ ይጻፉ (ሥራ፣ ገበያ፣ ቀኖና...)...' : 'Type your question here...'}
              className="flex-1 px-3 py-2 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1.5 focus:ring-[#3B1C54] transition-all"
            />
            <button
              type="submit"
              disabled={!inputMsg.trim() || isLoading}
              className="bg-gradient-to-r from-[#123B6D] to-[#3B1C54] hover:from-[#091B33] hover:to-[#240F3D] text-white p-2.5 rounded-xl transition-all cursor-pointer disabled:opacity-40 shadow-xs"
              title={language === 'am' ? 'ላክ' : 'Send'}
            >
              <Send className="w-3.5 h-3.5 text-[#D4A72C]" />
            </button>
          </form>

        </div>
      )}

    </div>
  );
};
