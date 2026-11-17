/**
 * Centralized AI Service Layer for Orthodoxy & Economy platform
 * Calls server-side proxy endpoints to protect API keys and ensure fast performance.
 */

import { Language } from '../types';

export interface AIJobImprovement {
  title: string;
  amharicTitle: string;
  category: string;
  skills: string[];
  description: string;
  descriptionAm: string;
  responsibilities?: string[];
  requirements?: string[];
}

export interface AIProductImprovement {
  title: string;
  amharicTitle: string;
  category: string;
  condition: 'new' | 'handcrafted' | 'used';
  description: string;
  descriptionAm: string;
  keywords: string[];
}

export interface AISemanticSearch {
  intent: 'find_job' | 'find_product' | 'find_service' | 'find_business' | 'find_professional' | 'general';
  extractedCategory: string | null;
  extractedLocation: string | null;
  maxBudget: number | null;
  skills: string[];
  isWholesale: boolean;
  isRemote: boolean;
  cleanKeywords: string;
}

export interface AIMatchResult {
  score: number;
  matchGrade: string;
  matchedSkills: string[];
  missingSkills: string[];
  strengths: string[];
  gaps: string[];
  explanation: string;
}

export interface AISocialContent {
  headline: string;
  postCopy: string;
  hashtags: string[];
  callToAction: string;
  telegramFormatted?: string;
}

export interface AIVideoScene {
  time: string;
  startTime: number;
  endTime: number;
  visual: string;
  themeStyle?: 'orthodox_heritage' | 'sacred_artisan' | 'modern_business' | 'community_trust';
  imageUrl?: string;
  voiceoverAm: string;
  voiceoverEn: string;
  onScreenTextAm: string;
  onScreenTextEn: string;
  voiceover?: string;
  onScreenText?: string;
}

export interface AIVideoStoryboard {
  videoConcept: string;
  videoConceptEn?: string;
  hook: string;
  hookEn?: string;
  caption: string;
  captionEn?: string;
  duration: number;
  scenes: AIVideoScene[];
  audioRecommendation: string;
  audioTrack?: 'begena_masenko' | 'sacred_ambient' | 'modern_corporate';
}

