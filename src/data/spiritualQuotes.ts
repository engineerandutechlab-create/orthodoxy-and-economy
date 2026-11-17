export interface SpiritualQuote {
  id: string;
  authorAm: string;
  authorEn: string;
  sourceAm: string;
  sourceEn: string;
  quoteAm: string;
  quoteEn: string;
  themeAm: string;
  themeEn: string;
  tag: 'work_diligence' | 'honesty_integrity' | 'charity_love' | 'faith_perseverance' | 'peace_wisdom';
}

export const SPIRITUAL_QUOTES: SpiritualQuote[] = [
  {
    id: 'quote_chrysostom_work',
    authorAm: 'ቅዱስ ዮሐንስ አፈወርቅ (፬ኛው መቶ ክ/ዘ)',
    authorEn: 'St. John Chrysostom (4th Century)',
    sourceAm: 'ስለ ሀብትና ስለ ታማኝ ድካም ከተናገረው',
    sourceEn: 'Homilies on Wealth and Diligence',
    quoteAm: 'ሥራ ክብር ነው፤ ታታሪ እጅ ድህነትን ታሸንፋለች። እውነተኛ ባለጠግነት ግን በቅን ሕሊና የሚገኝ መንፈሳዊ ሰላም እና ለወገን የሚደረግ በረከት ነው።',
    quoteEn: 'Labor is an honor; diligent hands overcome poverty. True wealth is spiritual peace found in a clean conscience and being a blessing to your neighbors.',
    themeAm: 'ስለ ሥራ ክብርና ቅን ልቦና',
    themeEn: 'On the Dignity of Labor & Clean Conscience',
    tag: 'work_diligence'
  },
  {
    id: 'quote_proverbs_hands',
    authorAm: 'ጠቢቡ ሰሎሞን',
    authorEn: 'King Solomon the Wise',
    sourceAm: 'መጽሐፈ ምሳሌ ፲፥፬',
    sourceEn: 'Proverbs 10:4',
    quoteAm: 'እጁ የላላ ሰው ድሃ ይሆናል፤ የታታሪዎች እጅ ግን ባለጠጋ ታደርጋለች።',
    quoteEn: 'Lazy hands make for poverty, but diligent hands bring wealth.',
    themeAm: 'ስለ ትጋትና ታታሪነት',
    themeEn: 'On Diligence and Industry',
    tag: 'work_diligence'
  },
  {
    id: 'quote_basil_trade',
    authorAm: 'ቅዱስ ባስልዮስ ዘቂሳሪያ',
    authorEn: 'St. Basil the Great',
    sourceAm: 'በቀኖናዊ መልእክቱ',
    sourceEn: 'Canonical Letters on Christian Ethics',
    quoteAm: 'የሰው እጅ ለሥራ የተፈጠረ ነው፤ በሥራህ የታከቱትን ደግፍ፤ በሐቀኝነት የምታገኘውን እንጀራ ከድሆች ጋር በደስታ ተካፈል።',
    quoteEn: 'Human hands were created for labor; support the weary through your work, and share your honestly earned bread with joy.',
    themeAm: 'ስለ መረዳዳትና ፍትሐዊ ግብይት',
    themeEn: 'On Mutual Aid and Honest Sustenance',
    tag: 'charity_love'
  },
  {
    id: 'quote_yared_blessing',
    authorAm: 'ቅዱስ ያሬድ ሊቀ ማኅሌት',
    authorEn: 'St. Yared of Aksum',
    sourceAm: 'ጾመ ድጓ — ዘዘመነ ማኅሌት',
    sourceEn: 'Tsome Digua — Liturgical Hymn',
    quoteAm: 'እግዚአብሔር የድካምህን ፍሬ ይባርካል፤ በቅን ልብ የሚዘሩ በደስታ ያጭዳሉ፤ የተባረከች ምድርም እህሏን በወቅቱ ትሰጣለች።',
    quoteEn: 'God blesses the fruit of your labor; those who sow with an upright heart shall reap with joy, and the blessed earth shall yield its grain in due season.',
    themeAm: 'ስለ እግዚአብሔር በረከትና ተስፋ',
    themeEn: 'On Divine Blessing and Harvest of Joy',
    tag: 'faith_perseverance'
  },
  {
    id: 'quote_giyorgis_truth',
    authorAm: 'አባ ጊዮርጊስ ዘጋስጫ',
    authorEn: 'Abba Giyorgis of Gascha (14th Century)',
    sourceAm: 'መጽሐፈ ምሥጢር (Book of Mystery)',
    sourceEn: 'Metsihafe Mestir',
    quoteAm: 'በእምነት የጸና ሰው በሥራውና በንግዱ ሁሉ ታማኝ ነው፤ የልቡ ሚዛን አይዛነፍም፤ ቃሉም እውነት ነው። በሐሰት የሚገኝ ትርፍ ነፋስ እንደሚበትነው ገለባ ነው።',
    quoteEn: 'One steadfast in faith remains honest in all work and commerce; the balance of their heart never tilts, and their word is truth. Profit gained by deceit is like chaff scattered by the wind.',
    themeAm: 'ስለ እውነተኛ ሚዛንና ሐቀኝነት',
    themeEn: 'On True Balances and Integrity',
    tag: 'honesty_integrity'
  },
  {
    id: 'quote_sirach_faith',
    authorAm: 'መጽሐፈ ሲራክ',
    authorEn: 'Wisdom of Sirach',
    sourceAm: 'መጽሐፈ ሲራክ ፲፩፥፳፩',
    sourceEn: 'Sirach 11:21',
    quoteAm: 'በኃጢአተኛ ሥራ አትደነቅ፤ በእግዚአብሔር ታመን፤ በሥራህም ጽና፤ በአንድ ጊዜ ድሃውን ማክበር በእግዚአብሔር ፊት ቀላል ነውና።',
    quoteEn: 'Do not marvel at the works of sinners, but trust in the Lord and persevere in your labor; for it is easy in the eyes of the Lord to enrich the poor suddenly.',
    themeAm: 'ስለ ጽናትና እምነት',
    themeEn: 'On Perseverance and Steadfast Faith',
    tag: 'faith_perseverance'
  },
  {
    id: 'quote_paul_colossians',
    authorAm: 'ሐዋርያው ቅዱስ ጳውሎስ',
    authorEn: 'Holy Apostle Paul',
    sourceAm: 'ወደ ቆላስይስ ሰዎች ፫፥፳፫',
    sourceEn: 'Colossians 3:23',
    quoteAm: 'የምታደርጉትን ሁሉ ለሰው ሳይሆን ለጌታ እንደምታደርጉ በትጋትና በሙሉ ልብ አድርጉት።',
    quoteEn: 'Whatever you do, work at it with all your heart, as working for the Lord, not for human masters.',
    themeAm: 'ለእግዚአብሔር ክብር ስለ መሥራት',
    themeEn: 'Working with Wholehearted Devotion',
    tag: 'work_diligence'
  },
  {
    id: 'quote_psalm_labor',
    authorAm: 'ቅዱስ ዳዊት ነቢይ',
    authorEn: 'Prophet King David',
    sourceAm: 'መዝሙረ ዳዊት ፻፳፯፥፪',
    sourceEn: 'Psalm 128:2',
    quoteAm: 'የእጅህን ድካም ትበላለህ፤ ምስጉን ነህ መልካምም ይሆንልሃል።',
    quoteEn: 'You will eat the fruit of your labor; blessings and prosperity will be yours.',
    themeAm: 'ስለ ቅን ድካም ፍሬ',
    themeEn: 'The Joyful Fruit of Upright Labor',
    tag: 'work_diligence'
  },
  {
    id: 'quote_athanasius_walk',
    authorAm: 'ቅዱስ አትናቴዎስ ሐዋርያዊ',
    authorEn: 'St. Athanasius the Apostolic',
    sourceAm: 'ድርሳነ ሃይማኖት',
    sourceEn: 'Discourse on Life and Faith',
    quoteAm: 'ቀንህን በምስጋና ጀምር፤ ሥራህንም በቅንነት ፈጽም፤ እግዚአብሔር የታማኞችን እርምጃ በጸጋው ያጸናልና።',
    quoteEn: 'Begin your day with thanksgiving and perform your work with integrity; for the Lord confirms the footsteps of the faithful by His grace.',
    themeAm: 'ስለ ሰላምና የማለዳ ጸጋ',
    themeEn: 'Morning Grace and Steadfast Steps',
    tag: 'peace_wisdom'
  },
  {
    id: 'quote_proverbs_balance',
    authorAm: 'መጽሐፈ ምሳሌ',
    authorEn: 'Book of Proverbs',
    sourceAm: 'መጽሐፈ ምሳሌ ፲፩፥፩',
    sourceEn: 'Proverbs 11:1',
    quoteAm: 'የሽንገላ ሚዛን በእግዚአብሔር ፊት ርኩስ ነው፤ እውነተኛ ሚዛን ግን ደስ ያሰኘዋል።',
    quoteEn: 'The Lord detests dishonest scales, but accurate weights find favor with him.',
    themeAm: 'ስለ ንግድ ሥነ-ምግባር',
    themeEn: 'Ethical Trade and Just Measures',
    tag: 'honesty_integrity'
  }
];

/**
 * Returns the spiritual quote for today deterministically based on date,
 * ensuring all users on a given day see the same uplifting word.
 */
export function getDailySpiritualQuote(): SpiritualQuote {
  const now = new Date();
  // Use day of year or day of month
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - startOfYear.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  
  const index = Math.abs(dayOfYear) % SPIRITUAL_QUOTES.length;
  return SPIRITUAL_QUOTES[index];
}
