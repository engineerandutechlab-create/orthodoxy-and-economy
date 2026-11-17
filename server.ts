import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { ORTHODOX_KNOWLEDGE_BASE } from './src/data/orthodoxKnowledge.ts';

dotenv.config();
process.env.DISABLE_HMR = 'true';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Gemini SDK with server-side API Key
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
if (!process.env.GEMINI_API_KEY) {
  process.env.GEMINI_API_KEY = GEMINI_API_KEY;
}

const AI_MODEL = 'gemini-4-hydrogen';

// ============================================================================
// AMHARIC GE'EZ HOMOPHONE NORMALIZATION & BOUNDED LRU+TTL PROMPT CACHE
// ============================================================================
const normalizeAmharicForSearch = (input: string): string => {
  if (!input) return '';
  let s = input
    .toLowerCase()
    .replace(/[?!.,;:'"«»()\[\]{}።፣፤፥፦፡]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Fold Amharic homophone families ONLY for retrieval & cache key matching
  const replacements: Array<[RegExp, string]> = [
    [/[ሐኀ]/g, 'ሀ'],
    [/[ሑኁ]/g, 'ሁ'],
    [/[ሒኂ]/g, 'ሂ'],
    [/[ሓኃሃ]/g, 'ሀ'],
    [/[ሔኄ]/g, 'ሄ'],
    [/[ሕኅ]/g, 'ህ'],
    [/[ሖኆ]/g, 'ሆ'],
    [/ሠ/g, 'ሰ'],
    [/ሡ/g, 'ሱ'],
    [/ሢ/g, 'ሲ'],
    [/ሣ/g, 'ሳ'],
    [/ሤ/g, 'ሴ'],
    [/ሥ/g, 'ስ'],
    [/ሦ/g, 'ሶ'],
    [/[ዐዓ]/g, 'አ'],
    [/ዑ/g, 'ኡ'],
    [/ዒ/g, 'ኢ'],
    [/ዔ/g, 'ኤ'],
    [/ዕ/g, 'እ'],
    [/ዖ/g, 'ኦ'],
    [/ፀ/g, 'ጸ'],
    [/ፁ/g, 'ጹ'],
    [/ፂ/g, 'ጺ'],
    [/ፃ/g, 'ጻ'],
    [/ፄ/g, 'ጼ'],
    [/ፅ/g, 'ጽ'],
    [/ፆ/g, 'ጾ'],
  ];

  for (const [pattern, target] of replacements) {
    s = s.replace(pattern, target);
  }
  return s;
};

interface CacheRecord<T> {
  value: T;
  expiresAt: number;
  createdAt: number;
}

class PromptCache<T> {
  private store = new Map<string, CacheRecord<T>>();
  private hits = 0;
  private misses = 0;
  private readonly maxEntries: number;
  private readonly ttlMs: number;

  constructor(maxEntries = 250, ttlMs = 6 * 60 * 60 * 1000) {
    this.maxEntries = maxEntries;
    this.ttlMs = ttlMs;
  }

  get(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) {
      this.misses++;
      return null;
    }
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      this.misses++;
      return null;
    }
    // Refresh LRU order
    this.store.delete(key);
    this.store.set(key, entry);
    this.hits++;
    return entry.value;
  }

  set(key: string, value: T): void {
    if (this.store.has(key)) {
      this.store.delete(key);
    } else if (this.store.size >= this.maxEntries) {
      const oldestKey = this.store.keys().next().value;
      if (oldestKey !== undefined) {
        this.store.delete(oldestKey);
      }
    }
    const now = Date.now();
    this.store.set(key, {
      value,
      createdAt: now,
      expiresAt: now + this.ttlMs,
    });
  }

  getStats() {
    return {
      size: this.store.size,
      maxEntries: this.maxEntries,
      hits: this.hits,
      misses: this.misses,
      hitRate: this.hits + this.misses > 0 ? Number((this.hits / (this.hits + this.misses)).toFixed(3)) : 0,
    };
  }
}

interface CachedOrthodoxRagResult {
  answer: string;
  answerAm: string;
  summaryPoints: string[];
  canonicalReference: string;
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
}

const orthodoxRagCache = new PromptCache<CachedOrthodoxRagResult>(300, 6 * 60 * 60 * 1000);
const orthodoxChatCache = new PromptCache<string>(300, 3 * 60 * 60 * 1000);

// Pre-index Orthodox Knowledge Base once at startup for sub-millisecond retrieval
const INDEXED_ORTHODOX_DOCS = ORTHODOX_KNOWLEDGE_BASE.map((doc) => ({
  doc,
  searchableNorm: normalizeAmharicForSearch(
    `${doc.title} ${doc.titleAm} ${doc.sourceName} ${doc.citation} ${doc.excerpt} ${doc.excerptAm} ${doc.tags.join(' ')}`
  ),
}));

const STOP_WORDS = new Set([
  'ስለ', 'ምን', 'ነው', 'ናቸው', 'ነች', 'እና', 'ወይም', 'እንዴት', 'ለምን', 'የት', 'መቼ', 'ማን',
  'ውስጥ', 'ላይ', 'ጋር', 'በኩል', 'ይላል', 'ይደነግጋል', 'አለ', 'አሉ', 'አለው', 'እባክህ', 'እባክዎ',
  'the', 'is', 'are', 'was', 'were', 'what', 'how', 'why', 'where', 'when', 'who',
  'about', 'and', 'or', 'for', 'with', 'from', 'in', 'on', 'of', 'to', 'a', 'an', 'does', 'do'
]);

const retrieveOrthodoxDocs = (query: string, maxAuthorityLevel: number) => {
  const normQuery = normalizeAmharicForSearch(query);
  const rawTokens = normQuery.split(' ').filter((tok) => tok.length >= 2);
  const meaningfulTokens = rawTokens.filter((tok) => !STOP_WORDS.has(tok));
  const queryTokens = meaningfulTokens.length > 0 ? meaningfulTokens : rawTokens;
  if (queryTokens.length === 0) return [];

  const scored = INDEXED_ORTHODOX_DOCS
    .filter(({ doc }) => doc.authorityLevel <= maxAuthorityLevel)
    .map(({ doc, searchableNorm }) => {
      const normTags = normalizeAmharicForSearch(doc.tags.join(' '));
      const normTitle = normalizeAmharicForSearch(`${doc.title} ${doc.titleAm}`);
      let score = 0;
      let matchedTokens = 0;
      for (const tok of queryTokens) {
        if (searchableNorm.includes(tok)) {
          matchedTokens += 1;
          score += 1;
          if (normTags.includes(tok)) score += 2;
          if (normTitle.includes(tok)) score += 2;
        }
      }
      return { doc, score, matchedTokens };
    })
    .filter((item) => item.matchedTokens > 0)
    .sort((a, b) => b.score - a.score || a.doc.authorityLevel - b.doc.authorityLevel);

  if (scored.length === 0) return [];
  const topScore = scored[0].score;
  // Keep only strong, directly relevant documents so unrelated topics don't pollute answers
  return scored
    .filter((item) => item.score >= Math.max(2, Math.floor(topScore * 0.5)))
    .slice(0, 3)
    .map((item) => item.doc);
};

const isOrthodoxOrFaqQuery = (text: string): boolean => {
  const norm = normalizeAmharicForSearch(text);
  return /ኦርቶዶክስ|ተዋህዶ|መጽሀፍ ቅዱስ|ፍትሀ ነገስት|ባህረ ሀሳብ|ቀኖና|ጾም|አጽዋማት|ሀይማኖት|ስለ ንግድ|ሚዛን|ደመወዝ|ማህበረሰብ|ስልክ|ቴሌግራም|አድራሻ|orthodox|tewahedo|canon|fetha|bible|fasting|bahre|contact|telegram|verify|badge/.test(norm);
};

// Immutable prefix placed at the start of prompts for Gemini implicit prefix caching
const STATIC_ORTHODOX_SYSTEM_PREFIX = `You are the authoritative Ethiopian Orthodox Tewahedo Knowledge Assistant for ORTHODOXY & ECONOMY (የኦርቶዶክሳውያን የሥራና የንግድ ትስስር መድረክ).
Strict Rules:
1. Answer using ONLY the provided approved Church sources below. Never fabricate Bible verses, canons, or teachings.
2. Obey classical Ge'ez Amharic orthography strictly (ማኅበረሰብ, ሕዝብ, ዓለም, ፀሐይ, ኃይል, ሠራተኛ, ሥራ, ፍትሐዊ).
3. Keep answers clear, reverent, concise, and cleanly formatted without heavy Markdown dividers (---) or ### headers.`;

