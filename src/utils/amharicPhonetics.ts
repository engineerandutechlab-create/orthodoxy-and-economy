/**
 * High-fidelity Amharic Ge'ez to Phonetic Transliteration Engine
 * Ensures Web Speech API can audibly and flawlessly pronounce Amharic text
 * even on devices without a native 'am-ET' TTS voice installed.
 */

const GEEZ_TO_PHONETIC_MAP: Record<string, string> = {
  // ሀ (ha)
  'ሀ': 'ha', 'ሁ': 'hoo', 'ሂ': 'hee', 'ሃ': 'haa', 'ሄ': 'hey', 'ህ': 'h', 'ሆ': 'ho',
  // ለ (la)
  'ለ': 'le', 'ሉ': 'loo', 'ሊ': 'lee', 'ላ': 'laa', 'ሌ': 'ley', 'ል': 'l', 'ሎ': 'lo',
  // ሐ (hha)
  'ሐ': 'ha', 'ሑ': 'hoo', 'ሒ': 'hee', 'ሓ': 'haa', 'ሔ': 'hey', 'ሕ': 'h', 'ሖ': 'ho',
  // መ (ma)
  'መ': 'me', 'ሙ': 'moo', 'ሚ': 'mee', 'ማ': 'maa', 'ሜ': 'mey', 'ም': 'm', 'ሞ': 'mo',
  // ሠ (sa)
  'ሠ': 'se', 'ሡ': 'soo', 'ሢ': 'see', 'ሣ': 'saa', 'ሤ': 'sey', 'ሥ': 's', 'ሦ': 'so',
  // ረ (ra)
  'ረ': 're', 'ሩ': 'roo', 'ሪ': 'ree', 'ራ': 'raa', 'ሬ': 'rey', 'ር': 'r', 'ሮ': 'ro',
  // ሰ (sa)
  'ሰ': 'se', 'ሱ': 'soo', 'ሲ': 'see', 'ሳ': 'saa', 'ሴ': 'sey', 'ስ': 's', 'ሶ': 'so',
  // ሸ (sha)
  'ሸ': 'she', 'ሹ': 'shoo', 'ሺ': 'shee', 'ሻ': 'shaa', 'ሼ': 'shey', 'ሽ': 'sh', 'ሾ': 'sho',
  // ቀ (qa/ka)
  'ቀ': 'ke', 'ቁ': 'koo', 'ቂ': 'kee', 'ቃ': 'kaa', 'ቄ': 'key', 'ቅ': 'k', 'ቆ': 'ko',
  // በ (ba)
  'በ': 'be', 'ቡ': 'boo', 'ቢ': 'bee', 'ባ': 'baa', 'ቤ': 'bey', 'ብ': 'b', 'ቦ': 'bo',
  // ተ (ta)
  'ተ': 'te', 'ቱ': 'too', 'ቲ': 'tee', 'ታ': 'taa', 'ቴ': 'tey', 'ት': 't', 'ቶ': 'to',
  // ቸ (cha)
  'ቸ': 'che', 'ቹ': 'choo', 'ቺ': 'chee', 'ቻ': 'chaa', 'ቼ': 'chey', 'ች': 'ch', 'ቾ': 'cho',
  // ኀ (ha)
  'ኀ': 'ha', 'ኁ': 'hoo', 'ኂ': 'hee', 'ኃ': 'haa', 'ኄ': 'hey', 'ኅ': 'h', 'ኆ': 'ho',
  // ነ (na)
  'ነ': 'ne', 'ኑ': 'noo', 'ኒ': 'nee', 'ና': 'naa', 'ኔ': 'ney', 'ን': 'n', 'ኖ': 'no',
  // ኘ (nya)
  'ኘ': 'nye', 'ኙ': 'nyoo', 'ኚ': 'nyee', 'ኛ': 'nyaa', 'ኜ': 'nyey', 'ኝ': 'ny', 'ኞ': 'nyo',
  // አ (a)
  'አ': 'ah', 'ኡ': 'oo', 'ኢ': 'ee', 'ኣ': 'aa', 'ኤ': 'ey', 'እ': 'ih', 'ኦ': 'oh',
  // ከ (ka)
  'ከ': 'ke', 'ኩ': 'koo', 'ኪ': 'kee', 'ካ': 'kaa', 'ኬ': 'key', 'ክ': 'k', 'ኮ': 'ko',
  // ኸ (ha)
  'ኸ': 'he', 'ኹ': 'hoo', 'ኺ': 'hee', 'ኻ': 'haa', 'ኼ': 'hey', 'ኽ': 'h', 'ኾ': 'ho',
  // ወ (wa)
  'ወ': 'we', 'ዉ': 'woo', 'ዊ': 'wee', 'ዋ': 'waa', 'ዌ': 'wey', 'ው': 'w', 'ዎ': 'wo',
  // ዐ (a)
  'ዐ': 'ah', 'ዑ': 'oo', 'ዒ': 'ee', 'ዓ': 'aa', 'ዔ': 'ey', 'ዕ': 'ih', 'ዖ': 'oh',
  // ዘ (za)
  'ዘ': 'ze', 'ዙ': 'zoo', 'ዚ': 'zee', 'ዛ': 'zaa', 'ዜ': 'zey', 'ዝ': 'z', 'ዞ': 'zo',
  // ዠ (zha)
  'ዠ': 'zhe', 'ዡ': 'zhoo', 'ዢ': 'zhee', 'ዣ': 'zhaa', 'ዤ': 'zhey', 'ዥ': 'zh', 'ዦ': 'zho',
  // የ (ya)
  'የ': 'ye', 'ዩ': 'yoo', 'ዪ': 'yee', 'ያ': 'yaa', 'ዬ': 'yey', 'ይ': 'y', 'ዮ': 'yo',
  // ደ (da)
  'ደ': 'de', 'ዱ': 'doo', 'ዲ': 'dee', 'ዳ': 'daa', 'ዴ': 'dey', 'ድ': 'd', 'ዶ': 'do',
  // ጀ (ja)
  'ጀ': 'je', 'ጁ': 'joo', 'ጂ': 'jee', 'ጃ': 'jaa', 'ጄ': 'jey', 'ጅ': 'j', 'ጆ': 'jo',
  // ገ (ga)
  'ገ': 'ge', 'ጉ': 'goo', 'ጊ': 'gee', 'ጋ': 'gaa', 'ጌ': 'gey', 'ግ': 'g', 'ጎ': 'go',
  // ጠ (ta)
  'ጠ': 'te', 'ጡ': 'too', 'ጢ': 'tee', 'ጣ': 'taa', 'ጤ': 'tey', 'ጥ': 't', 'ጦ': 'to',
  // ጨ (cha)
  'ጨ': 'che', 'ጩ': 'choo', 'ጪ': 'chee', 'ጫ': 'chaa', 'ጬ': 'chey', 'ጭ': 'ch', 'ጮ': 'cho',
  // ጰ (pa)
  'ጰ': 'pe', 'ጱ': 'poo', 'ጲ': 'pee', 'ጳ': 'paa', 'ጴ': 'pey', 'ጵ': 'p', 'ጶ': 'po',
  // ጸ (tsa)
  'ጸ': 'tse', 'ጹ': 'tsoo', 'ጺ': 'tsee', 'ጻ': 'tsaa', 'ጼ': 'tsey', 'ጽ': 'ts', 'ጾ': 'tso',
  // ፀ (tsa)
  'ፀ': 'tse', 'ፁ': 'tsoo', 'ፂ': 'tsee', 'ፃ': 'tsaa', 'ፄ': 'tsey', 'ፅ': 'ts', 'ፆ': 'tso',
  // ፈ (fa)
  'ፈ': 'fe', 'ፉ': 'foo', 'ፊ': 'fee', 'ፋ': 'faa', 'ፌ': 'fey', 'ፍ': 'f', 'ፎ': 'fo',
  // ፐ (pa)
  'ፐ': 'pe', 'ፑ': 'poo', 'ፒ': 'pee', 'ፓ': 'paa', 'ፔ': 'pey', 'ፕ': 'p', 'ፖ': 'po',
  // ሏ ሟ ሯ ሷ ሿ ቋ ቧ ቷ ቿ ኗ ኟ ኳ ዟ ዧ ዷ ጇ ጓ ጧ ጯ ጿ ፏ
  'ሏ': 'lwa', 'ሟ': 'mwa', 'ሯ': 'rwa', 'ሷ': 'swa', 'ሿ': 'shwa', 'ቋ': 'kwa',
  'ቧ': 'bwa', 'ቷ': 'twa', 'ቿ': 'chwa', 'ኗ': 'nwa', 'ኟ': 'nywa', 'ኳ': 'kwa',
  'ዟ': 'zwa', 'ዧ': 'zhwa', 'ዷ': 'dwa', 'ጇ': 'jwa', 'ጓ': 'gwa', 'ጧ': 'twa',
  'ጯ': 'chwa', 'ጿ': 'tswa', 'ፏ': 'fwa'
};

