import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Language } from '../../types';
import { aiService, AISocialContent, AIVideoStoryboard, AIVideoScene } from '../../services/aiService';
import { VideoPlayerCanvas } from './VideoPlayerCanvas';
import {
  DEFAULT_CATHEDRAL_BANNER_URL,
  DEFAULT_ARTISAN_WORKSPACE_URL,
  DEFAULT_HERITAGE_DEACONS_URL,
  DEFAULT_ENTERPRISE_LOGO_URL,
} from '../../constants/assets';
import { 
  Sparkles, 
  Send, 
  Copy, 
  Check, 
  Share2, 
  Video, 
  Image as ImageIcon, 
  FileText, 
  Layers, 
  CheckCircle2, 
  ExternalLink,
  Phone,
  RefreshCw,
  Clock,
  Download,
  Bookmark,
  Trash2,
  FolderHeart,
  Sliders,
  Film,
  Play,
  Globe,
  PlusCircle,
  HelpCircle
} from 'lucide-react';

interface SavedContentItem {
  id: string;
  title: string;
  platform: string;
  format: string;
  content: string;
  timestamp: string;
}

const INITIAL_DEMO_STORYBOARD: AIVideoStoryboard = {
  videoConcept: 'የኦርቶዶክስ እና ኢኮኖሚ ማኅበረሰብ መድረክ ባለ 1 ደቂቃ ማስተዋወቂያ',
  videoConceptEn: 'Orthodoxy & Economy Community 1-Minute Commercial',
  duration: 60,
  hook: 'ይህን ያውቃሉ? ጥራት ያለው የኦርቶዶክሳውያን ምርት እና ቀጥተኛ ገበያ በአንድ ቦታ!',
  hookEn: 'Did you know? Authentic Orthodox craftsmanship and direct marketplace in one place!',
  caption: '🕯️✨ ንጹሕ የሰም ጧፍ፣ ቅዱሳት ሥዕላት፣ መስቀሎችና የእጅ ጥበባት ያለምንም ደላላ ቀጥታ ከአምራቹ ያግኙ! #ኦርቶዶክስ #ኢትዮጵያ #OrthodoxEconomy #Ethiopia #AddisAbaba',
  captionEn: 'Pure beeswax candles, sacred crosses, and monastery honey directly from trusted artisans. #OrthodoxEconomy #Ethiopia',
  audioRecommendation: 'Acoustic Begena & Kirar pentatonic harmony with solemn, uplifting church chimes',
  audioTrack: 'begena_masenko',
  scenes: [
    {
      time: '00:00 - 00:15',
      startTime: 0,
      endTime: 15,
      visual: 'Close-up of golden warm beeswax candles and traditional Ethiopian Orthodox cross',
      imageUrl: DEFAULT_CATHEDRAL_BANNER_URL,
      themeStyle: 'orthodox_heritage',
      onScreenTextAm: 'ይህን ያውቃሉ? ጥራትና በረከት በአንድ ላይ!',
      onScreenTextEn: 'Did you know? Quality and blessing in one place!',
      voiceoverAm: 'ይህን ያውቃሉ? ንጹሕ የሰም ጧፍ እና የቤተክርስቲያን ዕቃዎችን በጥራት እና በታማኝነት በአንድ ቦታ ማግኘት ይችላሉ።',
      voiceoverEn: 'Did you know? You can now find pure beeswax candles and sacred church artifacts with guaranteed authenticity and trust.'
    },
    {
      time: '00:15 - 00:30',
      startTime: 15,
      endTime: 30,
      visual: 'Master craftsperson sculpting intricate wooden cross in traditional workshop',
      imageUrl: DEFAULT_ARTISAN_WORKSPACE_URL,
      themeStyle: 'sacred_artisan',
      onScreenTextAm: 'የተፈተነ ጥራት፡ የኦርቶዶክሳውያን የእጅ ጥበብ',
      onScreenTextEn: 'Handcrafted Heritage & Sacred Artistry',
      voiceoverAm: 'በታታሪ ኦርቶዶክሳውያን ባለሙያዎች የተሠሩ የእጅ ጥበባት፣ የገዳማት ማር እና የልብስ ስፌት ሥራዎች በቅንነት ተዘጋጅተዋል።',
      voiceoverEn: 'Handcrafted artifacts, monastery honey, and traditional vestments prepared with genuine dedication and care.'
    },
    {
      time: '00:30 - 00:45',
      startTime: 30,
      endTime: 45,
      visual: 'Happy customer and artisan shaking hands in community marketplace',
      imageUrl: DEFAULT_HERITAGE_DEACONS_URL,
      themeStyle: 'community_trust',
      onScreenTextAm: 'ያለ ደላላ ቀጥታ ግንኙነት እና ፍትሐዊ ዋጋ',
      onScreenTextEn: 'Direct Connection: Zero Brokerage Fees',
      voiceoverAm: 'ያለ ምንም ደላላ ጣልቃ ገብነት፣ ቀጥታ ከታማኝ አምራቾች ጋር ይገበያዩ። ጊዜዎንና ገንዘብዎን ይቆጥቡ።',
      voiceoverEn: 'Trade directly with authentic creators without any middleman fees, saving your precious time and resources.'
    },
    {
      time: '00:45 - 01:00',
      startTime: 45,
      endTime: 60,
      visual: 'Community platform mobile display with call to action phone and website',
      imageUrl: DEFAULT_ENTERPRISE_LOGO_URL,
      themeStyle: 'modern_business',
      onScreenTextAm: 'አሁኑኑ ይዘዙ! ኦርቶዶክስ እና ኢኮኖሚ ማኅበረሰብ',
      onScreenTextEn: 'Order Today! Orthodoxy & Economy Platform',
      voiceoverAm: 'አሁኑኑ ይቀላቀሉን። በስልክ ቁጥር 0922 901 083 ይደውሉልን ወይም ድረ-ገጻችንን ይጎብኙ። ለበረከት ይሁኑ!',
      voiceoverEn: 'Join our community today. Call 0922 901 083 or visit our platform. May your endeavors be blessed!'
    }
  ]
};