let genAI: GoogleGenAI | null = null;
try {
  genAI = new GoogleGenAI({
    apiKey: GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
} catch (err) {
  console.log('Google GenAI initialization notice:', err);
}

async function withTimeout<T>(promise: Promise<T>, ms = 9500): Promise<T | null> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<null>((resolve) => {
        timer = setTimeout(() => resolve(null), ms);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function parseGeminiJson<T>(rawText: string | undefined | null): T | null {
  if (!rawText) return null;
  let cleaned = rawText.trim();
  const fenceMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch && fenceMatch[1]) {
    cleaned = fenceMatch[1].trim();
  }
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      try {
        return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1)) as T;
      } catch {
        return null;
      }
    }
    return null;
  }
}

async function startServer() {
  const app = express();
  const distPath = path.resolve(__dirname, 'dist');
  const hasDist = fs.existsSync(path.resolve(distPath, 'index.html'));
  const isRunningWithTsx = process.execArgv.some((arg) => arg.includes('tsx'));
  const portArgIdx = process.argv.indexOf('--port');
  const cliPort = portArgIdx !== -1 ? Number(process.argv[portArgIdx + 1]) : NaN;
  const PORT = Number(process.env.PORT) || (Number.isFinite(cliPort) && cliPort > 0 ? cliPort : 3000);
  const isProd =
    process.env.NODE_ENV === 'production' ||
    (hasDist && !isRunningWithTsx && process.env.NODE_ENV !== 'development');

  app.use(express.json({ limit: '5mb' }));

  // Health endpoint
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      platform: 'Orthodoxy and Economy',
      aiConfigured: Boolean(process.env.GEMINI_API_KEY),
      aiCache: {
        orthodoxRag: orthodoxRagCache.getStats(),
        orthodoxChat: orthodoxChatCache.getStats(),
      },
      timestamp: new Date().toISOString(),
    });
  });

  // 1. AI JOB POST IMPROVER
  app.post('/api/ai/improve-job', async (req, res) => {
    const { roughText, language = 'am' } = req.body;
    if (!roughText) {
      return res.status(400).json({ error: 'roughText is required' });
    }

    try {
      if (genAI && process.env.GEMINI_API_KEY) {
        const response = await withTimeout(
          genAI.models.generateContent({
            model: AI_MODEL,
            contents: `Analyze and transform this rough job description for an Ethiopian Orthodox employment platform into a professional job listing.
Do NOT invent salary, benefits, company claims, or nonexistent requirements. Extract skills and structure accurately.
Input: "${roughText}"`,
            config: {
              thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
              responseMimeType: 'application/json',
              systemInstruction: `You are an AI Job Assistant for an Ethiopian platform. Output valid JSON with these keys:
{
  "title": "Clear English Title",
  "amharicTitle": "የሥራው አርእስት በአማርኛ",
  "category": "Technology & Software" | "Translation & Academic" | "Craftsmanship & Construction" | "Finance & Accounting" | "Marketing & Sales" | "General Services",
  "skills": ["Skill1", "Skill2", "Skill3"],
  "description": "Structured English summary",
  "descriptionAm": "ዝርዝር መግለጫ በአማርኛ",
  "responsibilities": ["Resp 1", "Resp 2"],
  "requirements": ["Req 1", "Req 2"]
}`
            }
          }),
          9500
        );

        const parsed = parseGeminiJson<Record<string, unknown>>(response?.text);
        if (parsed) {
          return res.json(parsed);
        }
      }
    } catch (e) {
      console.log('Gemini job improver notice, using template');
    }

    // Heuristic Fallback
    const words = roughText.trim();
    const isTech = /react|node|developer|software|code|python|network|tech|web|app/i.test(words);
    const isFinance = /account|audit|tax|finance|peachtree|ifrs|money|cash/i.test(words);
    const isCraft = /wood|carv|carpenter|build|construct|stone|mason/i.test(words);
    const isTranslate = /ge'ez|gomez|translate|church|manuscript|liturgy/i.test(words);

    let category = 'General Services';
    let skills = ['Professional Execution', 'Communication', 'Attention to Detail'];
    if (isTech) {
      category = 'Technology & Software';
      skills = ['Software Engineering', 'Technical Architecture', 'Problem Solving'];
    } else if (isFinance) {
      category = 'Finance & Accounting';
      skills = ['Tax Regulations', 'Financial Reporting', 'Peachtree / Excel'];
    } else if (isCraft) {
      category = 'Craftsmanship & Construction';
      skills = ['Fine Carpentry', 'Joinery', 'Material Selection'];
    } else if (isTranslate) {
      category = 'Translation & Academic';
      skills = ["Ge'ez Literacy", 'Liturgical Review', 'Amharic Translation'];
    }

    return res.json({
      title: words.split('\n')[0].slice(0, 70) || 'Qualified Professional Opportunity',
      amharicTitle: 'ክፍት የሥራ ቦታ - ' + (words.split('\n')[0].slice(0, 50) || 'ተፈላጊ ባለሙያ'),
      category,
      skills,
      description: words,
      descriptionAm: words,
      responsibilities: ['Execute assigned tasks diligently according to professional standards.', 'Collaborate with team members with integrity and respect.'],
      requirements: ['Demonstrated experience in the designated field.', 'Commitment to ethical workmanship.']
    });
  });

  // 2. AI PRODUCT POST IMPROVER
  app.post('/api/ai/improve-product', async (req, res) => {
    const { roughText } = req.body;
    if (!roughText) return res.status(400).json({ error: 'roughText is required' });

    try {
      if (genAI && process.env.GEMINI_API_KEY) {
        const response = await withTimeout(
          genAI.models.generateContent({
            model: AI_MODEL,
            contents: `Analyze this marketplace product draft for an Ethiopian Orthodox marketplace.
Do NOT invent false price, false quantity, or false specifications.
Input: "${roughText}"`,
            config: {
              thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
              responseMimeType: 'application/json',
              systemInstruction: `Output valid JSON with keys:
{
  "title": "Product Title (English)",
  "amharicTitle": "የምርት ስም (አማርኛ)",
  "category": "Liturgical & Cultural Goods" | "Textiles & Apparel" | "Wholesale & Raw Materials" | "Machinery & Tools" | "Agriculture & Food Products",
  "condition": "new" | "handcrafted" | "used",
  "description": "Engaging accurate description",
  "descriptionAm": "የተሟላ መግለጫ በአማርኛ",
  "keywords": ["tag1", "tag2"]
}`
            }
          }),
          9500
        );
        const parsed = parseGeminiJson<Record<string, unknown>>(response?.text);
        if (parsed) return res.json(parsed);
      }
    } catch (e) {
      console.log('Gemini product improver notice, using template');
    }

    return res.json({
      title: roughText.split('\n')[0].slice(0, 60),
      amharicTitle: roughText.split('\n')[0].slice(0, 60),
      category: 'Liturgical & Cultural Goods',
      condition: 'handcrafted',
      description: roughText,
      descriptionAm: roughText,
      keywords: ['Quality', 'Authentic', 'Ethiopia']
    });
  });

  // 3. AI SEMANTIC SEARCH PARSER
  app.post('/api/ai/semantic-search', async (req, res) => {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: 'query is required' });

    try {
      if (genAI && process.env.GEMINI_API_KEY) {
        const response = await withTimeout(
          genAI.models.generateContent({
            model: AI_MODEL,
            contents: `Extract search parameters from natural language user query in Amharic, English, or mixed.
Query: "${query}"`,
            config: {
              thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
              responseMimeType: 'application/json',
              systemInstruction: `Extract intent into JSON:
{
  "intent": "find_job" | "find_product" | "find_service" | "find_business" | "find_professional" | "general",
  "extractedCategory": string or null,
  "extractedLocation": string or null,
  "maxBudget": number or null,
  "skills": string[],
  "isWholesale": boolean,
  "isRemote": boolean,
  "cleanKeywords": string
}`
            }
          }),
          9500
        );
        const parsed = parseGeminiJson<Record<string, unknown>>(response?.text);
        if (parsed) return res.json(parsed);
      }
    } catch (e) {
      console.log('Gemini semantic search notice, using template');
    }

    // Fast heuristic NLP
    const lower = query.toLowerCase();
    const isJob = /ስራ|ሥራ|job|vacancy|developer|engineer|accountant|carpenter/i.test(lower);
    const isProduct = /ምርት|ገበያ|ዕቃ|ጧፍ|ሰም|ዕጣን|ሻጭ|product|candle|incense|buy|sell/i.test(lower);
    const isWholesale = /ጅምላ|አስመጪ|bulk|wholesale|moq|b2b/i.test(lower);
    const isRemote = /የርቀት|remote|online/i.test(lower);

    // Extract numbers if budget mentioned
    const numMatch = query.match(/(\d+[\d,]*)/);
    const maxBudget = numMatch ? Number(numMatch[1].replace(/,/g, '')) : null;

    let loc = null;
    if (/አዲስ አበባ|addis/i.test(lower)) loc = 'Addis Ababa';
    if (/ባሕር ዳር|bahir dar/i.test(lower)) loc = 'Bahir Dar';
    if (/ጎንደር|gondar/i.test(lower)) loc = 'Gondar';
    if (/ሐዋሳ|hawassa/i.test(lower)) loc = 'Hawassa';

    return res.json({
      intent: isJob ? 'find_job' : isProduct ? 'find_product' : 'general',
      extractedCategory: null,
      extractedLocation: loc,
      maxBudget,
      skills: [],
      isWholesale,
      isRemote,
      cleanKeywords: query.replace(/እፈልጋለሁ|የሚሆን|የ|want|need|looking for/gi, '').trim()
    });
  });

  // 4. AI EXPLAINABLE MATCH CALCULATOR
  app.post('/api/ai/match', async (req, res) => {
    const { job, profile } = req.body;
    if (!job || !profile) {
      return res.status(400).json({ error: 'job and profile are required' });
    }

    try {
      if (genAI && process.env.GEMINI_API_KEY) {
        const response = await withTimeout(
          genAI.models.generateContent({
            model: AI_MODEL,
            contents: `Calculate an explainable candidate-job match score.
Job: ${JSON.stringify({ title: job.title, skills: job.skillsRequired, location: job.location, isRemote: job.isRemote, category: job.category })}
Profile: ${JSON.stringify({ fullName: profile.fullName, profession: profile.profession, skills: profile.skills, location: profile.location })}`,
            config: {
              thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
              responseMimeType: 'application/json',
              systemInstruction: `Calculate realistic match. Output JSON:
{
  "score": number (0-100),
  "matchGrade": "Exceptional Match" | "Strong Match" | "Moderate Match" | "Low Match",
  "matchedSkills": string[],
  "missingSkills": string[],
  "strengths": string[],
  "gaps": string[],
  "explanation": "1-2 concise sentences explaining why"
}`
            }
          }),
          9500
        );
        const parsed = parseGeminiJson<Record<string, unknown>>(response?.text);
        if (parsed) return res.json(parsed);
      }
    } catch (e) {
      console.log('Gemini match notice, using template');
    }

    // Defensible mathematical calculation
    const jobSkills = (job.skillsRequired || []).map((s: string) => s.toLowerCase());
    const userSkills = (profile.skills || []).map((s: string) => s.toLowerCase());

    const matched = jobSkills.filter((js: string) => 
      userSkills.some((us: string) => us.includes(js) || js.includes(us))
    );
    const missing = jobSkills.filter((js: string) => !matched.includes(js));

    const skillScore = jobSkills.length > 0 ? (matched.length / jobSkills.length) * 60 : 30;
    const locMatch = (job.isRemote || (job.location && profile.location && job.location.toLowerCase().includes(profile.location.toLowerCase().split(' ')[0]))) ? 25 : 10;
    const roleMatch = (job.category && profile.profession && profile.profession.toLowerCase().includes(job.category.toLowerCase().split(' ')[0])) ? 15 : 5;

    const finalScore = Math.min(98, Math.max(35, Math.round(skillScore + locMatch + roleMatch)));
    const matchGrade = finalScore >= 85 ? 'Exceptional Match' : finalScore >= 70 ? 'Strong Match' : 'Moderate Match';

    return res.json({
      score: finalScore,
      matchGrade,
      matchedSkills: matched.length > 0 ? matched : ['Core Competencies'],
      missingSkills: missing,
      strengths: [`Alignment in ${matched.length} primary technical skills`, locMatch > 15 ? 'Compatible location / Remote work modality' : 'Industry domain background'],
      gaps: missing.length > 0 ? [`Explicit listing requests ${missing.slice(0, 2).join(', ')}`] : [],
      explanation: `Calculated from your listed skills (${profile.skills?.slice(0, 3).join(', ')}) matched against the job requirements.`
    });
  });

  // 5. AI CONTENT STUDIO (Social Copy Generator for Telegram, TikTok, Instagram, LinkedIn)
  app.post('/api/ai/content-studio', async (req, res) => {
    const { listing, platform = 'telegram', tone = 'professional', language = 'am' } = req.body;
    if (!listing) return res.status(400).json({ error: 'listing is required' });

    try {
      if (genAI && process.env.GEMINI_API_KEY) {
        const response = await withTimeout(
          genAI.models.generateContent({
            model: AI_MODEL,
            contents: `Create social media marketing copy for an Ethiopian Orthodox platform user.
Platform: ${platform}
Tone: ${tone}
Target Language: ${language}
Listing Data: ${JSON.stringify(listing)}
Brand Slogan: "ንቁ፣ ብቁና ታታሪ ኦርቶዶክስ ዘመኑን ለዋጀ አገልግሎት!"
Official Phone: +251 922 901 083
Official Telegram: @orthodoxy_economy
Do NOT invent prices or contacts that contradict listing data.`,
            config: {
              thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
              responseMimeType: 'application/json',
              systemInstruction: `Output JSON:
{
  "headline": "Short punchy headline",
  "postCopy": "Full formatted text with emojis, bullet points, and CTA",
  "hashtags": ["#tag1", "#tag2"],
  "callToAction": "Direct CTA button label",
  "telegramFormatted": "Ready to paste into Telegram channel with markdown formatting"
}`
            }
          }),
          9500
        );
        const parsed = parseGeminiJson<Record<string, unknown>>(response?.text);
        if (parsed) return res.json(parsed);
      }
    } catch (e) {
      console.log('Gemini content studio notice, using template');
    }

    const title = listing.amharicTitle || listing.title;
    const priceInfo = listing.budget ? `ደመወዝ/በጀት፦ ${listing.budget.toLocaleString()} ETB` : (listing.price ? `ዋጋ፦ ${listing.price.toLocaleString()} ETB` : '');
    const location = listing.location || 'አዲስ አበባ';

    return res.json({
      headline: `✨ ${title}`,
      postCopy: `📢 **የኦርቶዶክሳውያን የሥራና የንግድ ጥሪ**\n\n📌 **${title}**\n📍 ቦታ፦ ${location}\n${priceInfo ? '💰 ' + priceInfo + '\n' : ''}\nℹ️ ${listing.description?.slice(0, 160)}...\n\n👉 ፍላጎት ያላችሁ ወገኖች በድረ-ገጻችን ወይም በስልክ በቀጥታ ተገናኙ!\n\n📞 ስልክ፦ +251 922 901 083\n✈️ ቴሌግራም፦ @orthodoxy_economy\n\n"ንቁ፣ ብቁና ታታሪ ኦርቶዶክስ ዘመኑን ለዋጀ አገልግሎት!"`,
      hashtags: ['#OrthodoxEconomy', '#EthiopianBusiness', '#HabeshaJobs', '#OrthodoxTewahedo'],
      callToAction: 'በቴሌግራም ይገናኙ',
      telegramFormatted: `✨ **${title}**\n\n${priceInfo}\n📍 ${location}\n\n${listing.description?.slice(0, 180)}...\n\n📞 +251 922 901 083 | @orthodoxy_economy`
    });
  });

  // 6. AI TIKTOK & REELS 60-SECOND PROFESSIONAL VIDEO CREATOR ENGINE
  app.post('/api/ai/video-script', async (req, res) => {
    const { listing, customPrompt, duration = 60, language = 'am' } = req.body;
    if (!listing && !customPrompt) {
      return res.status(400).json({ error: 'listing or customPrompt is required' });
    }

    const title = customPrompt || (listing ? (listing.amharicTitle || listing.title) : 'የኦርቶዶክሳውያን የሥራና የንግድ ትስስር መድረክ');
    const priceInfo = listing?.budget ? `ደመወዝ/በጀት፦ ${listing.budget.toLocaleString()} ETB` : (listing?.price ? `ዋጋ፦ ${listing.price.toLocaleString()} ETB` : '');
    const location = listing?.location || 'አዲስ አበባ / ኢትዮጵያ';
    const description = listing?.description || customPrompt || 'በኦርቶዶክሳዊ ሥነ-ምግባርና ፍትሐዊ ንግድ የተገነባ የሥራና የገበያ ትስስር';

    try {
      if (genAI && process.env.GEMINI_API_KEY) {
        const topicDetails = customPrompt 
          ? `User Video Topic/Prompt: "${customPrompt}"`
          : `Listing Details: Title: ${title}, Category: ${listing?.category || 'General'}, Location: ${location}, Price: ${priceInfo}, Description: ${description}`;

        // Allow sufficient time for high-quality Gemini generation without throwing an error
        const timeoutPromise = new Promise<null>((resolve) => 
          setTimeout(() => resolve(null), 12000)
        );

        const geminiPromise = genAI.models.generateContent({
          model: AI_MODEL,
          contents: `You are an elite, award-winning video creator, commercial director, and editor for the Ethiopian Orthodox Economic platform (ኦርቶዶክስና ኢኮኖሚ).
Your task is to create a complete, flawless 60-second (1 minute) promotional video screenplay and visual storyboard based on this request:
${topicDetails}

Target Audience: Ethiopian Orthodox believers, diaspora, professionals, artisans, and merchants.
Slogan: "ንቁ፣ ብቁና ታታሪ ኦርቶዶክስ ዘመኑን ለዋጀ አገልግሎት!"
Official Contacts: Phone +251 922 901 083, Telegram @orthodoxy_economy.

CRITICAL REQUIREMENTS:
1. Duration is exactly ${duration} seconds (1 minute).
2. Must provide BOTH:
   - Flawless, authentic, natural, dignified Amharic (አማርኛ) voiceover and on-screen text.
   - Polished, professional, high-converting English voiceover and on-screen text.
3. Exactly 4 timed scenes:
   - Scene 1 (0-12s): Eye-catching opening hook, holy cross / architectural majesty / tech vision.
   - Scene 2 (12-28s): Deep value proposition, product quality, problem solved, pricing/offer.
   - Scene 3 (28-45s): Trust proof, community verification badge, zero-broker direct connection.
   - Scene 4 (45-60s): Inspiring conclusion, call to action with phone number and Telegram handle.

Output strictly valid JSON with this schema:
{
  "videoConcept": "High-level concept in Amharic",
  "videoConceptEn": "High-level concept in English",
  "hook": "0-12s opening verbal hook in Amharic",
  "hookEn": "0-12s opening verbal hook in English",
  "caption": "TikTok/Reels caption in Amharic with hashtags",
  "captionEn": "TikTok/Reels caption in English with hashtags",
  "duration": ${duration},
  "audioRecommendation": "Traditional acoustic masenqo/kirar or solemn modern ambient sound",
  "audioTrack": "begena_masenko",
  "scenes": [
    {
      "time": "0-12s",
      "startTime": 0,
      "endTime": 12,
      "visual": "Cinematic visual description",
      "themeStyle": "orthodox_heritage",
      "imageUrl": "/assets/aistudio/image_6776db67.png",
      "voiceoverAm": "Authentic Amharic narration for 0-12s",
      "voiceoverEn": "Professional English narration for 0-12s",
      "onScreenTextAm": "Headline in Amharic",
      "onScreenTextEn": "Headline in English"
    },
    {
      "time": "12-28s",
      "startTime": 12,
      "endTime": 28,
      "visual": "Value proposition visual description",
      "themeStyle": "sacred_artisan",
      "imageUrl": "/assets/products/carved_cross.jpg",
      "voiceoverAm": "Amharic narration for 12-28s",
      "voiceoverEn": "English narration for 12-28s",
      "onScreenTextAm": "Key value text in Amharic",
      "onScreenTextEn": "Key value text in English"
    },
    {
      "time": "28-45s",
      "startTime": 28,
      "endTime": 45,
      "visual": "Trust & verification visual description",
      "themeStyle": "community_trust",
      "imageUrl": "/assets/aistudio/image_8ece76a6.png",
      "voiceoverAm": "Amharic narration for 28-45s",
      "voiceoverEn": "English narration for 28-45s",
      "onScreenTextAm": "100% የተረጋገጠ ማኅበረሰብ",
      "onScreenTextEn": "100% Verified Community"
    },
    {
      "time": "45-60s",
      "startTime": 45,
      "endTime": 60,
      "visual": "Call to action visual description with glowing phone & telegram",
      "themeStyle": "modern_business",
      "imageUrl": "/assets/products/beeswax_candles.jpg",
      "voiceoverAm": "አሁኑኑ በስልክ 0922 901 083 ይደውሉ ወይም በቴሌግራም @orthodoxy_economy ያግኙን!",
      "voiceoverEn": "Connect today via phone +251 922 901 083 or direct on Telegram @orthodoxy_economy!",
      "onScreenTextAm": "📞 0922 901 083\\n✈️ @orthodoxy_economy",
      "onScreenTextEn": "📞 +251 922 901 083\\n✈️ @orthodoxy_economy"
    }
  ]
}`,
          config: {
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
            responseMimeType: 'application/json',
          }
        });

        const response: any = await Promise.race([geminiPromise, timeoutPromise]);
        const parsed = parseGeminiJson<any>(response?.text);
        if (parsed && Array.isArray(parsed.scenes)) {
          parsed.scenes = parsed.scenes.map((s: any) => ({
            ...s,
            voiceover: s.voiceoverAm || s.voiceover,
            onScreenText: s.onScreenTextAm || s.onScreenText
          }));
          return res.json(parsed);
        }
      }
    } catch {
      // Graceful fallback to verified template
    }

    // High quality authentic fallback for 60-second video
    return res.json({
      videoConcept: `ስለ ${title} የተዘጋጀ ባለ 1 ደቂቃ የቪዲዮ ማስተዋወቂያ`,
      videoConceptEn: `60-Second Professional Video Showcase for ${title}`,
      hook: `ስለ ${title} ሰምተዋል? ታማኝ፣ ጥራት ያለው እና በኦርቶዶክሳዊ ሥነ-ምግባር የተገነባ ዕድል!`,
      hookEn: `Have you discovered ${title}? Verified quality, authentic craftsmanship, and direct trust!`,
      caption: `✨ ${title} | ንቁ፣ ብቁና ታታሪ ኦርቶዶክስ ዘመኑን ለዋጀ አገልግሎት! 🇪🇹 #OrthodoxEconomy #Ethiopia #Habesha #TiktokEthiopia #Viral`,
      captionEn: `✨ ${title} | Empowering the Ethiopian Orthodox economic ecosystem! #OrthodoxEconomy #Ethiopia #AddisAbaba`,
      duration: 60,
      audioRecommendation: 'Traditional Ethiopian Begena & Masinko acoustic chords with solemn cinematic ambient',
      audioTrack: 'begena_masenko',
      scenes: [
        {
          time: '0-12s',
          startTime: 0,
          endTime: 12,
          visual: 'Cinematic opening shot of Ethiopian Orthodox heritage, ancient stone masonry, and glowing golden cross',
          themeStyle: 'orthodox_heritage',
          imageUrl: '/assets/aistudio/image_6776db67.png',
          voiceoverAm: `ይህንን ያውቃሉ? በኦርቶዶክሳዊ ሥነ-ምግባርና በታማኝነት የተገነባው ማኅበረሰባችን ዛሬ ታላቅ ዕድል ይዞላችሁ ቀርቧል! ስለ ${title} ማወቅ ይፈልጋሉ?`,
          voiceoverEn: `Did you know? Built on sacred integrity and unwavering trust, our community now brings you exceptional quality. Here is ${title}!`,
          onScreenTextAm: `✨ ${title}\nየኦርቶዶክሳውያን የታማኝነት መድረክ`,
          onScreenTextEn: `✨ ${title}\nOrthodox Community Excellence`,
          voiceover: `ይህንን ያውቃሉ? በኦርቶዶክሳዊ ሥነ-ምግባርና በታማኝነት የተገነባው ማኅበረሰባችን ዛሬ ታላቅ ዕድል ይዞላችሁ ቀርቧል! ስለ ${title} ማወቅ ይፈልጋሉ?`,
          onScreenText: `✨ ${title}`
        },
        {
          time: '12-28s',
          startTime: 12,
          endTime: 28,
          visual: 'Demonstration of master craftsmanship, software workflow, or pure beeswax & sacred incense processing',
          themeStyle: 'sacred_artisan',
          imageUrl: '/assets/products/carved_cross.jpg',
          voiceoverAm: `ጥራቱ የተረጋገጠ፣ ለተጠቃሚ ክብር የሚሰጥና በፍትሐዊ ዋጋ የቀረበ። ${description ? description.slice(0, 100) : ''}። ${priceInfo ? priceInfo : 'ፍትሐዊና ተመጣጣኝ ተመን' }።`,
          voiceoverEn: `Premium quality crafted with utmost care. Direct access without inflated prices. Experience verified excellence firsthand.`,
          onScreenTextAm: `ከፍተኛ ጥራት · ፍትሐዊ ዋጋ\n${priceInfo || 'ተመጣጣኝ ተመን'}`,
          onScreenTextEn: `Premium Quality · Fair Price\n${priceInfo || 'Direct Value'}`,
          voiceover: `ጥራቱ የተረጋገጠ፣ ለተጠቃሚ ክብር የሚሰጥና በፍትሐዊ ዋጋ የቀረበ።`,
          onScreenText: 'ከፍተኛ ጥራት · ፍትሐዊ ዋጋ'
        },
        {
          time: '28-45s',
          startTime: 28,
          endTime: 45,
          visual: 'Community trust badge, national ID verification seal, and handshake without intermediaries',
          themeStyle: 'community_trust',
          imageUrl: '/assets/aistudio/image_8ece76a6.png',
          voiceoverAm: `ያለ ምንም ደላላና ያልተገባ ጭማሪ፣ በቀጥታ ከታማኝ አሠሪዎችና ከአምራቾች ጋር ይገናኙ! 100% በአስተዳዳሪው ቦርድ የተረጋገጠ የማኅበረሰብ ጥበቃ።`,
          voiceoverEn: `Zero brokers, zero hidden fees. Connect directly with vetted producers and employers verified by the Community Moderation Board.`,
          onScreenTextAm: `100% የተረጋገጠ · ያለ ደላላ\nየማኅበረሰብ ጥበቃና እምነት`,
          onScreenTextEn: `100% Verified · Zero Brokerage\nGuaranteed Trust & Safety`,
          voiceover: `ያለ ምንም ደላላና ያልተገባ ጭማሪ፣ በቀጥታ ከታማኝ አሠሪዎችና ከአምራቾች ጋር ይገናኙ!`,
          onScreenText: '100% የተረጋገጠ · ያለ ደላላ'
        },
        {
          time: '45-60s',
          startTime: 45,
          endTime: 60,
          visual: 'Grand finale with glowing phone number, direct Telegram link, and invitation to join the movement',
          themeStyle: 'modern_business',
          imageUrl: '/assets/products/beeswax_candles.jpg',
          voiceoverAm: `እርስዎም የዚህ የበረከትና የሥራ ትስስር ተጠቃሚ ይሁኑ! አሁኑኑ በስልክ 0922 901 083 ይደውሉ ወይም በቴሌግራም @orthodoxy_economy ያግኙን!`,
          voiceoverEn: `Join this thriving movement today! Call us at +251 922 901 083 or reach out directly on Telegram @orthodoxy_economy!`,
          onScreenTextAm: `📞 +251 922 901 083\n✈️ @orthodoxy_economy\n"ንቁ፣ ብቁና ታታሪ ኦርቶዶክስ!"`,
          onScreenTextEn: `📞 +251 922 901 083\n✈️ @orthodoxy_economy\nOrthodox & Economy`,
          voiceover: `እርስዎም የዚህ የበረከትና የሥራ ትስስር ተጠቃሚ ይሁኑ! አሁኑኑ በስልክ 0922 901 083 ይደውሉ!`,
          onScreenText: `📞 0922 901 083\n@orthodoxy_economy`
        }
      ]
    });
  });

  // Helper to build fast, grounded chat prompt and fallback for both /api/ai/chat and /api/ai/chat/stream
  const STATIC_CHAT_SYSTEM_PREFIX = `You are the precise, helpful AI Assistant for "ORTHODOXY & ECONOMY" (የኦርቶዶክሳውያን የሥራና የንግድ ትስስር መድረክ).
Strict Answering & Anti-Mixing Rules:
1. DIRECT ANSWER ONLY: Answer ONLY the exact question the user asked. Do NOT dump unrelated tabs, phone numbers, Telegram handles, or unrelated platform ads unless the user explicitly asked for contact/navigation help.
2. ZERO TOPIC MIXING:
   - If the user asks about jobs, reply ONLY about jobs using the Matched Jobs / Live Snapshot.
   - If the user asks about products/candles/incense/honey, reply ONLY about products using Matched Products.
   - If the user asks an Orthodox spiritual/scriptural/fasting/canonical question, answer ONLY that question accurately and respectfully without mixing job listings or product promos.
   - If the user asks how to use a feature (posting, verification, proposals), give clear step-by-step instructions ONLY for that feature.
3. HONESTY ABOUT LIVE DATA: Never invent fake jobs, prices, products, or phone numbers. If no live listing matches what they asked for, state that clearly and tell them which tab to check or post in.
4. LANGUAGE & FORMATTING: Reply in the exact language the user wrote in (Amharic, English, Afaan Oromoo, or Tigrinya). Keep answers concise (under 140 words unless deep detail is requested), with clean bullet points (•) and **bold** text—never ### headers or --- dividers.
5. GE'EZ AMHARIC ORTHOGRAPHY: Strictly follow Ge'ez etymology (ማኅበረሰብ, ሕዝብ, ዓለም, ፀሐይ, ኃይል, ሠራተኛ, ሥራ, ፍትሐዊ).
Platform Reference (use ONLY when relevant to the user's question):
- Tabs: ሥራዎች (Jobs), ገበያ (Marketplace), አገልግሎቶች (Services), ንግዶችና አስመጪዎች (Businesses & Importers), ባለሙያዎች (Professionals), ኦርቶዶክሳዊ ዕውቀት (Orthodox AI RAG), ጸሎትና ምልጃ (Prayers), AI ስቱዲዮ (AI Studio).
- Official Contacts: Phone +251 922 901 083 / +251 981 848 698 | Telegram @orthodoxy_economy | Email fikremariamfikadu2012@gmail.com | TikTok @orthodoxy.and.eco7`;

  const buildChatPrompt = (message: string, platformContext: any, language: string, conversationHistory: any[]) => {
    const formattedHistory = Array.isArray(conversationHistory) && conversationHistory.length > 0
      ? conversationHistory.slice(-6).map((m: any) => `${m.sender === 'user' ? 'User' : 'Assistant'}: ${m.text}`).join('\n')
      : '';

    const liveCounts = platformContext
      ? `Live Counts: ${platformContext.totalJobs ?? 0} Jobs, ${platformContext.totalProducts ?? 0} Products, ${platformContext.totalBusinesses ?? 0} Businesses${platformContext.totalServices ? `, ${platformContext.totalServices} Services` : ''}.`
      : '';
    const matchedJobs = Array.isArray(platformContext?.matchedJobs) && platformContext.matchedJobs.length > 0
      ? `Matched Jobs for Query: ${platformContext.matchedJobs.join(' | ')}`
      : '';
    const matchedProducts = Array.isArray(platformContext?.matchedProducts) && platformContext.matchedProducts.length > 0
      ? `Matched Products for Query: ${platformContext.matchedProducts.join(' | ')}`
      : '';
    const matchedServices = Array.isArray(platformContext?.matchedServices) && platformContext.matchedServices.length > 0
      ? `Matched Services for Query: ${platformContext.matchedServices.join(' | ')}`
      : '';
    const matchedBusinesses = Array.isArray(platformContext?.matchedBusinesses) && platformContext.matchedBusinesses.length > 0
      ? `Matched Businesses for Query: ${platformContext.matchedBusinesses.join(' | ')}`
      : '';
    const sampleJobs = !matchedJobs && Array.isArray(platformContext?.sampleJobTitles) && platformContext.sampleJobTitles.length > 0
      ? `Recent Jobs: ${platformContext.sampleJobTitles.join(' | ')}`
      : '';
    const sampleProducts = !matchedProducts && Array.isArray(platformContext?.sampleProducts) && platformContext.sampleProducts.length > 0
      ? `Featured Products: ${platformContext.sampleProducts.join(' | ')}`
      : '';

    const contextLines = [liveCounts, matchedJobs, matchedProducts, matchedServices, matchedBusinesses, sampleJobs, sampleProducts]
      .filter(Boolean)
      .join('\n');

    const prompt = `${contextLines ? `${contextLines}\n` : ''}Preferred UI Language: ${language}\n${formattedHistory ? `\nConversation History:\n${formattedHistory}\n` : ''}\nCurrent User Question (answer THIS exact question directly without mixing unrelated topics):\n"${message}"`;

    return { prompt, systemInstruction: STATIC_CHAT_SYSTEM_PREFIX };
  };

  const buildChatCacheKey = (message: string, platformContext: any, language: string, conversationHistory: any[]): string | null => {
    // Only cache standalone/initial queries so multi-turn follow-ups preserve full conversational context
    if (Array.isArray(conversationHistory) && conversationHistory.length > 1) {
      return null;
    }
    const normMsg = normalizeAmharicForSearch(message);
    if (!normMsg) return null;
    if (isOrthodoxOrFaqQuery(message)) {
      return `orthodox:${language}:${normMsg}`;
    }
    const ctxSig = `${platformContext?.totalJobs ?? 0}:${platformContext?.totalProducts ?? 0}:${platformContext?.totalServices ?? 0}`;
    return `chat:${language}:${ctxSig}:${normMsg}`;
  };

  const buildChatFallback = (message: string, language: string) => {
    const msg = message.toLowerCase().trim();
    const isGreeting = /^(ሰላም|ጤና|እንደምን|ሰላምታ|hi|hello|hey|selam|akkami|selamat)[!.\s]*$/i.test(msg);
    const isContact = /ስልክ|አድራሻ|ቴሌግራም|ደውል|ኢሜይል|phone|contact|telegram|email|call|bilbila/i.test(msg);
    const isTheology = /ዕውቀት|ቀኖና|ፍትሐ ነገሥት|ፍትሀ ነገስት|ባሕረ ሐሳብ|ባህረ ሀሳብ|መጽሐፍ ቅዱስ|መጽሀፍ ቅዱስ|ጾም|አጽዋማት|ኦርቶዶክስ|ተዋሕዶ|ተዋህዶ|doctrine|theology|canon|bible|fasting/i.test(msg);
    const isVerification = /ማረጋገጫ|ባጅ|ታማኝ|verify|verification|badge/i.test(msg);
    const isStudio = /ስቱዲዮ|ይዘት|ቴሌግራም ጽሑፍ|ቲክቶክ|studio|copy|script|video/i.test(msg);
    const isPost = /መለጠፍ|ማስታወቅ|ለጥፍ|አስመዘግብ|post|publish|register|galmeessi/i.test(msg);
    const isCandleIncense = /ጧፍ|ሰም|ዕጣን|አልባሳት|candle|incense|wax|ማር|ቡና|honey|coffee/i.test(msg);
    const isJob = /ሥራ|ስራ|ቅጥር|vacancy|job|hiring|work|hojii|ሥራዎች/i.test(msg);
    const isMarket = /ገበያ|ምርት|ዕቃ|ሻጭ|ግዢ|ዋጋ|product|buy|sell|market|gabaa/i.test(msg);

    if (isGreeting) {
      return language === 'en'
        ? `Peace and blessings be with you! Welcome to **ORTHODOXY & ECONOMY**. How may I help you today?`
        : `ሰላም እግዚአብሔር ከእርስዎ ጋር ይሁን! እንኳን ወደ **ኦርቶዶክሳውያን የሥራና የንግድ ትስስር መድረክ** በደኅና መጡ። ዛሬ በምን ልርዳዎ?`;
    }
    if (isContact) {
      return `📞 **የመድረኩ ይፋዊ የመገናኛ መስመሮች፦**\n• **ስልክ 1፦** +251 922 901 083\n• **ስልክ 2፦** +251 981 848 698\n• **ቴሌግራም፦** @orthodoxy_economy\n• **ኢሜይል፦** fikremariamfikadu2012@gmail.com\n• **ቲክቶክ፦** @orthodoxy.and.eco7`;
    }
    if (isTheology) {
      return `📖 **ኦርቶዶክሳዊ ዕውቀት፦**\nከላይ **«📖 ኦርቶዶክሳዊ ዕውቀት»** ክፍል ውስጥ ስለ መጽሐፍ ቅዱስ፣ ፍትሐ ነገሥት፣ ሰባቱ አጽዋማትና ባሕረ ሐሳብ በተረጋገጡ የቤተክርስቲያን ምንጮች መመርመር ይችላሉ።`;
    }
    if (isVerification) {
      return `🛡️ **የማረጋገጫ ሰማያዊ ባጅ፦**\nመገለጫዎ (Profile) ውስጥ ገብተው የማንነት ወይም የንግድ ፈቃድ መረጃዎን ያስገቡ፤ የማረጋገጫ ቡድናችን ይገመግመዋል።`;
    }
    if (isStudio) {
      return `✨ **AI ስቱዲዮ፦**\nከላይ **«✨ AI ስቱዲዮ»** ክፍልን በመክፈት ለቴሌግራምና ቲክቶክ የማስታወቂያ ጽሑፍና ቪዲዮ ማዘጋጀት ይችላሉ።`;
    }
    if (isPost) {
      return `➕ **ማስታወቂያ ለመለጠፍ፦**\n1. ከላይ **«+ ለጥፍ»** አዝራርን ይጫኑ።\n2. ሥራ፣ ምርት፣ አገልግሎት ወይም ድርጅት ይምረጡ።\n3. መረጃውን ሲያስገቡ ወዲያውኑ በመድረኩና በሞባይል አፑ ላይ በቀጥታ ይታያል።`;
    }
    if (isCandleIncense) {
      return `🕯️ **ንጹሕ የሰም ጧፍ፣ ዕጣን፣ ማርና ቡና፦**\nከላይ ያለውን **«ገበያ»** ክፍል በመክፈት 100% ንጹሕ የሰም ጧፍ፣ ዕጣን፣ የተፈጥሮ ማር እና ቡና ያለ ደላላ በቀጥታ ከአምራቾች መግዛት ይችላሉ።`;
    }
    if (isJob) {
      return `💼 **ክፍት የሥራ ቦታዎች፦**\nከላይ ያለውን **«ሥራዎች»** ክፍል ይክፈቱ፤ ወይም አሠሪ ከሆኑ በ **«+ ለጥፍ»** አዝራር በነፃ የሥራ ማስታወቂያ ያውጡ።`;
    }
    if (isMarket) {
      return `🛍️ **የምርቶችና የጅምላ አስመጪዎች ገበያ፦**\nለችርቻሮ ግዢ **«ገበያ»**፣ ለጅምላና አስመጪዎች (Wholesale / B2B) ደግሞ **«ንግዶችና አስመጪዎች»** ክፍልን ይጎብኙ።`;
    }
    return language === 'en'
      ? `I could not reach the live AI right now. Please try rephrasing your question or contact us at +251 922 901 083 / +251 981 848 698 (@orthodoxy_economy).`
      : `እባክዎ ጥያቄዎን በዝርዝር ደግመው ይላኩልኝ ወይም በቀጥታ በ +251 922 901 083 / +251 981 848 698 (@orthodoxy_economy) ያግኙን።`;
  };

  // 7A. AI PLATFORM CHAT ASSISTANT — REAL-TIME STREAMING (SSE) + PROMPT CACHE
  app.post('/api/ai/chat/stream', async (req, res) => {
    const { message, platformContext, language = 'am', conversationHistory = [] } = req.body;
    if (!message) return res.status(400).json({ error: 'message is required' });

    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const cacheKey = buildChatCacheKey(message, platformContext, language, conversationHistory);
    if (cacheKey) {
      const cachedReply = orthodoxChatCache.get(cacheKey);
      if (cachedReply) {
        res.write(`data: ${JSON.stringify({ chunk: cachedReply, cached: true })}\n\n`);
        res.write(`data: ${JSON.stringify({ done: true, cached: true })}\n\n`);
        return res.end();
      }
    }

    let clientDisconnected = false;
    res.on('close', () => {
      if (!res.writableEnded) {
        clientDisconnected = true;
      }
    });

    const { prompt, systemInstruction } = buildChatPrompt(message, platformContext, language, conversationHistory);
    let sentAnyChunk = false;
    let fullAccumulated = '';

    try {
      if (genAI && process.env.GEMINI_API_KEY) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 14000);

        try {
          const stream = await genAI.models.generateContentStream({
            model: AI_MODEL,
            contents: prompt,
            config: {
              thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
              systemInstruction,
              abortSignal: controller.signal,
            },
          });

          for await (const chunk of stream) {
            if (clientDisconnected) break;
            const text = chunk.text;
            if (text) {
              sentAnyChunk = true;
              fullAccumulated += text;
              res.write(`data: ${JSON.stringify({ chunk: text })}\n\n`);
            }
          }
        } finally {
          clearTimeout(timer);
        }
      }
    } catch (e) {
      console.log('Gemini streaming notice, falling back:', (e as any)?.message || e);
    }

    if (sentAnyChunk && cacheKey && fullAccumulated.trim()) {
      orthodoxChatCache.set(cacheKey, fullAccumulated.trim());
    }

    if (!clientDisconnected && !res.writableEnded) {
      if (!sentAnyChunk) {
        const fallback = buildChatFallback(message, language);
        res.write(`data: ${JSON.stringify({ chunk: fallback, fallback: true })}\n\n`);
      }
      res.write(`data: ${JSON.stringify({ done: true, cached: false })}\n\n`);
      res.end();
    }
  });

  // 7B. AI PLATFORM CHAT ASSISTANT (Standard Fast Endpoint + Cache)
  app.post('/api/ai/chat', async (req, res) => {
    const { message, platformContext, language = 'am', conversationHistory = [] } = req.body;
    if (!message) return res.status(400).json({ error: 'message is required' });

    const cacheKey = buildChatCacheKey(message, platformContext, language, conversationHistory);
    if (cacheKey) {
      const cachedReply = orthodoxChatCache.get(cacheKey);
      if (cachedReply) {
        return res.json({ reply: cachedReply, cached: true });
      }
    }

    const { prompt, systemInstruction } = buildChatPrompt(message, platformContext, language, conversationHistory);

    try {
      if (genAI && process.env.GEMINI_API_KEY) {
        const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 10000));
        const geminiPromise = genAI.models.generateContent({
          model: AI_MODEL,
          contents: prompt,
          config: {
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
            systemInstruction,
          },
        });

        const response: any = await Promise.race([geminiPromise, timeoutPromise]);
        const reply = response?.text?.trim();
        if (reply) {
          if (cacheKey) {
            orthodoxChatCache.set(cacheKey, reply);
          }
          return res.json({ reply, cached: false });
        }
      }
    } catch (e) {
      console.log('Gemini chat assistant notice, using template');
    }

    return res.json({ reply: buildChatFallback(message, language), cached: false });
  });

  // 8. AI CV / RESUME PARSER
  app.post('/api/ai/parse-cv', async (req, res) => {
    const { cvText } = req.body;
    if (!cvText) return res.status(400).json({ error: 'cvText is required' });

    try {
      if (genAI && process.env.GEMINI_API_KEY) {
        const response = await withTimeout(
          genAI.models.generateContent({
            model: AI_MODEL,
            contents: `Parse this CV / Resume text and extract skills, professional title, and bio:
${cvText}`,
            config: {
              thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
              responseMimeType: 'application/json',
              systemInstruction: `Do NOT fabricate false employers or degrees. Output JSON:
{
  "extractedSkills": string[],
  "suggestedTitle": string,
  "suggestedBio": string,
  "suggestedBioAm": string,
  "experienceYears": number
}`
            }
          }),
          9500
        );
        const parsed = parseGeminiJson<Record<string, unknown>>(response?.text);
        if (parsed) return res.json(parsed);
      }
    } catch (e) {
      console.log('Gemini CV parser notice, using template');
    }

    return res.json({
      extractedSkills: ['Problem Solving', 'Project Management', 'Effective Communication'],
      suggestedTitle: 'Experienced Professional Specialist',
      suggestedBio: cvText.slice(0, 150) + '...',
      suggestedBioAm: 'በሙያቸው የተካኑና ለታማኝ አገልግሎት የተዘጋጁ ባለሙያ።',
      experienceYears: 5
    });
  });

  // 9A. ORTHODOX KNOWLEDGE RAG SYSTEM — REAL-TIME STREAMING (SSE) + PROMPT CACHE
  app.post('/api/ai/orthodox-rag/stream', async (req, res) => {
    const { query, mode = 'orthodox_knowledge', maxAuthorityLevel = 4, language = 'am' } = req.body;
    if (!query) return res.status(400).json({ error: 'query is required' });

    const startedAt = Date.now();
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const normQuery = normalizeAmharicForSearch(query);
    const cacheKey = `rag:${mode}:${maxAuthorityLevel}:${language}:${normQuery}`;

    // Check Prompt Cache first for instant <5ms response
    const cached = orthodoxRagCache.get(cacheKey);
    if (cached) {
      res.write(`data: ${JSON.stringify({
        meta: {
          sources: cached.sources,
          canonicalReference: cached.canonicalReference,
          summaryPoints: cached.summaryPoints,
          mode: cached.mode,
          hasSufficientSources: cached.hasSufficientSources,
          cached: true,
        },
      })}\n\n`);
      const textToStream = language === 'am' ? cached.answerAm : cached.answer;
      res.write(`data: ${JSON.stringify({ chunk: textToStream, cached: true })}\n\n`);
      res.write(`data: ${JSON.stringify({
        done: true,
        cached: true,
        latencyMs: Date.now() - startedAt,
        summaryPoints: cached.summaryPoints,
        canonicalReference: cached.canonicalReference,
      })}\n\n`);
      return res.end();
    }

    const topDocs = retrieveOrthodoxDocs(query, maxAuthorityLevel);
    if (topDocs.length === 0) {
      const noSourceAm = 'በተፈቀዱ የኢትዮጵያ ኦርቶዶክስ ተዋሕዶ ቤተክርስቲያን ምንጮች ውስጥ ለዚህ ጥያቄ በቂ መረጃ አልተገኘም። እባክዎ ተጨማሪ የተረጋገጡ የቀኖና ወይም የታሪክ ሰነዶችን ይጠይቁ።';
      const noSourceEn = 'I could not find sufficient information in the approved Ethiopian Orthodox knowledge sources.';
      res.write(`data: ${JSON.stringify({
        meta: { sources: [], canonicalReference: '', summaryPoints: [], mode, hasSufficientSources: false, cached: false },
      })}\n\n`);
      res.write(`data: ${JSON.stringify({ chunk: language === 'am' ? noSourceAm : noSourceEn })}\n\n`);
      res.write(`data: ${JSON.stringify({ done: true, cached: false, latencyMs: Date.now() - startedAt })}\n\n`);
      return res.end();
    }

    const mappedSources = topDocs.map((d) => ({
      id: d.id,
      title: d.title,
      titleAm: d.titleAm,
      sourceName: d.sourceName,
      citation: d.citation,
      authorityLevel: d.authorityLevel,
      excerptAm: d.excerptAm,
    }));
    const primary = topDocs[0];
    const summaryPoints = topDocs.map((d) => `${d.citation} (ደረጃ ${d.authorityLevel})`);

    // Send grounded sources immediately before LLM tokens begin
    res.write(`data: ${JSON.stringify({
      meta: {
        sources: mappedSources,
        canonicalReference: primary.citation,
        summaryPoints,
        mode,
        hasSufficientSources: true,
        cached: false,
      },
    })}\n\n`);

    let clientDisconnected = false;
    res.on('close', () => {
      if (!res.writableEnded) {
        clientDisconnected = true;
      }
    });

    const contextPassages = topDocs
      .map((d) => `[Level ${d.authorityLevel}] ${d.sourceName} (${d.citation}): ${d.excerptAm} / ${d.excerpt}`)
      .join('\n\n');

    const systemInstruction = `${STATIC_ORTHODOX_SYSTEM_PREFIX}
4. Respond directly in ${language === 'am' ? 'Amharic' : language === 'om' ? 'Afaan Oromoo' : language === 'ti' ? 'Tigrinya' : 'English'} in clear readable prose (no JSON wrappers).`;

    const prompt = `Approved Church Sources:\n${contextPassages}\n\nStudy Mode: ${mode}\nQuestion: "${query}"`;

    let streamedText = '';
    let sentAnyChunk = false;

    try {
      if (genAI && process.env.GEMINI_API_KEY) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 14000);

        try {
          const stream = await genAI.models.generateContentStream({
            model: AI_MODEL,
            contents: prompt,
            config: {
              thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
              systemInstruction,
              abortSignal: controller.signal,
            },
          });

          for await (const chunk of stream) {
            if (clientDisconnected) break;
            const text = chunk.text;
            if (text) {
              sentAnyChunk = true;
              streamedText += text;
              res.write(`data: ${JSON.stringify({ chunk: text })}\n\n`);
            }
          }
        } finally {
          clearTimeout(timer);
        }
      }
    } catch (e) {
      console.log('Gemini Orthodox RAG streaming notice, falling back:', (e as any)?.message || e);
    }

    const fallbackText = language === 'am'
      ? `በተረጋገጠው ምንጭ ${primary.sourceName} (${primary.citation}) መሠረት፦ ${primary.excerptAm}`
      : `Based on ${primary.sourceName} (${primary.citation}): ${primary.excerpt}`;

    const finalText = sentAnyChunk && streamedText.trim() ? streamedText.trim() : fallbackText;

    // Cache valid grounded answer for instant repeat hits
    orthodoxRagCache.set(cacheKey, {
      answer: language === 'am' ? `Based on ${primary.sourceName} (${primary.citation}): ${primary.excerpt}` : finalText,
      answerAm: language === 'am' ? finalText : `በተረጋገጠው ምንጭ ${primary.sourceName} (${primary.citation}) መሠረት፦ ${primary.excerptAm}`,
      summaryPoints,
      canonicalReference: primary.citation,
      sources: mappedSources,
      mode,
      hasSufficientSources: true,
    });

    if (!clientDisconnected && !res.writableEnded) {
      if (!sentAnyChunk) {
        res.write(`data: ${JSON.stringify({ chunk: fallbackText, fallback: true })}\n\n`);
      }
      res.write(`data: ${JSON.stringify({
        done: true,
        cached: false,
        latencyMs: Date.now() - startedAt,
        summaryPoints,
        canonicalReference: primary.citation,
      })}\n\n`);
      res.end();
    }
  });

  // 9B. ORTHODOX KNOWLEDGE RAG SYSTEM (Standard Endpoint + Prompt Cache)
  app.post('/api/ai/orthodox-rag', async (req, res) => {
    const { query, mode = 'orthodox_knowledge', maxAuthorityLevel = 4, language = 'am' } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'query is required' });
    }

    const normQuery = normalizeAmharicForSearch(query);
    const cacheKey = `rag-json:${mode}:${maxAuthorityLevel}:${normQuery}`;
    const cached = orthodoxRagCache.get(cacheKey);
    if (cached) {
      return res.json({ ...cached, cached: true });
    }

    // Step 1: Normalized Query Understanding & Knowledge Retrieval
    const topDocs = retrieveOrthodoxDocs(query, maxAuthorityLevel);

    // If no matching sources found, maintain strict discipline:
    if (topDocs.length === 0) {
      return res.json({
        answer: 'I could not find sufficient information in the approved Ethiopian Orthodox knowledge sources.',
        answerAm: 'በተፈቀዱ የኢትዮጵያ ኦርቶዶክስ ተዋሕዶ ቤተክርስቲያን ምንጮች ውስጥ ለዚህ ጥያቄ በቂ መረጃ አልተገኘም። እባክዎ ተጨማሪ የተረጋገጡ የቀኖና ወይም የታሪክ ሰነዶችን ይጠይቁ።',
        sources: [],
        mode,
        hasSufficientSources: false,
        cached: false,
      });
    }

    const mappedSources = topDocs.map((d) => ({
      id: d.id,
      title: d.title,
      titleAm: d.titleAm,
      sourceName: d.sourceName,
      citation: d.citation,
      authorityLevel: d.authorityLevel,
      excerptAm: d.excerptAm,
    }));

    const contextPassages = topDocs
      .map((d) => `[Level ${d.authorityLevel}] ${d.sourceName} (${d.citation}): ${d.excerptAm} / ${d.excerpt}`)
      .join('\n\n');

    try {
      if (genAI && process.env.GEMINI_API_KEY) {
        const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 12000));
        const geminiPromise = genAI.models.generateContent({
          model: AI_MODEL,
          contents: `Approved Sources:\n${contextPassages}\n\nQuestion: "${query}"`,
          config: {
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
            responseMimeType: 'application/json',
            systemInstruction: `${STATIC_ORTHODOX_SYSTEM_PREFIX}
Return valid JSON:
{
  "answer": "Clear English answer strictly based on provided sources",
  "answerAm": "በቀረቡት የተረጋገጡ ምንጮች ላይ ብቻ የተመሠረተ ግልጽ የአማርኛ መልስ",
  "summaryPoints": ["Point 1", "Point 2"],
  "canonicalReference": "Explicit book/citation reference"
}`
          }
        });

        const response: any = await Promise.race([geminiPromise, timeoutPromise]);
        const parsed = parseGeminiJson<any>(response?.text);
        if (parsed) {
          const payload: CachedOrthodoxRagResult = {
            answer: parsed.answer || '',
            answerAm: parsed.answerAm || '',
            summaryPoints: Array.isArray(parsed.summaryPoints) ? parsed.summaryPoints : [],
            canonicalReference: parsed.canonicalReference || topDocs[0].citation,
            sources: mappedSources,
            mode,
            hasSufficientSources: true,
          };
          orthodoxRagCache.set(cacheKey, payload);
          return res.json({ ...payload, cached: false });
        }
      }
    } catch (e) {
      console.log('Gemini Orthodox RAG notice, using template');
    }

    // Grounded Fallback based on top retrieved document
    const primary = topDocs[0];
    return res.json({
      answer: `Based on ${primary.sourceName} (${primary.citation}): ${primary.excerpt}`,
      answerAm: `በተረጋገጠው ምንጭ ${primary.sourceName} (${primary.citation}) መሠረት፦ ${primary.excerptAm}`,
      summaryPoints: [
        primary.citation,
        `ደረጃ ${primary.authorityLevel} ይፋዊ የቤተክርስቲያን ምንጭ`
      ],
      canonicalReference: primary.citation,
      sources: mappedSources,
      mode,
      hasSufficientSources: true,
      cached: false,
    });
  });

  // 10. AI FILE CENTER & INTELLIGENCE
  app.post('/api/ai/analyze-file', async (req, res) => {
    const { text, fileText, content, fileName = 'document.txt', action = 'summarize', language = 'am' } = req.body;
    const documentText = text || fileText || content;
    if (!documentText) {
      return res.status(400).json({ error: 'text is required' });
    }

    try {
      if (genAI && process.env.GEMINI_API_KEY) {
        const response = await withTimeout(
          genAI.models.generateContent({
            model: AI_MODEL,
            contents: `Analyze this document for an Ethiopian Orthodox platform.
Action requested: "${action}".
Document Title: "${fileName}"
Content:
"""${documentText.slice(0, 4000)}"""`,
            config: {
              thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
              responseMimeType: 'application/json',
              systemInstruction: `Output valid JSON matching this schema:
{
  "summary": "Concise summary",
  "summaryAm": "አጭር ማጠቃለያ በአማርኛ",
  "keyPoints": ["Point 1", "Point 2", "Point 3"],
  "quizQuestions": [
    {
      "question": "Question text in Amharic or English",
      "options": ["A", "B", "C", "D"],
      "correctIndex": 0,
      "explanation": "Why this is correct"
    }
  ],
  "telegramPost": "Ready-to-copy telegram post format with emojis and contacts",
  "socialHook": "Engaging 0-3s hook for TikTok/Reels",
  "studyNotes": ["Note 1", "Note 2"]
}`
            }
          }),
          9500
        );

        const parsed = parseGeminiJson<Record<string, unknown>>(response?.text);
        if (parsed) {
          return res.json(parsed);
        }
      }
    } catch (e) {
      console.log('Gemini File analysis notice, using template');
    }

    // Heuristic Fallback
    const firstLines = documentText.split('\n').filter(Boolean).slice(0, 3).join('. ');
    return res.json({
      summary: `Document analysis of ${fileName}: ${firstLines.slice(0, 200)}...`,
      summaryAm: `የሰነዱ ማጠቃለያ (${fileName})፦ ${firstLines.slice(0, 150)}...`,
      keyPoints: [
        'ዋና የሰነድ መልእክቶችና መመሪያዎች ተለይተዋል',
        'የሥራና የሥነ-ምግባር ደንቦች ተረጋግጠዋል',
        'ለማኅበረሰብ አገልግሎት ዝግጁ ሆኗል'
      ],
      quizQuestions: [
        {
          question: `የዚህ ሰነድ (${fileName}) ዋና ትኩረት ምንድን ነው?`,
          options: ['ማኅበረሰባዊ ትስስርና ልማት', 'አድልዎና መለያየት', 'የዘፈቀደ ግብይት', 'ምንም'],
          correctIndex: 0,
          explanation: 'በሰነዱ ላይ እንደተገለጸው ለጋራ ተጠቃሚነት የተዘጋጀ ነው።'
        }
      ],
      telegramPost: `📄 **የሰነድ ማጠቃለያ፦ ${fileName}**\n\n📌 ${firstLines.slice(0, 180)}...\n\n📞 +251 922 901 083\n✈️ @orthodoxy_economy\n\n"ንቁ፣ ብቁና ታታሪ ኦርቶዶክስ ዘመኑን ለዋጀ አገልግሎት!"`,
      socialHook: `ስለዚህ ጠቃሚ ሰነድ (${fileName}) ሰምተዋል? ይኸው በአንድ ደቂቃ ውስጥ!`,
      studyNotes: [
        `ሰነድ፦ ${fileName}`,
        'የንባብ ደረጃ፦ የተጠናቀቀ',
        'ለማኅበራዊ ሚዲያ የተዘጋጀ'
      ]
    });
  });

  // Ensure unmatched /api/* endpoints return JSON 404 instead of SPA HTML fallback
  app.all('/api/*', (_req, res) => {
    res.status(404).json({ error: 'API endpoint not found' });
  });

  // Development vs Production serving
  if (isProd && hasDist) {
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { 
        middlewareMode: true,
        hmr: false
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running at http://0.0.0.0:${PORT} (${isProd ? 'production' : 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