// Common word phonetic overhauls for natural sounding Ethiopian advertising cadence
const PHONETIC_WORD_REPLACEMENTS: Record<string, string> = {
  'ይህንን': 'Yihinen',
  'ያውቃሉ': 'Yawikalu',
  'ሰምተዋል': 'Semtewal',
  'ኦርቶዶክሳዊ': 'Ortodoksawi',
  'ኦርቶዶክስ': 'Ortodoks',
  'ኢኮኖሚ': 'Ikonomi',
  'ማህበረሰብ': 'Mahibereseb',
  'ስራ': 'Sira',
  'ሥራ': 'Sira',
  'ንግድ': 'Nigid',
  'ምርት': 'Mirt',
  'አገልግሎት': 'Agelgilot',
  'ጥራት': 'Tirat',
  'ዋጋ': 'Waga',
  'ፍትሃዊ': 'Fiti-hawi',
  'ታማኝ': 'Tamanyi',
  'ተረጋገጠ': 'Teregaggete',
  'ደላላ': 'Delala',
  'ያለ': 'Yale',
  'በቀጥታ': 'Bekettita',
  'አሁኑኑ': 'Ahoonoonoo',
  'ይደውሉ': 'Yidewooloo',
  'ቴሌግራም': 'Telegram',
  'ስልክ': 'Silk',
  'እንኳን': 'Inkuan',
  'ደህና': 'Dehna',
  'መጡ': 'Mettu',
  'በረከት': 'Bereket',
  'ቅዱስ': 'Kiddus',
  'ቤተክርስቲያን': 'Betekeristiyan',
  'ጧፍ': 'Twaaf',
  'ሰም': 'Sem',
  'ዕጣን': 'Itan',
  'ንቁ': 'Nikoo',
  'ብቁ': 'Bikoo',
  'ታታሪ': 'Tatari'
};

/**
 * Transliterates Amharic Ge'ez script into pronounceable English phonetics.
 */
export function transliterateAmharicToPhonetic(amharicText: string): string {
  if (!amharicText) return '';

  // Clean markdown and non-verbal artifacts
  let clean = amharicText
    .replace(/[#*`_~]/g, '')
    .replace(/[፣፤፦]/g, ', ')
    .replace(/።/g, '. ');

  // Replace recognized key vocabulary with polished advertising pronunciation
  for (const [geezWord, phoneticWord] of Object.entries(PHONETIC_WORD_REPLACEMENTS)) {
    const reg = new RegExp(geezWord, 'g');
    clean = clean.replace(reg, phoneticWord);
  }

  // Character-by-character phonetic mapping for remaining Ge'ez letters
  let result = '';
  for (let i = 0; i < clean.length; i++) {
    const char = clean[i];
    if (GEEZ_TO_PHONETIC_MAP[char]) {
      result += GEEZ_TO_PHONETIC_MAP[char];
    } else {
      result += char;
    }
  }

  // Clean up any double spaces
  return result.replace(/\s+/g, ' ').trim();
}
