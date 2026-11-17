import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { aiService } from '../../services/aiService';
import { ORTHODOX_KNOWLEDGE_BASE, OrthodoxKnowledgeItem } from '../../data/orthodoxKnowledge';
import { 
  BookOpen, 
  Sparkles, 
  Search, 
  ShieldCheck, 
  Scroll, 
  Calendar, 
  FileText, 
  Upload, 
  Check, 
  Copy, 
  Download, 
  HelpCircle, 
  ChevronRight, 
  ArrowRight,
  ExternalLink,
  Layers,
  Send,
  Video,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  RefreshCw
} from 'lucide-react';

export const OrthodoxKnowledgeView: React.FC = () => {
  const { language, t, setActiveTab } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'rag' | 'sources' | 'files' | 'bible' | 'calendar'>('rag');
  
  // RAG State
  const [ragQuery, setRagQuery] = useState('');
  const [ragMode, setRagMode] = useState<string>('orthodox_knowledge');
  const [maxAuthority, setMaxAuthority] = useState<number>(4);
  const [isRagLoading, setIsRagLoading] = useState(false);
  const [isRagStreaming, setIsRagStreaming] = useState(false);
  const [ragResult, setRagResult] = useState<any>(null);
  const [copiedText, setCopiedText] = useState(false);
  const ragAbortRef = useRef<AbortController | null>(null);

  // File Center State
  const [fileText, setFileText] = useState('');
  const [fileName, setFileName] = useState('orthodox_study_doc.txt');
  const [fileAction, setFileAction] = useState<string>('study_guide');
  const [isFileLoading, setIsFileLoading] = useState(false);
  const [fileResult, setFileResult] = useState<any>(null);

  // Bible Search State
  const [bibleQuery, setBibleQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredSources = ORTHODOX_KNOWLEDGE_BASE.filter(item => {
    const matchCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchQuery = !bibleQuery || 
      item.title.toLowerCase().includes(bibleQuery.toLowerCase()) ||
      item.titleAm.includes(bibleQuery) ||
      item.citation.toLowerCase().includes(bibleQuery.toLowerCase()) ||
      item.excerptAm.includes(bibleQuery) ||
      item.tags.some(t => t.toLowerCase().includes(bibleQuery.toLowerCase()));
    return matchCat && matchQuery;
  });

  const handleRagSearch = async (queryText?: string) => {
    const textToSearch = queryText || ragQuery;
    if (!textToSearch.trim()) return;

    ragAbortRef.current?.abort();
    const controller = new AbortController();
    ragAbortRef.current = controller;

    setIsRagLoading(true);
    setIsRagStreaming(true);
    setRagResult(null);
    setCopiedText(false);

    try {
      await aiService.askOrthodoxRAGStream(textToSearch, ragMode, maxAuthority, language, {
        signal: controller.signal,
        onMeta: (meta) => {
          setRagResult({
            answer: '',
            answerAm: '',
            ...meta,
          });
          setIsRagLoading(false);
        },
        onChunk: (fullText) => {
          setIsRagLoading(false);
          setRagResult((prev: any) => ({
            ...(prev || { sources: [], mode: ragMode, hasSufficientSources: true }),
            answer: language === 'am' ? prev?.answer || '' : fullText,
            answerAm: language === 'am' ? fullText : prev?.answerAm || '',
          }));
        },
        onDone: (doneMeta) => {
          setIsRagStreaming(false);
          setIsRagLoading(false);
          setRagResult((prev: any) =>
            prev
              ? {
                  ...prev,
                  cached: doneMeta.cached ?? prev.cached,
                  summaryPoints: doneMeta.summaryPoints ?? prev.summaryPoints,
                  canonicalReference: doneMeta.canonicalReference ?? prev.canonicalReference,
                }
              : prev
          );
        },
      });
    } catch (e) {
      if ((e as any)?.name !== 'AbortError') {
        console.error('RAG Error:', e);
      }
    } finally {
      setIsRagLoading(false);
      setIsRagStreaming(false);
    }
  };

  const handleFileAnalysis = async () => {
    if (!fileText.trim()) return;
    setIsFileLoading(true);
    setFileResult(null);

    try {
      const res = await aiService.analyzeDocumentFile(fileText, fileName, fileAction, language);
      setFileResult(res);
    } catch (e) {
      console.error('File Analysis Error:', e);
    } finally {
      setIsFileLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    try {
      navigator.clipboard?.writeText(text);
    } catch {
      // Clipboard fallback ignored in restricted iframe
    }
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Top Banner with Authentic Cathedral Backdrop + Official Logo */}
      <div className="rounded-3xl p-6 sm:p-10 border border-sky-300/40 shadow-xl relative overflow-hidden text-white">
        {/* Authentic Medhane Alem Cathedral Background (Clearly Visible) */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/assets/aistudio/image_6776db67.png" 
            alt="Medhane Alem Cathedral" 
            className="w-full h-full object-cover object-[center_35%] brightness-[0.75] contrast-110"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#06182E]/90 via-[#0B2A52]/75 to-[#06182E]/90" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#06182E] via-transparent to-black/30 pointer-events-none" />
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr from-[#123B6D] via-[#D4A72C] to-[#581C87] shadow-lg shrink-0">
                <img
                  src="/assets/aistudio/image_01084dd6.png"
                  alt="Orthodoxy & Economy"
                  className="w-full h-full object-cover rounded-full bg-white"
                />
              </div>
              <div className="inline-flex items-center gap-1.5 bg-[#D4A72C]/20 border border-[#D4A72C]/40 px-3 py-1 rounded-full text-xs font-bold text-[#F3D77A]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Orthodox AI Knowledge & RAG Engine</span>
              </div>
            </div>

            <h1 className="font-ethiopic text-2xl sm:text-4xl font-black text-white">
              {language === 'am' ? 'የኦርቶዶክስ ተዋሕዶ ዕውቀትና ሰነድ መመርመሪያ' : 'Orthodox Knowledge & AI Intelligence'}
            </h1>
            <p className="font-ethiopic text-xs sm:text-sm text-purple-200 leading-relaxed">
              {language === 'am'
                ? 'በተፈቀዱ የቤተክርስቲያን ቀኖናዎች፣ በመጽሐፍ ቅዱስ፣ በፍትሐ ነገሥት እና በባሕረ ሐሳብ ላይ የተመሠረተ አስተማማኝ የዕውቀትና የሰነድ መመርመሪያ RAG ሥርዓት።'
                : 'Authoritative Ethiopian Orthodox retrieval-augmented intelligence grounded strictly in canonical scripture, patristic writings, and ethical economic stewardship.'}
            </p>
          </div>

          {/* Authority Levels Legend */}
          <div className="bg-white/10 backdrop-blur-xs p-4 rounded-2xl border border-white/20 text-xs space-y-2 shrink-0">
            <span className="text-[10px] uppercase font-bold text-[#D4A72C] block">
              Source Authority Hierarchy:
            </span>
            <div className="space-y-1 text-[11px] text-slate-200 font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span>Level 1: Holy Scripture & Canon (ቀኖና)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                <span>Level 2: Approved Dogma & Patristics</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Level 3: Church History & Computus (ባሕረ ሐሳብ)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                <span>Level 4: Economic Ethics & Stewardship</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 scrollbar-none text-xs font-bold">
        {[
          { id: 'rag', label: language === 'am' ? '📖 ጠይቅና ተማር (Orthodox RAG QA)' : 'Grounded RAG QA', icon: HelpCircle },
          { id: 'sources', label: language === 'am' ? '📚 የተፈቀዱ ምንጮች (Sources)' : 'Approved Sources', icon: BookOpen },
          { id: 'files', label: language === 'am' ? '📂 AI ሰነድ መመርመሪያ (File Center)' : 'AI File Center', icon: FileText },
          { id: 'bible', label: language === 'am' ? '✝️ የመጽሐፍ ቅዱስ ፍለጋ (Scripture)' : 'Bible Search', icon: Scroll },
          { id: 'calendar', label: language === 'am' ? '📅 ባሕረ ሐሳብና አጽዋማት (Calendar)' : 'Fasts & Calendar', icon: Calendar },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
                isActive
                  ? 'bg-[#123B6D] text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: ORTHODOX GROUNDED RAG QA */}
      {activeSubTab === 'rag' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Query Controls */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
            <div>
              <h3 className="text-base font-extrabold text-[#08294F] font-ethiopic">
                {language === 'am' ? 'የተረጋገጠ የዕውቀት ጥያቄ አቅርብ' : 'Ask the Orthodox Knowledge Base'}
              </h3>
              <p className="text-xs text-slate-500 font-ethiopic">
                {language === 'am'
                  ? 'ጥያቄዎን በአማርኛ ወይም በእንግሊዝኛ ይጻፉ፤ AI መልሱን የሚያመነጨው ከተፈቀዱት የቤተክርስቲያን ምንጮች ብቻ ነው።'
                  : 'Grounded exclusively in approved scriptures, canon law, and church doctrine.'}
              </p>
            </div>

            {/* Mode Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                {language === 'am' ? 'የትኩረት ዘርፍ (Study Mode)' : 'Specialized Knowledge Mode'}:
              </label>
              <select
                value={ragMode}
                onChange={(e) => setRagMode(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
              >
                <option value="orthodox_knowledge">ኦርቶዶክሳዊ ዕውቀት (Orthodox Knowledge)</option>
                <option value="bible_study">የመጽሐፍ ቅዱስ ጥናት (Bible Study)</option>
                <option value="theology">ነገረ መለኮት (Theology & Dogma)</option>
                <option value="church_history">የቤተክርስቲያን ታሪክ (Church History)</option>
                <option value="calendar">ባሕረ ሐሳብና አጽዋማት (Calendar & Fasts)</option>
                <option value="economic_ethics">የክርስቲያናዊ ንግድ ሥነ-ምግባር (Economic Stewardship)</option>
              </select>
            </div>

            {/* Max Authority Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                {language === 'am' ? 'የምንጭ ትክክለኛነት ደረጃ (Authority Level)' : 'Maximum Authority Filter'}:
              </label>
              <select
                value={maxAuthority}
                onChange={(e) => setMaxAuthority(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
              >
                <option value={1}>ደረጃ 1 ብቻ፦ መጽሐፍ ቅዱስ እና የቀኖና መጻሕፍት (Level 1 Only)</option>
                <option value={2}>ደረጃ 1 & 2፦ መጽሐፍ ቅዱስ፣ ቀኖና እና ሃይማኖተ አበው</option>
                <option value={3}>ደረጃ 1 እስከ 3፦ ታሪክና ባሕረ ሐሳብን ጨምሮ</option>
                <option value={4}>ሁሉም የተፈቀዱ ምንጮች (Levels 1 - 4: Complete Knowledge)</option>
              </select>
            </div>

            {/* Query Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                {language === 'am' ? 'የጥያቄው ጽሑፍ' : 'Your Question'}:
              </label>
              <textarea
                rows={3}
                value={ragQuery}
                onChange={(e) => setRagQuery(e.target.value)}
                placeholder={language === 'am' ? 'ለምሳሌ፦ ፍትሐ ነገሥት ስለ ንግድ ውልና ስለ ታማኝ ሚዛን ምን ይደነግጋል?' : 'e.g. What does Orthodox canon teach regarding contracts and fair trade?'}
                className="w-full p-3 bg-[#F8FAFC] border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 font-ethiopic focus:ring-2 focus:ring-[#123B6D]/20 focus:outline-none"
              />
            </div>

            <button
              onClick={() => handleRagSearch()}
              disabled={isRagLoading || !ragQuery.trim()}
              className="w-full bg-[#123B6D] hover:bg-[#08294F] text-white py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isRagLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-[#F3D77A]" />
                  <span>Searching Approved Knowledge Sources...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#F3D77A]" />
                  <span>{language === 'am' ? 'መልስ ፈልግ (Grounded Search)' : 'Retrieve Grounded Answer'}</span>
                </>
              )}
            </button>

            {/* Quick Sample Questions */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                {language === 'am' ? 'የተመረጡ የጥያቄ ምሳሌዎች (Sample Prompts):' : 'Suggested Queries:'}
              </span>
              <div className="space-y-1.5 text-xs">
                {[
                  'ፍትሐ ነገሥት ስለ ንግድና ውል ምን ይደነግጋል?',
                  'ስለ ታማኝ ድካምና ለሠራተኛ ደመወዝ መክፈል መጽሐፍ ቅዱስ ምን ይላል?',
                  'የኢትዮጵያ ኦርቶዶክስ ተዋሕዶ ሰባቱ አጽዋማት እነማን ናቸው?',
                  'ባሕረ ሐሳብ የፋሲካን በዓል እንዴት ያሰላል?'
                ].map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setRagQuery(sample);
                      handleRagSearch(sample);
                    }}
                    className="w-full text-left p-2 rounded-xl bg-slate-50 hover:bg-purple-50 text-slate-700 hover:text-[#123B6D] font-ethiopic transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <span className="truncate">{sample}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#123B6D] shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RAG Answer Display */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-extrabold text-[#08294F]">
                  {language === 'am' ? 'የ RAG መልስና የተረጋገጡ ምንጮች' : 'Grounded Answer & Citations'}
                </h3>
                <p className="text-xs text-slate-500">
                  {ragResult ? `${ragResult.sources.length} authoritative source passages retrieved` : 'Awaiting question submission'}
                </p>
              </div>

              {ragResult && (
                <button
                  onClick={() => copyToClipboard(language === 'am' ? ragResult.answerAm : ragResult.answer)}
                  className="bg-purple-50 text-[#3B1C54] hover:bg-purple-100 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedText ? 'Copied' : 'Copy Answer'}</span>
                </button>
              )}
            </div>

            {isRagLoading && !ragResult ? (
              <div className="py-20 text-center space-y-3">
                <Sparkles className="w-10 h-10 text-purple-600 animate-spin mx-auto" />
                <p className="text-sm font-bold text-slate-700">Retrieving Authoritative Orthodox Sources...</p>
                <p className="text-xs text-slate-400 font-ethiopic">የቀኖና መጻሕፍት፣ መጽሐፍ ቅዱስ እና የሊቃውንት ትምህርቶች እየተመረመሩ ነው...</p>
              </div>
            ) : ragResult ? (
              <div className="space-y-6">
                
                {/* Answer Box */}
                <div className="bg-[#F8FAFC] rounded-2xl p-5 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      Grounded in Approved Sources
                    </span>
                    {ragResult.canonicalReference && (
                      <span className="text-xs font-bold text-[#123B6D] font-ethiopic">
                        {ragResult.canonicalReference}
                      </span>
                    )}
                  </div>

                  {isRagStreaming && !(language === 'am' ? ragResult.answerAm : ragResult.answer) ? (
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-ethiopic py-2">
                      <Sparkles className="w-3.5 h-3.5 text-purple-600 animate-spin" />
                      <span>{language === 'am' ? 'ከተረጋገጡ ምንጮች መልስ እየተዘጋጀ ነው...' : 'Synthesizing grounded answer...'}</span>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-900 leading-relaxed font-ethiopic font-medium whitespace-pre-line">
                      {language === 'am' ? ragResult.answerAm : ragResult.answer}
                      {isRagStreaming && <span className="inline-block w-1.5 h-4 ml-1 align-middle bg-[#123B6D] animate-pulse" />}
                    </p>
                  )}

                  {ragResult.summaryPoints && (
                    <div className="pt-2 border-t border-slate-200/60 space-y-1">
                      {ragResult.summaryPoints.map((pt: string, pIdx: number) => (
                        <div key={pIdx} className="flex items-start gap-1.5 text-xs text-slate-600 font-ethiopic">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{pt}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Source Citations List */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-[#D4A72C]" />
                    <span>{language === 'am' ? 'የተጠቀሱ ይፋዊ ምንጮች (Authoritative Citations):' : 'Authoritative Citations:'}</span>
                  </h4>

                  {ragResult.sources.map((src: any, sIdx: number) => (
                    <div
                      key={sIdx}
                      className="bg-white rounded-2xl p-4 border border-slate-200 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{src.sourceName}</span>
                        <span className="text-[10px] font-black uppercase tracking-wider bg-amber-100 text-[#08294F] px-2 py-0.5 rounded-md">
                          Authority Level {src.authorityLevel}
                        </span>
                      </div>
                      <p className="text-[#123B6D] font-bold font-ethiopic">{src.citation}</p>
                      <p className="text-slate-600 font-ethiopic bg-slate-50 p-2.5 rounded-xl border border-slate-100 italic">
                        "{src.excerptAm}"
                      </p>
                    </div>
                  ))}
                </div>

              </div>
            ) : (
              <div className="py-20 text-center space-y-3 text-slate-400">
                <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-600 font-ethiopic">
                  ጥያቄዎን በግራ በኩል ያስገቡ ወይም ከምሳሌዎቹ አንዱን ይምረጡ።
                </p>
                <p className="text-xs max-w-sm mx-auto font-ethiopic">
                  AI በኦርቶዶክስ ተዋሕዶ የቀኖና መጻሕፍት ላይ የተመሠረተ የተሟላ ማብራሪያ ከትክክለኛ ጥቅሶች ጋር ያቀርባል።
                </p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 2: AUTHORITATIVE SOURCES REPOSITORY */}
      {activeSubTab === 'sources' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-extrabold text-[#08294F] font-ethiopic">
                {language === 'am' ? 'የተፈቀዱ የኢትዮጵያ ኦርቶዶክስ ተዋሕዶ ምንጮች' : 'Approved Knowledge Repository'}
              </h3>
              <p className="text-xs text-slate-500 font-ethiopic">
                መጽሐፍ ቅዱስ፣ ፍትሐ ነገሥት፣ የቀኖና መጻሕፍት፣ ሃይማኖተ አበው እና ባሕረ ሐሳብ
              </p>
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3.5 py-2 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
            >
              <option value="all">ሁሉም ምድቦች (All Categories)</option>
              <option value="scripture">መጽሐፍ ቅዱስ (Holy Scripture)</option>
              <option value="canon">ቀኖና / ፍትሐ ነገሥት (Canon Law)</option>
              <option value="theology">ነገረ መለኮት (Theology & Dogma)</option>
              <option value="calendar_fasts">ባሕረ ሐሳብና አጽዋማት (Computus & Fasts)</option>
              <option value="church_history">የቤተክርስቲያን ታሪክ (Church History)</option>
              <option value="economic_ethics">ኢኮኖሚና ሥነ-ምግባር (Economic Stewardship)</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSources.map((item) => (
              <div
                key={item.id}
                className="bg-[#F8FAFC] rounded-2xl p-5 border border-slate-200 hover:border-[#123B6D]/40 transition-all space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-[#3B1C54] px-2 py-0.5 rounded-md">
                      {item.category.toUpperCase()}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-wider bg-amber-100 text-[#08294F] px-2 py-0.5 rounded-md">
                      Level {item.authorityLevel} Authority
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 font-ethiopic">{item.titleAm}</h4>
                  <p className="text-xs font-bold text-[#123B6D] font-ethiopic">{item.citation}</p>
                  
                  <div className="bg-white p-3 rounded-xl border border-slate-100 text-xs text-slate-700 font-ethiopic leading-relaxed">
                    "{item.excerptAm}"
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                  <span className="text-[11px] text-slate-500">{item.sourceName}</span>
                  <button
                    onClick={() => {
                      setActiveSubTab('rag');
                      setRagQuery(`ስለ ${item.titleAm} አስተምረኝ`);
                      handleRagSearch(`ስለ ${item.titleAm} አስተምረኝ`);
                    }}
                    className="text-[#123B6D] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span>ጥያቄ ጠይቅ</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: AI FILE CENTER & INTELLIGENCE */}
      {activeSubTab === 'files' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* File Input & Controls */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
            <div>
              <h3 className="text-base font-extrabold text-[#08294F] font-ethiopic">
                {language === 'am' ? 'የሰነድ ይዘት መመርመሪያ (AI File Center)' : 'Document & Text Intelligence'}
              </h3>
              <p className="text-xs text-slate-500 font-ethiopic">
                {language === 'am'
                  ? 'የማንኛውንም ትምህርታዊ ሰነድ፣ የጥናት ጽሑፍ ወይም መጽሐፍ ጽሑፍ እዚህ ያስገቡ፤ AI በሰከንዶች ውስጥ ይተነትናል።'
                  : 'Analyze documents, generate study guides, extract quizzes, or convert into social posts.'}
              </p>
            </div>

            {/* Document Title */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">የሰነዱ ስም (Document Title):</label>
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
              />
            </div>

            {/* Action Select */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">የሚፈለገው የ AI ተግባር (AI Action):</label>
              <select
                value={fileAction}
                onChange={(e) => setFileAction(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
              >
                <option value="study_guide">የጥናት መመሪያ አዘጋጅ (Generate Study Guide)</option>
                <option value="summarize">አጭር ማጠቃለያ አውጣ (Summarize Document)</option>
                <option value="quiz">የፈተና ጥያቄዎችና መልሶች አዘጋጅ (Generate Quiz & Answers)</option>
                <option value="turn_into_content">ወደ ቴሌግራም/ማኅበራዊ ሚዲያ ቀይር (Turn File Into Content)</option>
              </select>
            </div>

            {/* Document Text Input */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">የሰነዱ ይዘት (Paste Document Content):</label>
              <textarea
                rows={6}
                value={fileText}
                onChange={(e) => setFileText(e.target.value)}
                placeholder="የሰነዱን ወይም የመጽሐፉን ጽሑፍ እዚህ ይለጥፉ..."
                className="w-full p-3 bg-[#F8FAFC] border border-slate-200 rounded-2xl text-xs text-slate-800 font-ethiopic focus:outline-none"
              />
            </div>

            <button
              onClick={handleFileAnalysis}
              disabled={isFileLoading || !fileText.trim()}
              className="w-full bg-[#123B6D] hover:bg-[#08294F] text-white py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isFileLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-[#F3D77A]" />
                  <span>Analyzing Document with AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#F3D77A]" />
                  <span>{language === 'am' ? 'ሰነዱን በ AI መርምር (Analyze Document)' : 'Run Document Intelligence'}</span>
                </>
              )}
            </button>

            {/* Quick Sample Button */}
            <button
              type="button"
              onClick={() => {
                setFileName('የክርስቲያናዊ_ንግድ_ሥነ-ምግባር.txt');
                setFileText(`የኢትዮጵያ ኦርቶዶክስ ተዋሕዶ ቤተክርስቲያን በፍትሐ ነገሥት አንቀጽ ፴፫ ላይ እንደምትደነግገው የንግድ ግብይት በሁለት ወገን ፈቃደኝነትና በእውነተኛ ሚዛን ላይ መመስረት አለበት።
ማንኛውም ነጋዴ ዕቃው ላይ ያለውን እንከን ለገዢው ሳይደብቅ መግለጽ ይኖርበታል። ደመወዝ ለሠራተኛው በወቅቱና በፍትሐዊነት መከፈል እንዳለበት በዘዳግም ፳፬፥፲፬ ላይ ተጽፏል።`);
              }}
              className="w-full text-center text-xs text-[#123B6D] hover:underline font-bold cursor-pointer"
            >
              + የሙከራ ሰነድ ጽሑፍ ሙላ (Load Sample Text)
            </button>
          </div>

          {/* Analysis Results Display */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-extrabold text-[#08294F]">
                  {language === 'am' ? 'የተተነተነ የሰነድ ውጤት' : 'Intelligence Results'}
                </h3>
                <p className="text-xs text-slate-500">
                  {fileResult ? `Output generated for ${fileName}` : 'Awaiting document submission'}
                </p>
              </div>

              {fileResult && (
                <button
                  onClick={() => {
                    const blob = new Blob([JSON.stringify(fileResult, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `${fileName}_analysis.json`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Report</span>
                </button>
              )}
            </div>

            {isFileLoading ? (
              <div className="py-20 text-center space-y-3">
                <Sparkles className="w-10 h-10 text-purple-600 animate-spin mx-auto" />
                <p className="text-sm font-bold text-slate-700">Executing Multi-Step Document Ingestion...</p>
                <div className="text-xs text-slate-400 space-y-1">
                  <p>✓ Text cleaned and normalized</p>
                  <p>✓ Contextual reasoning in progress</p>
                  <p>● Generating structured educational outputs</p>
                </div>
              </div>
            ) : fileResult ? (
              <div className="space-y-5">
                
                {/* Summary */}
                <div className="bg-[#F8FAFC] rounded-2xl p-5 border border-slate-200 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#123B6D]">
                    {language === 'am' ? 'የሰነዱ ማጠቃለያ (Document Summary):' : 'Executive Summary:'}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-800 font-ethiopic leading-relaxed">
                    {language === 'am' ? fileResult.summaryAm : fileResult.summary}
                  </p>
                </div>

                {/* Key Points */}
                {fileResult.keyPoints && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      {language === 'am' ? 'ዋና ዋና ትምህርቶችና ነጥቦች:' : 'Key Takeaways:'}
                    </h4>
                    <div className="space-y-1.5">
                      {fileResult.keyPoints.map((kp: string, idx: number) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 font-ethiopic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{kp}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quiz Questions */}
                {fileResult.quizQuestions && fileResult.quizQuestions.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-purple-900">
                      {language === 'am' ? 'የጥናት መፈተኛ ጥያቄዎች (Generated Quiz):' : 'Quiz & Review Questions:'}
                    </h4>
                    {fileResult.quizQuestions.map((q: any, qIdx: number) => (
                      <div key={qIdx} className="bg-purple-50/60 p-4 rounded-2xl border border-purple-200 text-xs space-y-2">
                        <p className="font-bold text-slate-900 font-ethiopic">{qIdx + 1}. {q.question}</p>
                        <div className="grid grid-cols-2 gap-1.5 pt-1">
                          {q.options.map((opt: string, oIdx: number) => (
                            <span
                              key={oIdx}
                              className={`p-2 rounded-lg text-xs font-medium font-ethiopic ${
                                oIdx === q.correctIndex 
                                  ? 'bg-emerald-100 text-emerald-950 font-bold border border-emerald-300' 
                                  : 'bg-white text-slate-700 border border-slate-200'
                              }`}
                            >
                              {opt} {oIdx === q.correctIndex && '✓ (ትክክለኛ)'}
                            </span>
                          ))}
                        </div>
                        {q.explanation && (
                          <p className="text-[11px] text-slate-500 font-ethiopic pt-1 italic">
                            ማብራሪያ፦ {q.explanation}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Telegram Post Output */}
                {fileResult.telegramPost && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Telegram Ready Post:
                      </span>
                      <button
                        onClick={() => copyToClipboard(fileResult.telegramPost)}
                        className="text-xs text-[#123B6D] hover:underline font-bold cursor-pointer"
                      >
                        Copy Telegram Post
                      </button>
                    </div>
                    <pre className="p-3.5 bg-slate-900 text-slate-200 rounded-2xl text-xs font-mono whitespace-pre-wrap overflow-x-auto">
                      {fileResult.telegramPost}
                    </pre>
                  </div>
                )}

              </div>
            ) : (
              <div className="py-20 text-center space-y-3 text-slate-400">
                <FileText className="w-12 h-12 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-600 font-ethiopic">
                  የሰነዱን ጽሑፍ በግራ በኩል ያስገቡና «ሰነዱን በ AI መርምር» የሚለውን ይጫኑ።
                </p>
                <p className="text-xs max-w-sm mx-auto font-ethiopic">
                  AI ማጠቃለያ፣ የጥናት መመሪያ፣ የፈተና ጥያቄዎችን እና ለማኅበራዊ ሚዲያ የሚሆን ይዘት ያዘጋጃል።
                </p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 4: SCRIPTURE & BIBLE SEARCH */}
      {activeSubTab === 'bible' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-extrabold text-[#08294F] font-ethiopic">
                {language === 'am' ? 'የመጽሐፍ ቅዱስ እና የቀኖና ፍለጋ' : 'Scripture & Canonical Search'}
              </h3>
              <p className="text-xs text-slate-500 font-ethiopic">
                በአርእስት፣ በምዕራፍ፣ በቁጥር ወይም በቁልፍ ቃላት ይፈልጉ
              </p>
            </div>

            <div className="w-full sm:w-72">
              <input
                type="text"
                value={bibleQuery}
                onChange={(e) => setBibleQuery(e.target.value)}
                placeholder="ፈልግ (ምሳሌ፦ ሥራ፣ ሚዛን፣ ደመወዝ)..."
                className="w-full px-3.5 py-2 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs font-ethiopic focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-4">
            {filteredSources.filter(s => s.category === 'scripture' || s.category === 'canon').map((item) => (
              <div key={item.id} className="p-4 bg-[#F8FAFC] border border-slate-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#123B6D] text-xs font-ethiopic">{item.citation}</span>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                    Level 1 Scripture & Canon
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-900 font-ethiopic leading-relaxed">
                  "{item.excerptAm}"
                </p>
                <p className="text-[11px] text-slate-500 italic">
                  "{item.excerpt}"
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: ETHIOPIAN ORTHODOX CALENDAR & FASTS (ባሕረ ሐሳብ) */}
      {activeSubTab === 'calendar' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="pb-4 border-b border-slate-100 space-y-1">
            <h3 className="text-base font-extrabold text-[#08294F] font-ethiopic">
              {language === 'am' ? 'የኢትዮጵያ ኦርቶዶክስ ተዋሕዶ ባሕረ ሐሳብና አጽዋማት' : 'Computus (Bahire Hasab) & Canonical Fasts'}
            </h3>
            <p className="text-xs text-slate-500 font-ethiopic">
              ሰባቱ የአዋጅ አጽዋማት፣ ፲፫ቱ ወራት እና የዘመን አቆጣጠር ቀመሮች
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                title: 'ዐቢይ ጾም (ሁዳዴ)',
                duration: '፶፭ (55) ቀናት',
                desc: 'ጌታችን መድኃኒታችን ኢየሱስ ክርስቶስ በገዳመ ቆሮንቶስ የጾመው ጾም፤ የትንሣኤ መግቢያ።'
              },
              {
                title: 'ጾመ ሐዋርያት (የሰኔ ጾም)',
                duration: 'ከ፲፬ እስከ ፵፬ ቀናት (እንደ ፋሲካ መውጫ)',
                desc: 'ቅዱሳን ሐዋርያት መንፈስ ቅዱስን ከተቀበሉ በኋላ ለወንጌል አገልግሎት ከመሰማራታቸው በፊት የጾሙት።'
              },
              {
                title: 'ጾመ ፍልሰታ',
                duration: '፲፮ (16) ቀናት (ከነሐሴ ፩ - ፲፮)',
                desc: 'የእመቤታችን የቅድስት ድንግል ማርያም የሥጋዋ መነሳትና ዕርገት የታየበት የፍልሰታ ጾም።'
              },
              {
                title: 'ጾመ ነቢያት (የገና ጾም)',
                duration: '፵፫ (43) ቀናት (ከኅዳር ፲፭ - ታኅሣሥ ፳፰)',
                desc: 'ቅዱሳን ነቢያት የክርስቶስን መወለድ እየተጠባበቁ የጾሙት የልደት መዘጋጃ ጾም።'
              },
              {
                title: 'ጾመ ነነዌ',
                duration: '፫ (3) ቀናት',
                desc: 'የነነዌ ሰዎች በነቢዩ ዮናስ ስብከት ንስሐ የገቡበትና ምሕረት ያገኙበት ጾም።'
              },
              {
                title: 'ጾመ ድኅነት (ረቡዕና ዓርብ)',
                duration: 'በዓመቱ ሙሉ (ከበዓለ ሃምሳ ውጪ)',
                desc: 'ረቡዕ የክርስቶስ ምክረ ሞት የተደረገበት፤ ዓርብ ደግሞ የተሰቀለበት ቀን መታሰቢያ።'
              },
              {
                title: 'ጾመ ገሃድ (የልደትና የጥምቀት ዋዜማ)',
                duration: '፪ (2) ቀናት',
                desc: 'በዓላቱ እሮብ ወይም አርብ ቢውሉ ቀድሞ በዋዜማው የሚጾም ጾም።'
              },
              {
                title: 'ባሕረ ሐሳብ (የዘመን ቀመር)',
                duration: '፲፫ ወራት (፲፪ × ፴ + ጳጉሜን ፭/፮)',
                desc: 'በእስክንድርያው ፓትርያርክ ዲሜጥሮስ የተዘጋጀና በኢትዮጵያ የሚሠራበት ጥንታዊ የፀሐይና የጨረቃ ስሌት።'
              }
            ].map((fast, idx) => (
              <div key={idx} className="bg-[#F8FAFC] p-4 rounded-2xl border border-slate-200 space-y-1.5 font-ethiopic">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-[#08294F]">{fast.title}</h4>
                  <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                    {fast.duration}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{fast.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
