export interface OrthodoxKnowledgeItem {
  id: string;
  title: string;
  titleAm: string;
  category: 'scripture' | 'canon' | 'theology' | 'calendar_fasts' | 'church_history' | 'economic_ethics';
  authorityLevel: 1 | 2 | 3 | 4; // 1: Scripture & Canon, 2: Approved Dogma, 3: History & Calendar, 4: Stewardship & Educational
  sourceName: string;
  citation: string;
  excerpt: string;
  excerptAm: string;
  tags: string[];
}

export const ORTHODOX_KNOWLEDGE_BASE: OrthodoxKnowledgeItem[] = [
  // LEVEL 1: HOLY SCRIPTURE & CANON
  {
    id: 'scripture_work_01',
    title: 'Diligence and Honest Labor',
    titleAm: 'ታታሪነት እና ታማኝ ድካም',
    category: 'scripture',
    authorityLevel: 1,
    sourceName: 'Holy Bible — New Testament',
    citation: '2 Thessalonians 3:10 / ፪ኛ ወደ ተሰሎንቄ ሰዎች ፫፥፲',
    excerpt: 'For even when we were with you, this we commanded you, that if any would not work, neither should he eat.',
    excerptAm: 'ሊሠራ የማይወድ አይብላ ብለን አዘናችሁ ነበርና። በሥራ ታታሪ ሁኑ፤ በቅንነት ተመላለሱ።',
    tags: ['work', 'diligence', 'labor', 'ስራ', 'ታታሪነት']
  },
  {
    id: 'scripture_commerce_02',
    title: 'Just Balances and Fair Trade',
    titleAm: 'እውነተኛ ሚዛን እና ቅን የንግድ ሥርዓት',
    category: 'scripture',
    authorityLevel: 1,
    sourceName: 'Holy Bible — Old Testament',
    citation: 'Proverbs 11:1 / መጽሐፈ ምሳሌ ፲፩፥፩',
    excerpt: 'A false balance is abomination to the Lord: but a just weight is his delight.',
    excerptAm: 'የሽንገላ ሚዛን በእግዚአብሔር ፊት ርኩስ ነው፤ እውነተኛ ሚዛን ግን ደስ ያሰኘዋል።',
    tags: ['trade', 'fairness', 'marketplace', 'ንግድ', 'ሚዛን', 'ታማኝነት']
  },
  {
    id: 'scripture_wage_03',
    title: 'Fair Wages for Workers',
    titleAm: 'ለሠራተኛ የሚገባውን ደመወዝ በወቅቱ መክፈል',
    category: 'scripture',
    authorityLevel: 1,
    sourceName: 'Holy Bible — Old Testament',
    citation: 'Deuteronomy 24:14-15 / ኦሪት ዘዳግም ፳፬፥፲፬-፲፭',
    excerpt: 'Thou shalt not oppress an hired servant that is poor and needy... At his day thou shalt give him his hire, neither shall the sun go down upon it.',
    excerptAm: 'የተቸገረውንና ድሀውን ምንዳኛ አትበድለው፤ ፀሐይ ሳትገባ ደመወዙን በዕለቱ ስጠው።',
    tags: ['employment', 'wages', 'justice', 'ደመወዝ', 'ሠራተኛ', 'አሠሪ']
  },
  {
    id: 'canon_fetha_negest_01',
    title: 'Canon on Commercial Contracts and Integrity',
    titleAm: 'ፍትሐ ነገሥት አንቀጽ ስለ ሽያጭ፣ ግዢና ውል',
    category: 'canon',
    authorityLevel: 1,
    sourceName: 'ፍትሐ ነገሥት (Fetha Negest — The Law of the Kings)',
    citation: 'ፍትሐ ነገሥት አንቀጽ ፴፫ (Section 33: On Buy and Sell Contracts)',
    excerpt: 'Contracts entered in good faith must be executed without deception. The seller must reveal any hidden defect to the buyer.',
    excerptAm: 'ሽያጭና ግዢ በሁለቱ ፈቃድና በቅንነት የሚጸና ነው። ሻጭ በዕቃው ውስጥ ያለውን እንከንና ጉድለት ሳይደብቅ ለገዢው የመግለጽ ግዴታ አለበት። አታላይነትና አድሎ የተወገዘ ነው።',
    tags: ['canon', 'contracts', 'buyer', 'seller', 'ፍትሐ ነገሥት', 'ውል', 'ንግድ']
  },
  {
    id: 'canon_fasting_rules_02',
    title: 'The Seven Canonical Fasts of the Ethiopian Orthodox Tewahedo Church',
    titleAm: 'ሰባቱ የአዋጅ አጽዋማት ሕግና ሥርዓት',
    category: 'calendar_fasts',
    authorityLevel: 1,
    sourceName: 'ፍትሐ ነገሥት እና የቀኖና መጻሕፍት (Canon Law of Fasting)',
    citation: 'ፍትሐ ነገሥት አንቀጽ ፲፭ (Section 15: On Fasts)',
    excerpt: 'The Church observes seven major fasts: Great Lent (Hudadi/Abiy Tsom), Apostles Fast, Assumption (Filseta), Advent (Sibket/Nebiyat), Nineveh, Wednesday & Friday (Dihnet), and Gahad.',
    excerptAm: 'በኢትዮጵያ ኦርቶዶክስ ተዋሕዶ ቤተክርስቲያን ሰባቱ አጽዋማት፡ ዐቢይ ጾም (ሁዳዴ)፣ ጾመ ሐዋርያት፣ ጾመ ፍልሰታ፣ ጾመ ነቢያት፣ ጾመ ነነዌ፣ ጾመ ድኅነት (ረቡዕና ዓርብ)፣ እና ጾመ ገሃድ ናቸው። ጾም ከምግብ መከልከል ብቻ ሳይሆን ከክፉ ነገር ሁሉ መራቅና ለተራቡ ማካፈል ነው።',
    tags: ['fasting', 'canon', 'lent', 'ጾም', 'አጽዋማት', 'ቀኖና']
  },

  // LEVEL 2: THEOLOGY & PATRISTIC TEACHINGS
  {
    id: 'theology_incarnation_01',
    title: 'Doctrine of the Incarnation (Tewahedo)',
    titleAm: 'ምሥጢረ ሥጋዌ (ተዋሕዶ)',
    category: 'theology',
    authorityLevel: 2,
    sourceName: 'ሃይማኖተ አበው (Haymanote Abew — Faith of the Fathers)',
    citation: 'ሃይማኖተ አበው — ዘቅዱስ ቄርሎስ (St. Cyril of Alexandria)',
    excerpt: 'Word of God took flesh from the Holy Virgin Mary and became Man without confusion, without separation, and without division.',
    excerptAm: 'መለኮትና ትስብእት ያለ መቀላቀል፣ ያለ መለያየትና ያለ መለወጥ በአንድ አካልና በአንድ ባሕርይ ተዋሐዱ።',
    tags: ['theology', 'tewahedo', 'incarnation', 'ተዋሕዶ', 'ሃይማኖት', 'ቄርሎስ']
  },
  {
    id: 'theology_creation_stewardship',
    title: 'Creation and Human Stewardship',
    titleAm: 'ፍጥረት እና የሰው ልጅ የመጋቢነት ኃላፊነት',
    category: 'theology',
    authorityLevel: 2,
    sourceName: 'ተዓምረ ማርያም / ድርሳናት እና ነገረ ሃይማኖት',
    citation: 'ቅዱስ ዮሐንስ አፈወርቅ (St. John Chrysostom on Wealth and Almsgiving)',
    excerpt: 'God gave the earth for all humanity to nurture. Wealth is a trust given by God to be shared with those in need.',
    excerptAm: 'ሀብት የእግዚአብሔር ስጦታ ሲሆን የተሰጠውም ለድሆችና ለተቸገሩት እንድንመጸውትና በታማኝነት እንድንመራው ነው። ባለጸጋ መሆን ኃጢአት አይደለም፤ ፍቅረ ንዋይ ግን የስሕተት ሁሉ ስር ነው።',
    tags: ['wealth', 'stewardship', 'charity', 'ሀብት', 'ምጽዋት', 'መጋቢነት']
  },

  // LEVEL 3: CHURCH HISTORY & ETHIOPIAN CALENDAR (BAHRE HASAB)
  {
    id: 'calendar_bahre_hasab_01',
    title: 'Bahire Hasab — The Ethiopian Orthodox Calendar System',
    titleAm: 'ባሕረ ሐሳብ — የዘመን አቆጣጠር እና የበዓላት ቀመር',
    category: 'calendar_fasts',
    authorityLevel: 3,
    sourceName: 'ባሕረ ሐሳብ (Bahire Hasab Computus by Demetrius of Alexandria)',
    citation: 'የዘመን መቁጠሪያ ቀመር (The Computus of Movable Feasts)',
    excerpt: 'The Ethiopian calendar has 13 months (12 months of 30 days and Pagume of 5 or 6 days). Movable feasts such as Fasika (Easter) and movable fasts are calculated based on the lunar-solar cycle of Metqe and Tinte Qemer.',
    excerptAm: 'የኢትዮጵያ ዘመን አቆጣጠር ፲፫ ወራት ያሉት ሲሆን (፲፪ ወራት በ፴ ቀናት እና ጳጉሜን በ፭ ወይም ፮ ቀናት)። የፋሲካና ሌሎች ተንቀሳቃሽ በዓላትና አጽዋማት በባሕረ ሐሳብ ቀመር በመጥቅዕ እና በዕለተ ቀመር ታስበው ይወጣሉ።',
    tags: ['calendar', 'bahre hasab', 'easter', 'fasika', 'ቀን መቁጠሪያ', 'ባሕረ ሐሳብ', 'ጳጉሜን']
  },
  {
    id: 'history_aksum_02',
    title: 'Introduction of Christianity to Ethiopia',
    titleAm: 'ክርስትና ወደ ኢትዮጵያ የገባበት ታሪክ',
    category: 'church_history',
    authorityLevel: 3,
    sourceName: 'ገድለ አባ ሰላማ ከሣቴ ብርሃን እና የቤተክርስቲያን ታሪክ',
    citation: 'ታሪከ ነገሥት እና የኢ/ኦ/ተ/ቤ ታሪክ',
    excerpt: 'In the 4th century, during the reign of King Ezana and King Saizana, Abba Selama Kesate Birhan (St. Frumentius) consecrated Christianity as the state religion in Aksum.',
    excerptAm: 'በ፬ኛው መቶ ክፍለ ዘመን በንጉሥ ዒዛና እና ሳይዛና ዘመን በአባ ሰላማ ከሣቴ ብርሃን አማካኝነት ክርስትና በአክሱም መንግሥት ይፋዊ እምነት ሆኖ ተቀባይነት አገኘ።',
    tags: ['history', 'aksum', 'selama', 'አክሱም', 'አባ ሰላማ', 'ታሪክ']
  },

  // LEVEL 4: ORTHODOX ECONOMIC STEWARDSHIP & MUTUAL COOPERATION
  {
    id: 'ethics_cooperation_01',
    title: 'Christian Economic Cooperation and Professional Diligence',
    titleAm: 'የኦርቶዶክሳውያን የጋራ ኢኮኖሚ እና የሙያ ታታሪነት መርሆዎች',
    category: 'economic_ethics',
    authorityLevel: 4,
    sourceName: 'Orthodoxy & Economy Platform Ethical Charter',
    citation: 'መመሪያ ፩ — "ንቁ፣ ብቁና ታታሪ ኦርቶዶክስ ዘመኑን ለዋጀ አገልግሎት!"',
    excerpt: 'Faith without works is dead. Orthodox professionals, merchants, importers, and workers are called to support one another in fair, honest, and high-quality commerce.',
    excerptAm: 'እምነት ከሥራ ጋር ሲዋሃድ ፍሬ ያፈራል። ኦርቶዶክሳውያን አሠሪና ሠራተኛ፣ ገዢና ሻጭ፣ አስመጪና አከፋፋይ በታማኝነት ተሳስረው እርስ በርስ በመደጋገፍ የኢኮኖሚ ነፃነትን ማረጋገጥ አለባቸው።',
    tags: ['economy', 'community', 'ethics', 'ኢኮኖሚ', 'ማኅበረሰብ', 'ሥነ-ምግባር']
  }
];
