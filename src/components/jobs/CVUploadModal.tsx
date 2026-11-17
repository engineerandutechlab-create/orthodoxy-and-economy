import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { aiService } from '../../services/aiService';
import { 
  X, 
  FileText, 
  Upload, 
  Sparkles, 
  CheckCircle2, 
  Briefcase, 
  Trash2, 
  RefreshCw,
  FileCheck,
  ShieldCheck,
  Award,
  ChevronRight,
  FolderLock,
  Globe,
  Plus
} from 'lucide-react';
import { VaultDocument } from '../../types';

export const CVUploadModal: React.FC = () => {
  const { closeModal, currentUser, saveUserCV, updateProfile, language, setActiveTab } = useApp();

  const [activeTabMode, setActiveTabMode] = useState<'upload' | 'paste' | 'builder' | 'vault'>('upload');
  const [vaultDocTitle, setVaultDocTitle] = useState('');
  const [vaultDocType, setVaultDocType] = useState<VaultDocument['docType']>('certificate');
  const [vaultVisibility, setVaultVisibility] = useState<'PUBLIC' | 'PRIVATE'>('PUBLIC');
  const [vaultDocRef, setVaultDocRef] = useState('');
  const [selectedFile, setSelectedFile] = useState<{ name: string; size: number; text: string } | null>(null);
  const [cvText, setCvText] = useState<string>(currentUser?.cvFile?.textSnippet || '');
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [parsedResult, setParsedResult] = useState<{
    extractedSkills: string[];
    suggestedTitle: string;
    suggestedBio: string;
    suggestedBioAm: string;
    experienceYears: number;
  } | null>(currentUser?.cvParsed ? {
    extractedSkills: currentUser.cvParsed.extractedSkills || [],
    suggestedTitle: currentUser.cvParsed.suggestedTitle || '',
    suggestedBio: currentUser.cvParsed.summaryEn || '',
    suggestedBioAm: currentUser.cvParsed.summaryAm || '',
    experienceYears: currentUser.cvParsed.experienceYears || 2
  } : null);

  // Bilingual Structured CV Builder state
  const [builderTitle, setBuilderTitle] = useState(
    currentUser?.cvParsed?.suggestedTitle || currentUser?.profession || ''
  );
  const [builderYears, setBuilderYears] = useState(
    String(currentUser?.cvParsed?.experienceYears ?? 3)
  );
  const [builderSkills, setBuilderSkills] = useState(
    (currentUser?.cvParsed?.extractedSkills || currentUser?.skills || []).join(', ')
  );
  const [builderLanguages, setBuilderLanguages] = useState(
    (currentUser?.cvParsed?.languages || ['አማርኛ (Amharic)', 'English']).join(', ')
  );
  const [builderSummaryAm, setBuilderSummaryAm] = useState(
    currentUser?.cvParsed?.summaryAm || currentUser?.bioAm || ''
  );
  const [builderSummaryEn, setBuilderSummaryEn] = useState(
    currentUser?.cvParsed?.summaryEn || currentUser?.bio || ''
  );
  const [builderEduList, setBuilderEduList] = useState<
    { degree: string; institution: string; year: string }[]
  >(
    currentUser?.cvParsed?.education?.length
      ? currentUser.cvParsed.education
      : [{ degree: '', institution: '', year: '' }]
  );
  const [builderExpList, setBuilderExpList] = useState<
    { role: string; company: string; duration: string; highlights?: string }[]
  >(
    currentUser?.cvParsed?.experience?.length
      ? currentUser.cvParsed.experience
      : [{ role: '', company: '', duration: '', highlights: '' }]
  );

  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Handle local file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name;
    const fileSize = file.size;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        setSelectedFile({ name: fileName, size: fileSize, text });
        setCvText(text);
        runAIExtraction(text, fileName, fileSize);
      }
    };

    // If it's a text/doc-like file, read as text
    reader.readAsText(file);
  };

  const runAIExtraction = async (textToParse: string, name?: string, size?: number) => {
    if (!textToParse.trim()) return;

    setIsParsing(true);
    try {
      const res = await aiService.parseCV(textToParse);
      setParsedResult(res);

      const fileObj = {
        name: name || selectedFile?.name || 'My_Resume.pdf',
        size: size || selectedFile?.size || 1024 * 120,
        uploadedAt: new Date().toISOString(),
        textSnippet: textToParse.slice(0, 1000)
      };

      saveUserCV(fileObj, {
        suggestedTitle: res.suggestedTitle,
        extractedSkills: res.extractedSkills,
        experienceYears: res.experienceYears,
        summaryAm: res.suggestedBioAm,
        summaryEn: res.suggestedBio
      });
      setSaveSuccess(true);
    } catch (err) {
      console.warn('CV parse error:', err);
    } finally {
      setIsParsing(false);
    }
  };

  const handleManualParse = () => {
    runAIExtraction(cvText, 'Pasted_Resume.txt', cvText.length);
  };

  const handleRemoveExistingCV = () => {
    setSelectedFile(null);
    setCvText('');
    setParsedResult(null);
    setSaveSuccess(false);
    saveUserCV(null, null);
  };

  const handleAddVaultDoc = () => {
    if (!vaultDocTitle.trim() || !currentUser) return;
    const newDoc: VaultDocument = {
      id: `doc_${Date.now()}`,
      title: vaultDocTitle.trim(),
      docType: vaultDocType,
      visibility: vaultVisibility,
      urlOrContent: vaultDocRef.trim() || 'Uploaded Certificate File',
      uploadedAt: new Date().toISOString(),
    };
    const next = [newDoc, ...(currentUser.vaultDocuments || [])];
    updateProfile({ vaultDocuments: next });
    setVaultDocTitle('');
    setVaultDocRef('');
  };

  const handleRemoveVaultDoc = (id: string) => {
    if (!currentUser) return;
    updateProfile({
      vaultDocuments: (currentUser.vaultDocuments || []).filter((d) => d.id !== id),
    });
  };

  const handleSaveStructuredCV = (e: React.FormEvent) => {
    e.preventDefault();
    if (!builderTitle.trim()) return;
    const skillsArr = builderSkills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const langsArr = builderLanguages
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const cleanEdu = builderEduList.filter((ed) => ed.degree.trim() || ed.institution.trim());
    const cleanExp = builderExpList.filter((ex) => ex.role.trim() || ex.company.trim());
    const yearsNum = Math.max(0, Number(builderYears) || 1);

    const formattedSnippet = [
      `${currentUser?.fullName || 'Candidate'} — ${builderTitle.trim()} (${yearsNum} yrs)`,
      builderSummaryAm.trim() ? `Amharic: ${builderSummaryAm.trim()}` : '',
      builderSummaryEn.trim() ? `English: ${builderSummaryEn.trim()}` : '',
      skillsArr.length ? `Skills: ${skillsArr.join(', ')}` : '',
      cleanEdu.length
        ? `Education: ${cleanEdu.map((ed) => `${ed.degree} (${ed.institution}, ${ed.year})`).join('; ')}`
        : '',
      cleanExp.length
        ? `Experience: ${cleanExp.map((ex) => `${ex.role} @ ${ex.company} (${ex.duration})`).join('; ')}`
        : '',
    ]
      .filter(Boolean)
      .join('\n');

    const fileObj = {
      name: `${(currentUser?.fullName || 'My').replace(/\s+/g, '_')}_Bilingual_CV.pdf`,
      size: formattedSnippet.length * 4,
      uploadedAt: new Date().toISOString(),
      textSnippet: formattedSnippet.slice(0, 1000),
      builderGenerated: true,
    };

    const structuredParsed = {
      suggestedTitle: builderTitle.trim(),
      extractedSkills: skillsArr,
      experienceYears: yearsNum,
      summaryAm: builderSummaryAm.trim() || builderSummaryEn.trim(),
      summaryEn: builderSummaryEn.trim() || builderSummaryAm.trim(),
      education: cleanEdu,
      experience: cleanExp,
      languages: langsArr,
    };

    saveUserCV(fileObj, structuredParsed);
    setParsedResult({
      extractedSkills: skillsArr,
      suggestedTitle: builderTitle.trim(),
      suggestedBio: structuredParsed.summaryEn,
      suggestedBioAm: structuredParsed.summaryAm,
      experienceYears: yearsNum,
    });
    setSaveSuccess(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="relative bg-white rounded-3xl shadow-2xl border border-purple-200/80 max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#091B33] via-[#240F3D] to-[#3B1C54] text-white flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#123B6D] to-[#581C87] border border-[#D4A72C]/40 flex items-center justify-center text-[#D4A72C] shadow-xs">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded-full bg-[#D4A72C]/20 border border-[#D4A72C]/30 text-[#D4A72C] text-[10px] font-bold uppercase tracking-wider">
                  {language === 'am' ? 'የሥራ ፈላጊዎች ማዕከል' : 'Job Seeker Portal'}
                </span>
                <span className="text-[10px] text-purple-200 font-medium flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#D4A72C]" />
                  <span>AI Powered</span>
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold font-ethiopic tracking-tight">
                {language === 'am' ? 'የ CV ማስገቢያ እና የክህሎት መመዝገቢያ' : 'Resume / CV Upload & Career Profile'}
              </h2>
              <p className="text-xs text-purple-200 font-ethiopic mt-0.5">
                {language === 'am' 
                  ? 'CV ዎን ይጫኑ፤ AI ረዳታችን ክህሎትዎን መርምሮ ከአሠሪዎች ክፍት የሥራ ቦታዎች ጋር በቀጥታ ያገናኝዎታል!' 
                  : 'Upload your CV to automatically match vacancies and apply with 1-click.'}
              </p>
            </div>
          </div>

          <button
            onClick={closeModal}
            className="p-1.5 text-purple-200 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer shrink-0"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle: File Upload vs Paste Text vs Structured Builder vs Vault */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTabMode('upload')}
            className={`pb-3 px-3 text-xs font-bold font-ethiopic border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTabMode === 'upload'
                ? 'border-[#123B6D] text-[#123B6D]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{language === 'am' ? 'የ CV ፋይል መጫኛ' : 'Upload File'}</span>
          </button>

          <button
            onClick={() => setActiveTabMode('paste')}
            className={`pb-3 px-3 text-xs font-bold font-ethiopic border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTabMode === 'paste'
                ? 'border-[#3B1C54] text-[#3B1C54]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{language === 'am' ? 'ጽሑፍ መለጠፊያ' : 'Paste Text'}</span>
          </button>

          <button
            onClick={() => setActiveTabMode('builder')}
            className={`pb-3 px-3 text-xs font-bold font-ethiopic border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTabMode === 'builder'
                ? 'border-[#16845B] text-[#16845B]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-[#16845B]" />
            <span>{language === 'am' ? 'የሁለት ቋንቋ CV ገንቢ' : 'CV Builder'}</span>
          </button>

          <button
            onClick={() => setActiveTabMode('vault')}
            className={`pb-3 px-3 text-xs font-bold font-ethiopic border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTabMode === 'vault'
                ? 'border-[#D4A72C] text-[#08294F]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FolderLock className="w-3.5 h-3.5 text-[#D4A72C]" />
            <span>{language === 'am' ? 'የሰነድ ካዝና (Vault)' : 'Document Vault'}</span>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 bg-[#FBFBFE]">

          {/* If user already has a saved CV */}
          {currentUser?.cvFile && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-emerald-950 font-mono">
                      {currentUser.cvFile.name}
                    </span>
                    <span className="text-[10px] bg-emerald-200/60 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                      {language === 'am' ? 'ተጭኗል' : 'Active CV'}
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-700 font-ethiopic mt-0.5">
                    {language === 'am' ? 'ለአሠሪዎች ማመልከቻዎችን ሲልኩ ይህ CV በቀጥታ ይያያዛል።' : 'This CV is automatically attached when applying for jobs.'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRemoveExistingCV}
                className="p-2 rounded-xl text-red-600 hover:bg-red-100/60 transition-colors cursor-pointer"
                title="Remove CV"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Mode 1: File Upload */}
          {activeTabMode === 'upload' && (
            <div className="space-y-3">
              <div className="p-6 rounded-3xl border-2 border-dashed border-purple-200 hover:border-[#123B6D] bg-purple-50/20 hover:bg-purple-50/40 transition-all text-center">
                <input
                  type="file"
                  id="cv-file-input"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label 
                  htmlFor="cv-file-input"
                  className="cursor-pointer flex flex-col items-center justify-center space-y-2.5"
                >
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#123B6D] to-[#3B1C54] text-white flex items-center justify-center shadow-xs">
                    <Upload className="w-6 h-6 text-[#D4A72C]" />
                  </div>
                  <div className="font-ethiopic space-y-1">
                    <span className="text-sm font-bold text-[#123B6D] hover:underline block">
                      {language === 'am' ? '📄 የ CV ፋይልዎን እዚህ ይጫኑ (Click or Drag File)' : 'Choose or Drag CV / Resume file'}
                    </span>
                    <p className="text-xs text-slate-500">
                      PDF, DOCX, TXT (Max 10MB)
                    </p>
                  </div>
                </label>
              </div>

              {selectedFile && (
                <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs font-mono">
                  <span className="truncate max-w-xs">{selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                  <span className="text-emerald-600 font-bold flex items-center gap-1 font-ethiopic">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>ዝግጁ ነው</span>
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Mode 2: Paste Text */}
          {activeTabMode === 'paste' && (
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 font-ethiopic">
                {language === 'am' ? 'የሥራ ልምድዎን፣ ትምህርትዎንና ክህሎትዎን እዚህ ይለጥፉ፦' : 'Paste resume text here:'}
              </label>
              <textarea
                rows={6}
                value={cvText}
                onChange={(e) => setCvText(e.target.value)}
                placeholder={language === 'am' 
                  ? 'ምሳሌ፦ ስም፡ ዮሐንስ ተክሌ\nሙያ፡ ሲኒየር ሶፍትዌር ኢንጂነር (5 ዓመት ልምድ)\nክህሎት፡ React, Node.js, TypeScript, PostgreSQL...'
                  : 'Example: Senior Software Engineer with 5 years experience in React, TypeScript, Cloud...'}
                className="w-full p-3.5 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#123B6D]/20 font-ethiopic leading-relaxed"
              />
              <button
                type="button"
                onClick={handleManualParse}
                disabled={!cvText.trim() || isParsing}
                className="bg-[#123B6D] hover:bg-[#08294F] text-white px-4 py-2.5 rounded-xl text-xs font-bold font-ethiopic flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50 shadow-xs"
              >
                <Sparkles className="w-4 h-4 text-[#D4A72C]" />
                <span>{isParsing ? 'AI እየመረመረ ነው...' : (language === 'am' ? 'በ AI መርምርና መዝግብ' : 'Analyze & Save with AI')}</span>
              </button>
            </div>
          )}

          {/* Mode 3: Bilingual Structured CV Builder */}
          {activeTabMode === 'builder' && (
            <form onSubmit={handleSaveStructuredCV} className="space-y-4 font-ethiopic">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-[#08294F] flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-[#16845B]" />
                  <span>
                    {language === 'am'
                      ? 'የሁለት ቋንቋ (አማርኛ / እንግሊዝኛ) CV ገንቢ'
                      : 'Bilingual Structured Resume / CV Builder'}
                  </span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      {language === 'am' ? 'የሙያ መጠሪያ (Target Title) *' : 'Target Job Title *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={builderTitle}
                      onChange={(e) => setBuilderTitle(e.target.value)}
                      placeholder="e.g. Senior React Engineer / CPA Auditor"
                      className="w-full px-3 py-2 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      {language === 'am' ? 'የልምድ ዓመት' : 'Years Exp'}
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={50}
                      value={builderYears}
                      onChange={(e) => setBuilderYears(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      {language === 'am' ? 'አጭር መግለጫ (አማርኛ)' : 'Summary (Amharic)'}
                    </label>
                    <textarea
                      rows={2}
                      value={builderSummaryAm}
                      onChange={(e) => setBuilderSummaryAm(e.target.value)}
                      placeholder="የሥራ ልምድዎንና ብቃትዎን በአማርኛ..."
                      className="w-full px-3 py-2 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      {language === 'am' ? 'መግለጫ (English)' : 'Summary (English)'}
                    </label>
                    <textarea
                      rows={2}
                      value={builderSummaryEn}
                      onChange={(e) => setBuilderSummaryEn(e.target.value)}
                      placeholder="Concise career summary in English..."
                      className="w-full px-3 py-2 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      {language === 'am' ? 'ክህሎቶች (በኮማ ይለዩ)' : 'Key Skills (comma separated)'}
                    </label>
                    <input
                      type="text"
                      value={builderSkills}
                      onChange={(e) => setBuilderSkills(e.target.value)}
                      placeholder="Accounting, Auditing, ERP, MS Excel"
                      className="w-full px-3 py-2 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      {language === 'am' ? 'ቋንቋዎች' : 'Languages'}
                    </label>
                    <input
                      type="text"
                      value={builderLanguages}
                      onChange={(e) => setBuilderLanguages(e.target.value)}
                      placeholder="Amharic, English, Ge'ez"
                      className="w-full px-3 py-2 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Education Entries */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    {language === 'am' ? '🎓 ትምህርት (Education)' : '🎓 Education'}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setBuilderEduList((prev) => [...prev, { degree: '', institution: '', year: '' }])
                    }
                    className="text-[11px] font-bold text-[#123B6D] flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> Add
                  </button>
                </div>
                {builderEduList.map((ed, idx) => (
                  <div key={idx} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={ed.degree}
                      onChange={(e) =>
                        setBuilderEduList((prev) =>
                          prev.map((item, i) => (i === idx ? { ...item, degree: e.target.value } : item))
                        )
                      }
                      placeholder={language === 'am' ? 'ዲግሪ / ሰርተፊኬት' : 'Degree / Diploma'}
                      className="px-2.5 py-1.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs"
                    />
                    <input
                      type="text"
                      value={ed.institution}
                      onChange={(e) =>
                        setBuilderEduList((prev) =>
                          prev.map((item, i) =>
                            i === idx ? { ...item, institution: e.target.value } : item
                          )
                        )
                      }
                      placeholder={language === 'am' ? 'ዩኒቨርሲቲ / ተቋም' : 'Institution'}
                      className="px-2.5 py-1.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs"
                    />
                    <input
                      type="text"
                      value={ed.year}
                      onChange={(e) =>
                        setBuilderEduList((prev) =>
                          prev.map((item, i) => (i === idx ? { ...item, year: e.target.value } : item))
                        )
                      }
                      placeholder="Year (e.g. 2022)"
                      className="px-2.5 py-1.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                ))}
              </div>

              {/* Experience Entries */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    {language === 'am' ? '💼 የሥራ ልምድ (Work Experience)' : '💼 Work Experience'}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setBuilderExpList((prev) => [
                        ...prev,
                        { role: '', company: '', duration: '', highlights: '' },
                      ])
                    }
                    className="text-[11px] font-bold text-[#123B6D] flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> Add
                  </button>
                </div>
                {builderExpList.map((ex, idx) => (
                  <div key={idx} className="space-y-1.5 pb-2 border-b border-slate-100 last:border-0">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={ex.role}
                        onChange={(e) =>
                          setBuilderExpList((prev) =>
                            prev.map((item, i) => (i === idx ? { ...item, role: e.target.value } : item))
                          )
                        }
                        placeholder={language === 'am' ? 'የሥራ መደብ' : 'Role / Position'}
                        className="px-2.5 py-1.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs"
                      />
                      <input
                        type="text"
                        value={ex.company}
                        onChange={(e) =>
                          setBuilderExpList((prev) =>
                            prev.map((item, i) =>
                              i === idx ? { ...item, company: e.target.value } : item
                            )
                          )
                        }
                        placeholder={language === 'am' ? 'ድርጅት' : 'Company'}
                        className="px-2.5 py-1.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs"
                      />
                      <input
                        type="text"
                        value={ex.duration}
                        onChange={(e) =>
                          setBuilderExpList((prev) =>
                            prev.map((item, i) =>
                              i === idx ? { ...item, duration: e.target.value } : item
                            )
                          )
                        }
                        placeholder="2021 - 2025"
                        className="px-2.5 py-1.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs"
                      />
                    </div>
                    <input
                      type="text"
                      value={ex.highlights || ''}
                      onChange={(e) =>
                        setBuilderExpList((prev) =>
                          prev.map((item, i) =>
                            i === idx ? { ...item, highlights: e.target.value } : item
                          )
                        )
                      }
                      placeholder={language === 'am' ? 'ዋና ውጤቶች...' : 'Key achievements...'}
                      className="w-full px-2.5 py-1.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                ))}
              </div>

              <button
                type="submit"
                disabled={!builderTitle.trim()}
                className="w-full py-2.5 rounded-xl bg-[#16845B] hover:bg-[#126b4a] text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {language === 'am'
                    ? 'የሁለት ቋንቋ CV አዘጋጅና Firestore ላይ አስቀምጥ'
                    : 'Save Bilingual Structured CV to Profile'}
                </span>
              </button>
            </form>
          )}

          {/* Mode 4: Document Vault (Public/Private Certificates) */}
          {activeTabMode === 'vault' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-[#08294F] flex items-center gap-1.5">
                  <FolderLock className="w-4 h-4 text-[#D4A72C]" />
                  <span>{language === 'am' ? 'የምስክር ወረቀቶችና ፈቃዶች ማስቀመጫ (Public / Private)' : 'Store Certificates & Licenses'}</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    value={vaultDocTitle}
                    onChange={(e) => setVaultDocTitle(e.target.value)}
                    placeholder={language === 'am' ? 'የሰነድ ርእስ (ለምሳሌ BSc Degree)' : 'Document Title'}
                    className="px-3 py-2 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs"
                  />
                  <select
                    value={vaultDocType}
                    onChange={(e) => setVaultDocType(e.target.value as VaultDocument['docType'])}
                    className="px-3 py-2 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="certificate">Certificate / Degree</option>
                    <option value="license">Trade / Prof License</option>
                    <option value="recommendation">Parish Letter</option>
                    <option value="id">ID Card</option>
                  </select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <select
                    value={vaultVisibility}
                    onChange={(e) => setVaultVisibility(e.target.value as 'PUBLIC' | 'PRIVATE')}
                    className="px-3 py-2 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs font-bold"
                  >
                    <option value="PUBLIC">🌐 PUBLIC (Visible on profile)</option>
                    <option value="PRIVATE">🔒 PRIVATE (Admin/Self only)</option>
                  </select>
                  <input
                    type="text"
                    value={vaultDocRef}
                    onChange={(e) => setVaultDocRef(e.target.value)}
                    placeholder="Document URL or License #"
                    className="px-3 py-2 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddVaultDoc}
                  disabled={!vaultDocTitle.trim() || !currentUser}
                  className="px-4 py-2 rounded-xl bg-[#123B6D] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                >
                  <Plus className="w-3.5 h-3.5 text-[#D4A72C]" />
                  <span>{language === 'am' ? 'ወደ ካዝና አስቀምጥ' : 'Save to Document Vault'}</span>
                </button>
              </div>

              <div className="space-y-2">
                {(currentUser?.vaultDocuments || []).map((docItem) => (
                  <div key={docItem.id} className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 truncate">{docItem.title}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold inline-flex items-center gap-1 ${
                          docItem.visibility === 'PUBLIC' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-800'
                        }`}>
                          {docItem.visibility === 'PUBLIC' ? <Globe className="w-2.5 h-2.5" /> : <FolderLock className="w-2.5 h-2.5" />}
                          {docItem.visibility}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">{docItem.urlOrContent}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveVaultDoc(docItem.id)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Parsing Spinner */}
          {isParsing && (
            <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 flex items-center gap-3 text-xs text-purple-900 font-ethiopic">
              <RefreshCw className="w-4 h-4 text-purple-700 animate-spin" />
              <span>{language === 'am' ? 'የ AI ረዳቱ ክህሎቶችዎንና ልምድዎን እያወጣ ነው...' : 'AI is extracting skills, career title, and experience...'}</span>
            </div>
          )}

          {/* Parsed Results Box */}
          {parsedResult && (
            <div className="p-5 rounded-2xl bg-white border border-purple-200/90 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#123B6D]" />
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 font-ethiopic">
                    {language === 'am' ? 'የተተነተነ የሙያ መገለጫ (Extracted Profile)' : 'Extracted Career Profile'}
                  </h4>
                </div>
                <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 font-ethiopic">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{parsedResult.experienceYears} {language === 'am' ? 'ዓመት ልምድ' : 'Years Exp'}</span>
                </span>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  {language === 'am' ? 'የሙያ አርእስት (Suggested Title)' : 'Suggested Title'}
                </span>
                <p className="text-sm font-bold text-[#123B6D] font-ethiopic">
                  {parsedResult.suggestedTitle}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5 font-ethiopic">
                  {language === 'am' ? 'የተለዩ ክህሎቶች (Extracted Skills)' : 'Identified Skills'}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {parsedResult.extractedSkills.map((skill, idx) => (
                    <span 
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-purple-50 text-[#3B1C54] text-xs font-semibold border border-purple-200 font-mono"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1 font-ethiopic">
                  {language === 'am' ? 'የግል መግለጫ (Bio Summary)' : 'Professional Summary'}
                </span>
                <p className="text-xs text-slate-700 font-ethiopic leading-relaxed bg-[#F8FAFC] p-3 rounded-xl border border-slate-100">
                  {language === 'am' ? parsedResult.suggestedBioAm : parsedResult.suggestedBio}
                </p>
              </div>
            </div>
          )}

          {saveSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-900 font-ethiopic flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{language === 'am' ? 'CV ዎ እና የክህሎት መረጃዎ በተሳካ ሁኔታ ተቀምጧል! አሁን በቀላሉ ለሥራዎች ማመልከት ይችላሉ።' : 'CV saved successfully! You are now ready to apply to jobs.'}</span>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            onClick={() => {
              closeModal();
              setActiveTab('jobs');
            }}
            className="text-xs text-[#123B6D] hover:underline font-bold font-ethiopic flex items-center gap-1 cursor-pointer"
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>{language === 'am' ? 'ክፍት የሥራ ቦታዎችን ተመልከት' : 'Browse Available Jobs'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={closeModal}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#123B6D] to-[#3B1C54] text-white text-xs font-bold font-ethiopic hover:opacity-95 transition-all cursor-pointer shadow-xs"
          >
            {language === 'am' ? 'ተጠናቋል (Done)' : 'Done'}
          </button>
        </div>

      </div>
    </div>
  );
};