export const AIContentStudioView: React.FC = () => {
  const { jobs, products, services, businesses, currentUser, language, t } = useApp();

  const allListings = [
    ...jobs.map(j => ({ ...j, listingType: 'job' as const, displayTitle: j.title, sub: `Budget: ${j.budget} ETB` })),
    ...products.map(p => ({ ...p, listingType: 'product' as const, displayTitle: p.title, sub: `Price: ${p.price} ETB` })),
    ...services.map(s => ({ ...s, listingType: 'service' as const, displayTitle: s.title, sub: s.rateDescription })),
    ...businesses.map(b => ({ ...b, listingType: 'business' as const, displayTitle: b.name, sub: b.category })),
  ];

  const [activeStudioTab, setActiveStudioTab] = useState<'creator' | 'library'>('creator');
  const [inputMode, setInputMode] = useState<'listing' | 'custom'>('listing');
  const [customPrompt, setCustomPrompt] = useState<string>('ስለ ንጹሕ የሰም ጧፍ እና የቤተክርስቲያን ዕቃዎች ማስተዋወቂያ ባለ 1 ደቂቃ ቪዲዮ');
  const [selectedListingId, setSelectedListingId] = useState<string>(allListings[0]?.id || '');
  const [platform, setPlatform] = useState<'tiktok' | 'telegram' | 'instagram' | 'facebook' | 'linkedin' | 'whatsapp'>('tiktok');
  const [format, setFormat] = useState<'video' | 'text' | 'visual_card'>('video');
  const [tone, setTone] = useState<'professional' | 'promotional' | 'friendly' | 'urgent'>('promotional');
  const [targetLang, setTargetLang] = useState<'am' | 'en'>(language === 'am' ? 'am' : 'en');
  const [videoDuration, setVideoDuration] = useState<number>(60); // exactly 1 minute
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '16:9' | '1:1'>('9:16');

  const [isLoading, setIsLoading] = useState(false);
  const [generatedCopy, setGeneratedCopy] = useState<AISocialContent | null>(null);
  const [videoStoryboard, setVideoStoryboard] = useState<AIVideoStoryboard | null>(INITIAL_DEMO_STORYBOARD);
  const [copied, setCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Content Library from LocalStorage
  const [savedLibrary, setSavedLibrary] = useState<SavedContentItem[]>(() => {
    try {
      const stored = localStorage.getItem('oe_saved_ai_content');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('oe_saved_ai_content', JSON.stringify(savedLibrary));
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
  }, [savedLibrary]);

  const selectedItem = allListings.find(l => l.id === selectedListingId) || allListings[0];

  // Quick prompt suggestions
  const PROMPT_SUGGESTIONS = [
    { am: '🕯️ የንጹሕ ሰም ጧፍና የቤተክርስቲያን ዕቃዎች ማስተዋወቂያ', en: 'Pure Beeswax Candles & Church Artifacts Promotion' },
    { am: '💻 ለሲኒየር ሶፍትዌር ኢንጂነር ክፍት የሥራ ቦታ ጥሪ', en: 'Senior Software Engineer Recruitment Commercial' },
    { am: '🍯 የኢትዮጵያ ንጹሕ የተፈጥሮ ማርና ቡና የጅምላ ሽያጭ', en: 'Ethiopian Organic Honey & Highland Coffee Wholesale' },
    { am: '⛪ የቤተክርስቲያን የእንጨት ቅርጻ ቅርጽና ጥበባት', en: 'Ecclesiastical Woodcarving & Sacred Artistry' },
    { am: '🤝 ከደላላ ነፃ የሆነ ቀጥተኛ የኦርቶዶክሳውያን የሥራ ገበያ', en: 'Direct Community Marketplace with Zero Brokerage' }
  ];

  const handleGenerate = async () => {
    setIsLoading(true);
    setCopied(false);
    setIsSaved(false);

    try {
      if (format === 'video') {
        const itemOrPrompt = inputMode === 'custom' ? customPrompt : selectedItem;
        const result = await aiService.generateVideoStoryboard(
          itemOrPrompt, 
          videoDuration, 
          targetLang,
          inputMode === 'custom' ? customPrompt : undefined
        );
        setVideoStoryboard(result);
        setGeneratedCopy(null);
      } else {
        const itemToUse = inputMode === 'custom' 
          ? { title: customPrompt, amharicTitle: customPrompt, description: customPrompt, category: 'General' }
          : selectedItem;
        const result = await aiService.generateSocialContent(itemToUse, platform, tone, targetLang);
        setGeneratedCopy(result);
        setVideoStoryboard(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateScene = (index: number, updated: Partial<AIVideoScene>) => {
    if (!videoStoryboard) return;
    const newScenes = [...videoStoryboard.scenes];
    newScenes[index] = { ...newScenes[index], ...updated };
    setVideoStoryboard({
      ...videoStoryboard,
      scenes: newScenes
    });
  };

  const copyToClipboard = (text: string) => {
    try {
      navigator.clipboard?.writeText(text);
    } catch {
      // Clipboard fallback ignored in restricted contexts
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveToLibrary = () => {
    const title = inputMode === 'custom' ? customPrompt.slice(0, 40) : (selectedItem?.displayTitle || 'Untitled');
    const contentText = format === 'video'
      ? `${videoStoryboard?.hook}\n\n${videoStoryboard?.scenes.map(s => `${s.time}: ${s.onScreenTextAm || s.onScreenText} - ${s.voiceoverAm || s.voiceover}`).join('\n')}\n\n${videoStoryboard?.caption}`
      : (generatedCopy?.telegramFormatted || generatedCopy?.postCopy || '');

    if (!contentText) return;

    const newItem: SavedContentItem = {
      id: `ai_${Date.now()}`,
      title,
      platform,
      format,
      content: contentText,
      timestamp: new Date().toLocaleDateString(language === 'am' ? 'am-ET' : 'en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    setSavedLibrary(prev => [newItem, ...prev]);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleDownload = () => {
    const contentText = format === 'video'
      ? `=== ORTHODOXY & ECONOMY 60s COMMERCIAL SCRIPT ===\nConcept: ${videoStoryboard?.videoConcept}\n\n[HOOK 0-12s]\nAmharic: ${videoStoryboard?.hook}\nEnglish: ${videoStoryboard?.hookEn}\n\n[TIMELINE SCENES]\n${videoStoryboard?.scenes.map(s => `--- ${s.time} ---\nTitle (Amharic): ${s.onScreenTextAm}\nTitle (English): ${s.onScreenTextEn}\nVoiceover (Amharic): ${s.voiceoverAm}\nVoiceover (English): ${s.voiceoverEn}\nVisual: ${s.visual}\n`).join('\n')}\n\n[SOCIAL CAPTION]\n${videoStoryboard?.caption}\n\nOfficial Contacts: +251 922 901 083 | @orthodoxy_economy`
      : (generatedCopy?.telegramFormatted || generatedCopy?.postCopy || '');

    if (!contentText) return;

    const blob = new Blob([contentText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Orthodoxy_Economy_1min_Video_Script_${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const deleteSavedItem = (id: string) => {
    setSavedLibrary(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-ethiopic">
      
      {/* Studio Header with Royal Blue & Purple Gradient */}
      <div className="bg-gradient-to-r from-[#091B33] via-[#240F3D] to-[#3B1C54] text-white rounded-3xl p-6 sm:p-10 border border-purple-800/40 shadow-lg relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 bg-[#D4A72C]/20 border border-[#D4A72C]/40 px-3 py-1 rounded-full text-xs font-bold text-[#F3D77A]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>የይዘትና ባለ 1 ደቂቃ ቪዲዮ ፈጠራ ስቱዲዮ (1-Minute Professional Video Studio)</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white">
              {language === 'am' ? 'የማኅበረሰብ የይዘት ፈጠራ ስቱዲዮ' : 'AI Video & Promotion Studio'}
            </h1>
            <p className="text-xs sm:text-sm text-purple-200 leading-relaxed font-ethiopic">
              {language === 'am'
                ? 'በጠየቁት ጥያቄ ወይም በለጠፉት ምርት/ሥራ መሠረት ባለ 1 ደቂቃ (60 ሰከንድ) የተሟላ ፕሮፌሽናል ቪዲዮ ከትረካ ድምጽ፣ ጽሑፍ እና ሙዚቃ ጋር እዚሁ ያዘጋጁ፣ ያጫውቱ እና ያውርዱ!'
                : 'Generate a complete 1-minute (60s) professional promotional video with Amharic and English voiceover narration, animated captions, and timeline editor.'
              }
            </p>
          </div>

          {/* Tab Switcher: Creator vs Saved Library */}
          <div className="flex bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/20 self-stretch sm:self-auto">
            <button
              onClick={() => setActiveStudioTab('creator')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                activeStudioTab === 'creator'
                  ? 'bg-[#D4A72C] text-[#08294F] shadow-sm'
                  : 'text-purple-200 hover:text-white'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>{language === 'am' ? 'የቪዲዮ ፈጠራ ስቱዲዮ' : 'Video Creator'}</span>
            </button>
            <button
              onClick={() => setActiveStudioTab('library')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                activeStudioTab === 'library'
                  ? 'bg-[#D4A72C] text-[#08294F] shadow-sm'
                  : 'text-purple-200 hover:text-white'
              }`}
            >
              <FolderHeart className="w-3.5 h-3.5 text-pink-300" />
              <span>{language === 'am' ? 'የተቀመጡ ይዘቶች' : 'My Library'} ({savedLibrary.length})</span>
            </button>
          </div>
        </div>
      </div>

      {activeStudioTab === 'creator' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: CONTROLS & SELECTION */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-[#E2E8F0] shadow-xs space-y-6">
          
          {/* Mode Switcher: From Existing Listing vs Custom Prompt */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              1. {language === 'am' ? 'የይዘቱ ምንጭ (Content Source)' : 'Source of Video / Topic'}
            </label>
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setInputMode('custom')}
                className={`py-2 px-3 rounded-xl font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  inputMode === 'custom'
                    ? 'bg-[#123B6D] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#D4A72C]" />
                <span>{language === 'am' ? 'በራስዎ ጥያቄ / ርእስ' : 'Custom Request'}</span>
              </button>
              <button
                type="button"
                onClick={() => setInputMode('listing')}
                className={`py-2 px-3 rounded-xl font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  inputMode === 'listing'
                    ? 'bg-[#123B6D] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-[#D4A72C]" />
                <span>{language === 'am' ? 'ከነባር ምርት / ስራ' : 'From Listing'}</span>
              </button>
            </div>
          </div>

          {/* Custom Prompt Input Area */}
          {inputMode === 'custom' ? (
            <div className="space-y-2 animate-in fade-in">
              <label className="block text-xs font-bold text-slate-700">
                {language === 'am' ? 'የሚፈልጉትን የቪዲዮ ሐሳብ ወይም ጥያቄ ያስገቡ፦' : 'Describe your video concept or prompt:'}
              </label>
              <textarea
                rows={3}
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="ለምሳሌ፦ ስለ ንጹሕ የሰም ጧፍ እና የቤተክርስቲያን ዕቃዎች ማስተዋወቂያ ባለ 1 ደቂቃ ቪዲዮ..."
                className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 font-medium focus:ring-2 focus:ring-[#123B6D]/20 focus:outline-none"
              />

              {/* Quick suggestions */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {language === 'am' ? 'ፈጣን የአርእስት ምሳሌዎች፦' : 'Quick Prompt Ideas:'}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {PROMPT_SUGGESTIONS.map((sug, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCustomPrompt(language === 'am' ? sug.am : sug.en)}
                      className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg transition-colors cursor-pointer text-left"
                    >
                      {language === 'am' ? sug.am : sug.en}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Select Listing Dropdown */
            <div className="space-y-2 animate-in fade-in">
              <label className="block text-xs font-bold text-slate-700">
                {language === 'am' ? 'ማስተዋወቅ የሚፈልጉትን ዝርዝር ይምረጡ' : 'Select Item from Platform'}
              </label>
              <select
                value={selectedListingId}
                onChange={(e) => setSelectedListingId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 font-medium focus:ring-2 focus:ring-[#123B6D]/20 cursor-pointer"
              >
                {allListings.map(item => (
                  <option key={item.id} value={item.id}>
                    [{item.listingType.toUpperCase()}] {item.displayTitle}
                  </option>
                ))}
              </select>
              {selectedItem && (
                <p className="text-[11px] text-slate-500 pl-1 font-ethiopic truncate">
                  Selected: {selectedItem.displayTitle} ({selectedItem.sub})
                </p>
              )}
            </div>
          )}

          {/* 2. Output Format (Default is Video Story!) */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              2. {language === 'am' ? 'የይዘት ዓይነት (Format)' : 'Content Format'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setFormat('video')}
                className={`py-2.5 px-2 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                  format === 'video' 
                    ? 'bg-gradient-to-tr from-[#123B6D] to-[#4A154B] text-white shadow-md ring-2 ring-[#D4A72C]' 
                    : 'bg-[#F8FAFC] border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Video className="w-4 h-4 text-[#D4A72C]" />
                <span>1-Min Video</span>
              </button>

              <button
                type="button"
                onClick={() => setFormat('text')}
                className={`py-2.5 px-2 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                  format === 'text' 
                    ? 'bg-[#123B6D] text-white shadow-sm' 
                    : 'bg-[#F8FAFC] border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Text Post</span>
              </button>

              <button
                type="button"
                onClick={() => setFormat('visual_card')}
                className={`py-2.5 px-2 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                  format === 'visual_card' 
                    ? 'bg-[#D4A72C] text-[#08294F] shadow-sm' 
                    : 'bg-[#F8FAFC] border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                <span>Promo Card</span>
              </button>
            </div>
          </div>

          {/* 3. Duration & Target Platform */}
          {format === 'video' ? (
            <div className="space-y-3 bg-purple-50/70 p-4 rounded-2xl border border-purple-200/80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#D4A72C]" />
                  <span>የቪዲዮው ርዝመት (Duration):</span>
                </span>
                <span className="text-xs font-extrabold text-[#123B6D] font-mono bg-white px-2 py-0.5 rounded-lg border border-purple-200">
                  {videoDuration} ሰከንድ (1 ደቂቃ)
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { sec: 30, label: '30s Short' },
                  { sec: 60, label: '60s (1 ደቂቃ)' },
                  { sec: 90, label: '90s Detailed' },
                ].map(d => (
                  <button
                    key={d.sec}
                    type="button"
                    onClick={() => setVideoDuration(d.sec)}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      videoDuration === d.sec 
                        ? 'bg-[#123B6D] text-white shadow-xs' 
                        : 'bg-white border border-purple-200 text-slate-700 hover:bg-purple-100/50'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-purple-900 leading-tight">
                ✨ በ 4 ምዕራፎች የተዋቀረ (መክፈቻ፣ ዝርዝር ሐሳብ፣ የማኅበረሰብ ማረጋገጫና የመገናኛ ጥሪ)።
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                ማኅበራዊ ሚዲያ (Platform)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['telegram', 'tiktok', 'instagram', 'facebook', 'linkedin', 'whatsapp'].map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPlatform(p as any)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                      platform === p 
                        ? 'bg-[#123B6D] text-white' 
                        : 'bg-[#F8FAFC] border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 4. Language & Tone */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'am' ? 'ዋና ቋንቋ (Language)' : 'Primary Language'}
              </label>
              <select
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              >
                <option value="am">አማርኛ (Amharic)</option>
                <option value="en">English (Bilingual)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'am' ? 'የአነጋገር ስልት (Tone)' : 'Tone of Voice'}
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              >
                <option value="promotional">ተፈላጊና አሳማኝ (Promotional)</option>
                <option value="professional">ክቡርና ፕሮፌሽናል (Professional)</option>
                <option value="friendly">ማኅበረሰባዊ (Friendly)</option>
                <option value="urgent">አፋጣኝ ጥሪ (Urgent)</option>
              </select>
            </div>
          </div>

          {/* Big Action Button */}
          <button
            onClick={handleGenerate}
            disabled={isLoading || (inputMode === 'custom' && !customPrompt.trim())}
            className="w-full bg-gradient-to-r from-[#123B6D] via-[#3B1C54] to-[#581C87] hover:opacity-95 text-white py-3.5 rounded-2xl text-sm font-bold shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-[#D4A72C]" />
                <span>ባለ 1 ደቂቃ ቪዲዮ እያዘጋጀን ነው... (Generating Video...)</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-[#D4A72C]" />
                <span>
                  {format === 'video' 
                    ? (language === 'am' ? 'ባለ 1 ደቂቃ ቪዲዮውን ሥራ (Create 1-Min Video)' : 'Generate 1-Minute Video Now')
                    : (language === 'am' ? 'ይዘት ፍጠር (Generate Content)' : 'Generate Promotional Copy')}
                </span>
              </>
            )}
          </button>

        </div>

        {/* RIGHT COLUMN: INTERACTIVE PREVIEW & STUDIO WORKSPACE */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Top Actions Bar */}
          <div className="bg-white rounded-3xl p-5 border border-[#E2E8F0] shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <h3 className="text-sm font-extrabold text-[#08294F]">
                {format === 'video' 
                  ? (language === 'am' ? 'የ 1 ደቂቃ ቪዲዮ ስቱዲዮ ማሳያ (1-Min Interactive Video Studio)' : '60-Second Video Player & Studio')
                  : (language === 'am' ? 'የይዘት ማሳያ (Content Preview)' : 'Generated Content Preview')}
              </h3>
            </div>

            {(generatedCopy || videoStoryboard) && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const textToCopy = format === 'video' 
                      ? `${videoStoryboard?.hook}\n\n${videoStoryboard?.scenes.map(s => `${s.time}: ${s.onScreenTextAm || s.onScreenText} - ${s.voiceoverAm || s.voiceover}`).join('\n')}\n\n${videoStoryboard?.caption}`
                      : (generatedCopy?.telegramFormatted || generatedCopy?.postCopy || '');
                    copyToClipboard(textToCopy);
                  }}
                  className="bg-purple-50 text-[#3B1C54] hover:bg-purple-100 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-[#16845B]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'ተቀድቷል!' : 'ጽሑፉን ቅዳ'}</span>
                </button>

                <button
                  onClick={handleSaveToLibrary}
                  className="bg-amber-50 text-[#D4A72C] hover:bg-amber-100 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {isSaved ? <Check className="w-3.5 h-3.5 text-[#16845B]" /> : <Bookmark className="w-3.5 h-3.5" />}
                  <span>{isSaved ? 'ተቀምጧል!' : 'አስቀምጥ'}</span>
                </button>

                <button
                  onClick={handleDownload}
                  className="bg-slate-100 text-slate-700 hover:bg-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>ስክሪፕት አውርድ</span>
                </button>
              </div>
            )}
          </div>

          {/* MAIN PREVIEW CONTAINER */}
          {isLoading ? (
            <div className="bg-white rounded-3xl p-12 border border-[#E2E8F0] shadow-xs text-center space-y-4">
              <div className="relative w-16 h-16 mx-auto">
                <Sparkles className="w-16 h-16 text-purple-600 animate-spin" />
              </div>
              <h4 className="text-base font-bold text-slate-900 font-ethiopic">
                የ 1 ደቂቃ ቪዲዮና ድምጽ ትረካ እየተዘጋጀ ነው...
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto font-ethiopic">
                በአማርኛና በእንግሊዝኛ የተሟላ የቪዲዮ ስክሪፕት፣ የትረካ ድምጽ፣ ምስሎችና የማኅበረሰብ ማረጋገጫዎች እየተሰናዱ ነው።
              </p>
            </div>
          ) : format === 'video' && videoStoryboard ? (
            /* REAL 60-SECOND INTERACTIVE VIDEO PLAYER CANVAS & TIMELINE */
            <div className="space-y-6">
              
              <VideoPlayerCanvas
                storyboard={videoStoryboard}
                language={targetLang}
                onLanguageChange={(l) => setTargetLang(l)}
                onUpdateScene={handleUpdateScene}
                aspectRatio={aspectRatio}
              />

              {/* TikTok / Instagram Reels Ready Caption Box */}
              <div className="bg-slate-900 text-white p-5 rounded-3xl space-y-2 border border-slate-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#D4A72C] font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Share2 className="w-3.5 h-3.5" />
                    <span>TikTok & Instagram Reels Caption (ለቲክቶክና ለኢንስታግራም የተዘጋጀ ጽሑፍ):</span>
                  </span>
                  <button
                    onClick={() => copyToClipboard(videoStoryboard.caption)}
                    className="text-xs text-purple-300 hover:text-white underline cursor-pointer"
                  >
                    ቅዳ (Copy Caption)
                  </button>
                </div>
                <p className="font-ethiopic text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {videoStoryboard.caption}
                </p>
              </div>

            </div>
          ) : format === 'visual_card' && selectedItem ? (
            /* BRANDED SOCIAL CARD MOCKUP (Royal Blue, Purple, Gold + Real Logo) */
            <div className="bg-white rounded-3xl p-6 border border-[#E2E8F0] shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-slate-600">Aspect Ratio:</span>
                {(['1:1', '9:16', '16:9'] as const).map(ratio => (
                  <button
                    key={ratio}
                    onClick={() => setAspectRatio(ratio)}
                    className={`px-2.5 py-1 rounded-md text-xs font-bold cursor-pointer ${
                      aspectRatio === ratio ? 'bg-[#123B6D] text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>

              {/* The Card Rendered */}
              <div className={`mx-auto bg-gradient-to-br from-[#091B33] via-[#240F3D] to-[#3B1C54] text-white rounded-2xl p-6 border-2 border-[#D4A72C]/40 shadow-xl flex flex-col justify-between relative overflow-hidden ${
                aspectRatio === '1:1' ? 'aspect-square max-w-sm' :
                aspectRatio === '9:16' ? 'aspect-9/16 max-w-xs' : 'aspect-16/9 w-full'
              }`}>
                {/* Top Badge with Real Logo */}
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-2">
                    <img
                      src="/assets/aistudio/image_01084dd6.png"
                      alt="Logo"
                      className="w-8 h-8 rounded-full object-cover bg-white ring-1 ring-[#D4A72C]"
                    />
                    <span className="text-[10px] font-bold tracking-wider text-slate-200">
                      ORTHODOXY & ECONOMY
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-[#D4A72C] bg-white/10 px-2 py-0.5 rounded">
                    {selectedItem.listingType.toUpperCase()}
                  </span>
                </div>

                {/* Center Content */}
                <div className="space-y-2 py-4 relative z-10">
                  <h4 className="font-ethiopic text-lg sm:text-xl font-black text-white leading-tight">
                    {selectedItem.displayTitle}
                  </h4>
                  <p className="font-ethiopic text-xs text-purple-200 line-clamp-3">
                    {selectedItem.description}
                  </p>
                  <div className="text-sm font-bold text-[#D4A72C]">
                    {selectedItem.sub}
                  </div>
                </div>

                {/* Bottom Contacts */}
                <div className="pt-3 border-t border-purple-800/60 flex items-center justify-between text-[10px] text-slate-300 relative z-10">
                  <span>📞 +251 922 901 083</span>
                  <span className="text-[#93C5FD]">@orthodoxy_economy</span>
                </div>
              </div>

              <p className="text-center text-xs text-slate-400">
                Official Ethiopian Orthodox design with verified contact branding.
              </p>
            </div>
          ) : (
            /* TEXT COPY PREVIEW */
            <div className="bg-white rounded-3xl p-6 border border-[#E2E8F0] shadow-xs space-y-4">
              {generatedCopy ? (
                <div className="space-y-4">
                  <div className="bg-[#F8FAFC] p-5 rounded-2xl border border-slate-200 space-y-3">
                    <h4 className="font-bold text-sm text-[#08294F]">{generatedCopy.headline}</h4>
                    <p className="font-ethiopic text-xs sm:text-sm text-slate-800 whitespace-pre-line leading-relaxed">
                      {generatedCopy.postCopy}
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {generatedCopy.hashtags.map(tag => (
                        <span key={tag} className="text-xs text-[#123B6D] font-bold">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {platform === 'telegram' && generatedCopy.telegramFormatted && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Direct Telegram Ready Format:
                      </span>
                      <pre className="p-3 bg-slate-900 text-slate-200 rounded-xl text-xs font-mono whitespace-pre-wrap overflow-x-auto">
                        {generatedCopy.telegramFormatted}
                      </pre>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-20 text-center space-y-3 text-slate-400">
                  <Video className="w-12 h-12 text-[#D4A72C] mx-auto animate-bounce" />
                  <p className="text-sm font-bold text-slate-700 font-ethiopic">
                    በግራ በኩል ያለውን አዝራር በመጫን ባለ 1 ደቂቃ ቪዲዮዎን ያዘጋጁ!
                  </p>
                  <p className="text-xs max-w-sm mx-auto font-ethiopic text-slate-500">
                    ሙሉ የ 60 ሰከንድ ቪዲዮ ከትረካ ድምጽ፣ ጽሑፍ፣ ምስልና የኦርቶዶክሳዊ የበገና ዜማ ጋር እዚህ ይፈጠራል።
                  </p>
                  <button
                    onClick={handleGenerate}
                    className="mt-2 bg-[#123B6D] hover:bg-[#08294F] text-white px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer inline-flex items-center gap-2 shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#D4A72C]" />
                    <span>አሁን ቪዲዮ ሥራ (Generate 1-Min Video)</span>
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

      </div>
      ) : (
        /* MY AI CONTENT LIBRARY VIEW */
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-extrabold text-[#08294F]">
                {language === 'am' ? 'የተቀመጡ የይዘት ረቂቆች (My AI Content Library)' : 'Saved Marketing Content & Drafts'}
              </h3>
              <p className="text-xs text-slate-500 font-ethiopic">
                {language === 'am'
                  ? 'ለቴሌግራም፣ ቲክቶክ እና ማኅበራዊ ሚዲያ የተዘጋጁ ይዘቶችን እዚህ ያግኙ፣ ይቅዱ ወይም ዳውንሎድ ያድርጉ።'
                  : 'Access, copy, download, and manage your generated social media announcements.'}
              </p>
            </div>
          </div>

          {savedLibrary.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <FolderHeart className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700 font-ethiopic">
                {language === 'am' ? 'እስካሁን ምንም የተቀመጠ ይዘት የለም' : 'No saved content in library yet'}
              </p>
              <button
                onClick={() => setActiveStudioTab('creator')}
                className="bg-[#123B6D] text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer font-ethiopic"
              >
                ወደ ስቱዲዮ ተመለስና ይዘት ፍጠር
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedLibrary.map((item) => (
                <div key={item.id} className="bg-[#F8FAFC] p-4 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#123B6D] capitalize">{item.platform} · {item.format}</span>
                    <span className="text-[10px] text-slate-400">{item.timestamp}</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 line-clamp-1">{item.title}</h4>
                  <p className="text-xs text-slate-600 line-clamp-4 font-mono bg-white p-2.5 rounded-xl border border-slate-100 whitespace-pre-wrap">
                    {item.content}
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                    <button
                      onClick={() => copyToClipboard(item.content)}
                      className="text-[#123B6D] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>ቅዳ (Copy)</span>
                    </button>
                    <button
                      onClick={() => deleteSavedItem(item.id)}
                      className="text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>ሰርዝ (Delete)</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