export const aiService = {
  /**
   * Improves rough job descriptions into a professional bilingual listing.
   */
  async improveJob(roughText: string, language: Language = 'am'): Promise<AIJobImprovement> {
    const res = await fetch('/api/ai/improve-job', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roughText, language }),
    });
    if (!res.ok) throw new Error('AI Job improvement failed');
    return res.json();
  },

  /**
   * Improves rough product descriptions with tags, categories and clean copy.
   */
  async improveProduct(roughText: string): Promise<AIProductImprovement> {
    const res = await fetch('/api/ai/improve-product', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roughText }),
    });
    if (!res.ok) throw new Error('AI Product improvement failed');
    return res.json();
  },

  /**
   * Parses natural language search in Amharic, English or mixed.
   */
  async semanticSearch(query: string): Promise<AISemanticSearch> {
    const res = await fetch('/api/ai/semantic-search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    if (!res.ok) throw new Error('Semantic search failed');
    return res.json();
  },

  /**
   * Calculates explainable candidate-job match score and gap analysis.
   */
  async calculateMatch(job: any, profile: any): Promise<AIMatchResult> {
    const res = await fetch('/api/ai/match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ job, profile }),
    });
    if (!res.ok) throw new Error('Match calculation failed');
    return res.json();
  },

  /**
   * Generates promotional social media copy for Telegram, TikTok, Instagram, Facebook, LinkedIn.
   */
  async generateSocialContent(
    listing: any, 
    platform: string = 'telegram', 
    tone: string = 'professional', 
    language: Language = 'am'
  ): Promise<AISocialContent> {
    const res = await fetch('/api/ai/content-studio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listing, platform, tone, language }),
    });
    if (!res.ok) throw new Error('Social content generation failed');
    return res.json();
  },

  /**
   * Generates TikTok / Reels / Shorts 60s professional video screenplay with scenes, voiceover, and visuals.
   */
  async generateVideoStoryboard(
    listingOrPrompt: any, 
    duration: number = 60, 
    language: Language = 'am',
    customPrompt?: string
  ): Promise<AIVideoStoryboard> {
    const isCustom = typeof listingOrPrompt === 'string' || !!customPrompt;
    const body = isCustom
      ? { customPrompt: typeof listingOrPrompt === 'string' ? listingOrPrompt : customPrompt, duration, language }
      : { listing: listingOrPrompt, duration, language };

    const res = await fetch('/api/ai/video-script', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error('Video storyboard generation failed');
    return res.json();
  },

  /**
   * Chat with "የመድረኩ AI ረዳት" platform assistant.
   */
  async chatAssistant(
    message: string, 
    platformContext?: any, 
    language: Language = 'am',
    conversationHistory?: Array<{ sender: 'ai' | 'user'; text: string }>
  ): Promise<{ reply: string }> {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, platformContext, language, conversationHistory }),
    });
    if (!res.ok) throw new Error('AI Chat assistant failed');
    return res.json();
  },

  /**
   * Real-time streaming chat with "የመድረኩ AI ረዳት" via SSE.
   */
  async chatAssistantStream(
    message: string,
    platformContext: any,
    language: Language = 'am',
    conversationHistory: Array<{ sender: 'ai' | 'user'; text: string }>,
    onChunk: (fullText: string) => void,
    signal?: AbortSignal
  ): Promise<string> {
    const res = await fetch('/api/ai/chat/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, platformContext, language, conversationHistory }),
      signal,
    });

    if (!res.ok || !res.body) {
      const fallback = await this.chatAssistant(message, platformContext, language, conversationHistory);
      onChunk(fallback.reply);
      return fallback.reply;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    let accumulated = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const parts = buffer.split('\n\n');
      buffer = parts.pop() || '';

      for (const part of parts) {
        const line = part.trim();
        if (!line.startsWith('data:')) continue;
        try {
          const payload = JSON.parse(line.slice(5).trim());
          if (payload.chunk) {
            accumulated += payload.chunk;
            onChunk(accumulated);
          }
        } catch {
          // Ignore malformed SSE fragment
        }
      }
    }

    if (!accumulated.trim()) {
      const fallback = await this.chatAssistant(message, platformContext, language, conversationHistory);
      onChunk(fallback.reply);
      return fallback.reply;
    }

    return accumulated;
  },

  /**
   * Parses CV / Resume text and extracts skills and professional summary.
   */
  async parseCV(cvText: string): Promise<{
    extractedSkills: string[];
    suggestedTitle: string;
    suggestedBio: string;
    suggestedBioAm: string;
    experienceYears: number;
  }> {
    const res = await fetch('/api/ai/parse-cv', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cvText }),
    });
    if (!res.ok) throw new Error('CV parser failed');
    return res.json();
  },

  /**
   * Queries the Orthodox Knowledge & RAG engine with strict citations
   */
  async askOrthodoxRAG(query: string, mode: string = 'orthodox_knowledge', maxAuthorityLevel: number = 4, language: Language = 'am'): Promise<{
    answer: string;
    answerAm: string;
    summaryPoints?: string[];
    canonicalReference?: string;
    sources: Array<{
      id: string;
      title: string;
      titleAm: string;
      sourceName: string;
      citation: string;
      authorityLevel: number;
      excerptAm: string;
    }>;
    mode: string;
    hasSufficientSources: boolean;
    cached?: boolean;
  }> {
    const res = await fetch('/api/ai/orthodox-rag', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, mode, maxAuthorityLevel, language }),
    });
    if (!res.ok) throw new Error('Orthodox RAG query failed');
    return res.json();
  },

  /**
   * Real-time streaming Orthodox Knowledge RAG with prompt caching and instant citations.
   */
  async askOrthodoxRAGStream(
    query: string,
    mode: string = 'orthodox_knowledge',
    maxAuthorityLevel: number = 4,
    language: Language = 'am',
    callbacks: {
      onMeta?: (meta: {
        sources: Array<{
          id: string;
          title: string;
          titleAm: string;
          sourceName: string;
          citation: string;
          authorityLevel: number;
          excerptAm: string;
        }>;
        canonicalReference?: string;
        summaryPoints?: string[];
        mode: string;
        hasSufficientSources: boolean;
        cached?: boolean;
      }) => void;
      onChunk: (fullText: string) => void;
      onDone?: (meta: { cached?: boolean; latencyMs?: number; summaryPoints?: string[]; canonicalReference?: string }) => void;
      signal?: AbortSignal;
    }
  ): Promise<void> {
    const res = await fetch('/api/ai/orthodox-rag/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, mode, maxAuthorityLevel, language }),
      signal: callbacks.signal,
    });

    if (!res.ok || !res.body) {
      const fallback = await this.askOrthodoxRAG(query, mode, maxAuthorityLevel, language);
      callbacks.onMeta?.(fallback);
      callbacks.onChunk(language === 'am' ? fallback.answerAm : fallback.answer);
      callbacks.onDone?.({ cached: fallback.cached, summaryPoints: fallback.summaryPoints, canonicalReference: fallback.canonicalReference });
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    let accumulated = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const parts = buffer.split('\n\n');
      buffer = parts.pop() || '';

      for (const part of parts) {
        const line = part.trim();
        if (!line.startsWith('data:')) continue;
        try {
          const payload = JSON.parse(line.slice(5).trim());
          if (payload.meta) {
            callbacks.onMeta?.(payload.meta);
          }
          if (payload.chunk) {
            accumulated += payload.chunk;
            callbacks.onChunk(accumulated);
          }
          if (payload.done) {
            callbacks.onDone?.(payload);
          }
        } catch {
          // Ignore malformed SSE fragment
        }
      }
    }

    if (!accumulated.trim()) {
      const fallback = await this.askOrthodoxRAG(query, mode, maxAuthorityLevel, language);
      callbacks.onMeta?.(fallback);
      callbacks.onChunk(language === 'am' ? fallback.answerAm : fallback.answer);
      callbacks.onDone?.({ cached: fallback.cached, summaryPoints: fallback.summaryPoints, canonicalReference: fallback.canonicalReference });
    }
  },

  /**
   * Analyzes uploaded document files (summarize, study guide, quiz, turn to social)
   */
  async analyzeDocumentFile(text: string, fileName: string = 'document.txt', action: string = 'summarize', language: Language = 'am'): Promise<{
    summary: string;
    summaryAm: string;
    keyPoints: string[];
    quizQuestions?: Array<{
      question: string;
      options: string[];
      correctIndex: number;
      explanation: string;
    }>;
    telegramPost?: string;
    socialHook?: string;
    studyNotes?: string[];
  }> {
    const res = await fetch('/api/ai/analyze-file', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, fileName, action, language }),
    });
    if (!res.ok) throw new Error('Document analysis failed');
    return res.json();
  }
};
