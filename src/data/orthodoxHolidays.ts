export interface OrthodoxHolidayEvent {
  id: string;
  title: string;
  titleAm: string;
  titleOm?: string;
  titleTi?: string;
  type: 'fast' | 'major_feast' | 'feast' | 'memorial';
  classification: 'Seven Canonical Fasts (ሰባቱ አጽዋማት)' | 'Nine Major Lord’s Feasts (ዘጠኙ ዐበይት በዓላት)' | 'Nine Minor Feasts (ዘጠኙ ንኡሳን በዓላት)' | 'Feasts of the Virgin Mary & Saints';
  ethiopianDate: string;
  ethiopianDateAm: string;
  gregorianDateString: string;
  seasonAm: string;
  seasonEn: string;
  status: 'upcoming' | 'ongoing' | 'annual';
  durationDays?: number;
  fastingDiscipline?: {
    isFasting: boolean;
    hoursOfAbstinence: string;
    foodRulesAm: string;
    foodRulesEn: string;
    canonicalCitation: string;
  };
  scriptureReferences: string[];
  summaryAm: string;
  summaryEn: string;
  spiritualMeaningAm: string;
  spiritualMeaningEn: string;
  liturgicalHymnGeEz: string;
  liturgicalHymnTranslation: string;
  charitableAndEconomicDuties: {
    titleAm: string;
    descriptionAm: string;
    descriptionEn: string;
  };
}

export const UPCOMING_ORTHODOX_EVENTS: OrthodoxHolidayEvent[] = [
  {
    id: 'fast-of-the-prophets',
    title: "Fast of the Prophets (Advent / Tsome Nebiyat)",
    titleAm: "ጾመ ነቢያት (የገና / የልደት ጾም)",
    titleOm: "Sooma Raajotaa (Sooma Qillee)",
    titleTi: "ጾመ ነቢያት (ናይ ልደት ጾም)",
    type: 'fast',
    classification: 'Seven Canonical Fasts (ሰባቱ አጽዋማት)',
    ethiopianDate: "Hidar 15 - Tahsas 28",
    ethiopianDateAm: "ኅዳር ፲፭ - ታኅሣሥ ፳፰",
    gregorianDateString: "Nov 24 – Jan 6",
    seasonAm: "ዘመነ ስብከት / ዘመነ ነቢያት",
    seasonEn: "Season of Prophecy & Advent",
    status: 'upcoming',
    durationDays: 44,
    fastingDiscipline: {
      isFasting: true,
      hoursOfAbstinence: "እስከ ፱ (9) ሰዓት (3:00 PM) ጥሉላት ምግብን መከልከል",
      foodRulesAm: "ከሥጋ፣ ከወተት፣ ከቅቤና ከእንቁላል ፍጹም መከልከል፤ እህል፣ አትክልት፣ ጥራጥሬና የቅባት እህሎችን መመገብ።",
      foodRulesEn: "Strict abstinence from all animal and dairy products (meat, milk, butter, eggs). Vegan grains, legumes, pulses, fruits and vegetables.",
      canonicalCitation: "ፍትሐ ነገሥት አንቀጽ ፲፭ (Fetha Negest Section 15 on Canonical Fasts)"
    },
    scriptureReferences: [
      "ኢሳይያስ ፯፥፲፬ (Isaiah 7:14)",
      "ኢሳይያስ ፱፥፮ (Isaiah 9:6)",
      "ሚክያስ ፭፥፪ (Micah 5:2)",
      "ገላትያ ፬፥፬-፭ (Galatians 4:4-5)"
    ],
    summaryAm: "የክርስቶስን ልደት በመጠባበቅ ነቢያት የተነበዩት የድኅነት ተስፋ እንዲፈጸም የሚጾም ፵፬ (44) ቀናት የሚፈጅ ታላቅ የአዋጅ ጾም ነው።",
    summaryEn: "A canonical 44-day fast observed in commemoration of the prophecies concerning the Incarnation of our Lord and Savior Jesus Christ.",
    spiritualMeaningAm: "ነቢያት የመድኃኒታችንን መገለጥ በናፍቆት እንደተጠባበቁት ሁሉ፣ ምዕመናን ልባቸውን በንስሐ፣ በጸሎት፣ በሰላምና በቅድስና ለጌታ ልደት እንዲያዘጋጁ ያስተምራል።",
    spiritualMeaningEn: "Just as the Old Testament prophets eagerly longed and fasted for the Redeemer's coming, believers prepare their hearts through repentance, prayer, and humility for the Nativity.",
    liturgicalHymnGeEz: "«ይትፌሣሕ ሰማይ ወትትሐሠይ ምድር በልደቱ ለክርስቶስ፤ ወይሰግዱ ሎቱ ነገሥት ወይትቀነዩ ሎቱ አሕዛብ።»",
    liturgicalHymnTranslation: "Let the heavens rejoice and the earth be glad at the birth of Christ; kings shall bow before Him and nations shall serve Him.",
    charitableAndEconomicDuties: {
      titleAm: "የጾም ወቅት ኢኮኖሚያዊና ማኅበራዊ ኃላፊነት",
      descriptionAm: "በጾም ወቅት የተቆጠበውን ወጪ ለተራቡ፣ ለዕራቁት እና በችግር ለተጎዱ ወገኖች ማካፈል፤ አምራቾችና ነጋዴዎች ፍትሐዊ ዋጋ ማስጠበቅ፤ እርስ በእርስ መረዳዳት።",
      descriptionEn: "Reallocating fasting savings toward direct almsgiving for the poor, maintaining ethical, non-exploitative pricing on legumes and fasting foods, and mutual economic solidarity."
    }
  },
  {
    id: 'saint-mary-zion',
    title: "Feast of Saint Mary of Zion (Hidar Tsion)",
    titleAm: "በዓለ ጽዮን ማርያም (ኅዳር ጽዮን - አክሱም)",
    titleOm: "Ayyaana Qulqulleettii Maariyaam Tsiyoon",
    titleTi: "በዓለ ጽዮን ማርያም (ሕዳር ጽዮን)",
    type: 'feast',
    classification: 'Feasts of the Virgin Mary & Saints',
    ethiopianDate: "Hidar 21",
    ethiopianDateAm: "ኅዳር ፳፩",
    gregorianDateString: "Nov 30",
    seasonAm: "የጽዮን በዓል",
    seasonEn: "Feast of Zion",
    status: 'upcoming',
    scriptureReferences: [
      "መዝሙር ፻፴፩፥፲፫ (Psalm 132:13)",
      "ራእየ ዮሐንስ ፲፩፥፲፱ (Revelation 11:19)",
      "ሉቃስ ፩፥፵፮-፶፭ (Luke 1:46-55)"
    ],
    summaryAm: "የቃል ኪዳኑ ታቦት ወደ ኢትዮጵያ ወደ ቅድስት አክሱም ጽዮን የገባበት እና የመጀመሪያዋ የክርስትና ቤተ መቅደስ የታነጸችበት ታላቅ ታሪካዊና ሃይማኖታዊ በዓል።",
    summaryEn: "Celebration of the Ark of the Covenant resting in Holy Aksum Zion and the consecration of the first Christian cathedral in Ethiopia.",
    spiritualMeaningAm: "እመቤታችን ቅድስት ድንግል ማርያም እውነተኛይቱ የሕያው እግዚአብሔር ማደሪያ ታቦት መሆኗ የሚመሰከርበት እና የኢትዮጵያ ሕዝብ ጽኑ እምነት የሚታደስበት በዓል ነው።",
    spiritualMeaningEn: "Proclaims the Holy Virgin as the true spiritual Ark of the New Covenant, reaffirming Ethiopia's enduring heritage and deep Marian devotion.",
    liturgicalHymnGeEz: "«ተፈሥሒ ኦ ድንግል ንጽሕት ዘአልባቲ ርስሐት፤ ታቦተ ጽዮን ቅድስት መንፈሳዊት።»",
    liturgicalHymnTranslation: "Rejoice, O pure and immaculate Virgin; the spiritual and holy Ark of Zion.",
    charitableAndEconomicDuties: {
      titleAm: "የእንግዳ አቀባበል እና የአገር ውስጥ ንግድ ትስስር",
      descriptionAm: "ወደ አክሱም የሚጓዙ ምዕመናንን በእንግዳ ተቀባይነት ማስተናገድ፤ የአገር በቀል የእጅ ጥበባት፣ የሃይማኖት አልባሳትና ቅርሶችን ማበረታታት።",
      descriptionEn: "Hospitality to pilgrims, patronizing ethical local artisans, traditional weavers, and community pilgrimage support."
    }
  },
  {
    id: 'nativity-of-christ-genna',
    title: "Feast of the Nativity (Genna / Ethiopian Christmas)",
    titleAm: "በዓለ ልደት (ገና / የጌታችን የኢየሱስ ክርስቶስ ልደት)",
    titleOm: "Ayyaana Qillee / Dhaloota Gooftaa",
    titleTi: "በዓለ ልደት (ገና)",
    type: 'major_feast',
    classification: 'Nine Major Lord’s Feasts (ዘጠኙ ዐበይት በዓላት)',
    ethiopianDate: "Tahsas 28 / 29",
    ethiopianDateAm: "ታኅሣሥ ፳፰ / ፳፱",
    gregorianDateString: "Jan 7",
    seasonAm: "ዘመነ ልደት",
    seasonEn: "Nativity Season",
    status: 'upcoming',
    scriptureReferences: [
      "ሉቃስ ፪፥፩-፳ (Luke 2:1-20)",
      "ማቴዎስ ፩፥፲፰-፳፭ (Matthew 1:18-25)",
      "ዮሐንስ ፩፥፩-፲፬ (John 1:1-14)"
    ],
    summaryAm: "ከዘጠኙ ዐበይት የጌታ በዓላት አንዱ፤ አምላካችን ሰው ሆኖ በቤተልሔም በግርግም የተወለደበት የዓለም ድኅነት የተበሰረበት ታላቅ በዓል።",
    summaryEn: "One of the Nine Major Feasts of the Lord celebrating the Incarnation and Nativity of Jesus Christ in Bethlehem for the salvation of humankind.",
    spiritualMeaningAm: "ፈጣሪ የሰውን ባሕርይ ተዋሕዶ ትሕትናን አስተማረን፤ ጨለማው በብርሃን ተተካ፤ ሰላም በሰማይና በምድር ጸና።",
    spiritualMeaningEn: "The Creator assumed human nature in profound humility, bringing divine light to disperse spiritual darkness and granting reconciliation to all mankind.",
    liturgicalHymnGeEz: "«ስብሐት ለእግዚአብሔር በሰማያት ወሰላም በምድር ሥምረቱ ለሰብእ። ዮም ተወልደ መድኅን ዘውእቱ ክርስቶስ እግዚእ በሀገረ ዳዊት።»",
    liturgicalHymnTranslation: "Glory to God in the highest, and on earth peace, good will toward men. For unto you is born this day in the city of David a Savior, which is Christ the Lord.",
    charitableAndEconomicDuties: {
      titleAm: "የፍቅር ማዕድ እና ፍትሐዊ የገበያ ግብይት",
      descriptionAm: "ለድሆች ማዕድ ማጋራት፣ ልብስ ማልበስ፤ በገበያ ላይ ሰው ሠራሽ የዋጋ ጭማሪ አለማድረግ፤ ፍትሐዊ የአቅርቦት ሰንሰለት መዘርጋት።",
      descriptionEn: "Hosting shared community feasts for the vulnerable, providing clothes for orphaned and underprivileged youth, and rejecting price-gouging on holiday goods."
    }
  },
  {
    id: 'epiphany-timket',
    title: "The Holy Epiphany (Timket - Baptism of Christ)",
    titleAm: "በዓለ ጥምቀት (የጌታችን መጠመቅ በዮርዳኖስ)",
    titleOm: "Ayyaana Cuuphaa (Timqat)",
    titleTi: "በዓለ ጥምቀት (ናይ ጎይታና ጥምቀት)",
    type: 'major_feast',
    classification: 'Nine Major Lord’s Feasts (ዘጠኙ ዐበይት በዓላት)',
    ethiopianDate: "Tir 11",
    ethiopianDateAm: "ጥር ፲፩",
    gregorianDateString: "Jan 19",
    seasonAm: "ዘመነ አስተርእዮ",
    seasonEn: "Season of Epiphany & Theophany",
    status: 'upcoming',
    scriptureReferences: [
      "ማቴዎስ ፫፥፲፫-፲፯ (Matthew 3:13-17)",
      "ማርቆስ ፩፥፱-፲፩ (Mark 1:9-11)",
      "ሉቃስ ፫፥፳፩-፳፪ (Luke 3:21-22)"
    ],
    summaryAm: "ጌታችን መድኃኒታችን ኢየሱስ ክርስቶስ በዮሐንስ እጅ በዮርዳኖስ ባሕር የተጠመቀበትና ምሥጢረ ሥላሴ በግልጽ የታየበት ታላቅ የጌታ በዓል።",
    summaryEn: "Celebrates the Baptism of Jesus Christ in the Jordan River by Saint John the Baptist, revealing the mystery of the Holy Trinity (Theophany). Inscribed on UNESCO Intangible Cultural Heritage.",
    spiritualMeaningAm: "የሰው ልጅ የልጅነት ክብርን ያገኘበት፤ ውሃ የተቀደሰበት እና በንስሐ ወደ እግዚአብሔር መንግሥት የመቅረብ ጥሪ ነው።",
    spiritualMeaningEn: "Sanctification of waters and humanity receiving divine adoption as children of God through baptism, accompanied by sacred hymns of Saint Yared.",
    liturgicalHymnGeEz: "«እግዚአብሔር ተጠምቀ በማየ ዮርዳኖስ፤ ወአንጽሐ ኃጢአተ ኵሉ ዓለም።»",
    liturgicalHymnTranslation: "The Lord was baptized in the waters of the Jordan, sanctifying the waters and cleansing the sins of the whole world.",
    charitableAndEconomicDuties: {
      titleAm: "የቱሪዝም፣ የእጅ ጥበብ እና የባሕል ኢኮኖሚ ድጋፍ",
      descriptionAm: "የጥበብ ልብሶችን፣ የጧፍና ዕጣን አምራቾችን ማበረታታት፤ የውጭና የአገር ውስጥ ቱሪዝምን በታማኝነትና በቅንነት ማስተናገድ።",
      descriptionEn: "Promoting certified beeswax candles, traditional handwoven fabrics (Tibeb), and fostering honest hospitality in the domestic pilgrimage economy."
    }
  },
  {
    id: 'cana-of-galilee',
    title: "Cana of Galilee (Qana Ze Gelila)",
    titleAm: "ቃና ዘገሊላ (ውሃ ወደ ወይን የተለወጠበት)",
    titleOm: "Qaanaa Zegaliilaa",
    titleTi: "ቃና ዘገሊላ",
    type: 'major_feast',
    classification: 'Nine Minor Feasts (ዘጠኙ ንኡሳን በዓላት)',
    ethiopianDate: "Tir 12",
    ethiopianDateAm: "ጥር ፲፪",
    gregorianDateString: "Jan 20",
    seasonAm: "ዘመነ አስተርእዮ",
    seasonEn: "Season of Epiphany",
    status: 'upcoming',
    scriptureReferences: [
      "ዮሐንስ ፪፥፩-፲፩ (John 2:1-11)"
    ],
    summaryAm: "ጌታችን ኢየሱስ ክርስቶስ በሠርግ ቤት ተገኝቶ የመጀመሪያውን ተአምር የፈጸመበትና ጋብቻን የቀደሰበት የተከበረ በዓል።",
    summaryEn: "Commemorates Christ performing His first public miracle at the Wedding in Cana by turning water into wine, blessing holy matrimony.",
    spiritualMeaningAm: "የክርስቶስ ቸርነትና የእመቤታችን አማላጅነት የታየበት፤ ትዳርና ቤተሰብ በበረከት የተመሠረተበት በዓል ነው።",
    spiritualMeaningEn: "Exemplifies the maternal intercession of the Virgin Mary and sanctifies honorable marriage and family covenant.",
    liturgicalHymnGeEz: "«አርአየ ኃይሎ በቃና ዘገሊላ ወረሰየ ማየ ወይነ፤ ወአምኑ ቦቱ አርዳኢሁ።»",
    liturgicalHymnTranslation: "He manifested His power in Cana of Galilee, turning water into wine; and His disciples believed in Him.",
    charitableAndEconomicDuties: {
      titleAm: "የቤተሰብና የጋብቻ ትስስር ድጋፍ",
      descriptionAm: "አቅመ ደካሞች በክብር እንዲጋቡ ማገዝ፤ ለወጣቶች የሙያና የሥራ ዕድል በመፍጠር ጤናማ ትዳር እንዲመሰረቱ ማስቻል፤ ከከንቱ ብክነት መቆጠብ።",
      descriptionEn: "Assisting disadvantaged couples in forming virtuous households and moderating extravagant wedding expenditures in favor of lasting economic stability."
    }
  },
  {
    id: 'fast-of-nineveh',
    title: "Fast of Nineveh (Tsome Nenewe)",
    titleAm: "ጾመ ነነዌ (የ፫ ቀን የንስሐ ጾም)",
    titleOm: "Sooma Nanawwee",
    titleTi: "ጾመ ነነዌ",
    type: 'fast',
    classification: 'Seven Canonical Fasts (ሰባቱ አጽዋማት)',
    ethiopianDate: "Yekatit (Movable / ተንቀሳቃሽ)",
    ethiopianDateAm: "የካቲት (በባሕረ ሐሳብ ቀመር)",
    gregorianDateString: "Feb 15 – 17 (Approx)",
    seasonAm: "ዘመነ ንስሐ",
    seasonEn: "Season of Repentance",
    status: 'upcoming',
    durationDays: 3,
    fastingDiscipline: {
      isFasting: true,
      hoursOfAbstinence: "እስከ ምሽት ወይም ፱ ሰዓት ጥብቅ ጾምና ሱባኤ",
      foodRulesAm: "ከጥሉላት ሁሉ መራቅ፤ በጸሎትና በስግደት መትጋት።",
      foodRulesEn: "Complete abstinence from animal products with intensified prostrations (Sigdet) and evening fasting hours.",
      canonicalCitation: "ፍትሐ ነገሥት አንቀጽ ፲፭ / መጽሐፈ ዮናስ"
    },
    scriptureReferences: [
      "ዮናስ ፫፥፩-፲ (Jonah 3:1-10)",
      "ማቴዎስ ፲፪፥፴፱-፵፩ (Matthew 12:39-41)"
    ],
    summaryAm: "የነነዌ ሰዎች በነቢዩ ዮናስ ስብከት ንስሐ ገብተው ከመዓት ወደ ምሕረት የተመለሱበትን መታሰቢያ የምናደርግበት የ፫ (3) ቀናት የአዋጅ ጾም ነው።",
    summaryEn: "A 3-day canonical fast commemorating the repentance and deliverance of the people of Nineveh following the preaching of Prophet Jonah.",
    spiritualMeaningAm: "እውነተኛ ንስሐ እና ምጽዋት የእግዚአብሔርን ቁጣ እንደሚያበርድ፣ ሰው ሁሉ ወደ ፈጣሪው እንዲመለስ የሚያስተምር የተቀደሰ ወቅት ነው።",
    spiritualMeaningEn: "A profound call to collective contrition, illustrating that heartfelt repentance and turning away from wickedness evokes divine mercy.",
    liturgicalHymnGeEz: "«ተንሥኡ ንስሐ ንግበር፤ እስመ ቀርበት መንግሥተ ሰማያት።»",
    liturgicalHymnTranslation: "Arise, let us repent; for the Kingdom of Heaven is at hand.",
    charitableAndEconomicDuties: {
      titleAm: "ዕዳ ይቅር መባባል እና ኢኮኖሚያዊ እርቅ",
      descriptionAm: "በንግድና በሥራ መካከል የተፈጠሩ አለመግባባቶችን በሰላም መፍታት፤ ለተበዳዮች ምሕረት ማድረግ፤ ድሆችን መመገብ።",
      descriptionEn: "Practicing debt forgiveness where appropriate, resolving commercial disputes amicably, and providing subsistence food relief to the indigent."
    }
  },
  {
    id: 'great-lent-hudadi',
    title: "Great Lent (Hudadi / Abiy Tsom)",
    titleAm: "ዐቢይ ጾም (ሁዳዴ - ፶፭ ቀናት)",
    titleOm: "Sooma Guddaa (Hudadii)",
    titleTi: "ዓቢይ ጾም (ሁዳዴ)",
    type: 'fast',
    classification: 'Seven Canonical Fasts (ሰባቱ አጽዋማት)',
    ethiopianDate: "Yekatit / Megabit - Miyazya",
    ethiopianDateAm: "የካቲት / መጋቢት - ሚያዝያ",
    gregorianDateString: "March – April (55 Days)",
    seasonAm: "ዘመነ ሁዳዴ",
    seasonEn: "Great Lent & Passion Week",
    status: 'upcoming',
    durationDays: 55,
    fastingDiscipline: {
      isFasting: true,
      hoursOfAbstinence: "በየዕለቱ እስከ ፱ እና ፲፩ ሰዓት ጥብቅ ጾም፤ በሰሙነ ሕማማት ፍጹም ጾም",
      foodRulesAm: "ከእንስሳት ተዋጽኦ ሁሉ ፍጹም መከልከል፤ በሰሙነ ሕማማት እህልና ውሃ ብቻ መመገብ።",
      foodRulesEn: "Strict vegan fasting, no fish, daily abstinence until 3:00 PM or 5:00 PM, culminant in Holy Passion Week (Semune Himamat).",
      canonicalCitation: "ፍትሐ ነገሥት አንቀጽ ፲፭ እና የሐዋርያት ዲድስቅልያ"
    },
    scriptureReferences: [
      "ማቴዎስ ፬፥፩-፲፩ (Matthew 4:1-11)",
      "ኢዩኤል ፪፥፲፪-፲፯ (Joel 2:12-17)",
      "ኢሳይያስ ፶፰፥፮-፯ (Isaiah 58:6-7)"
    ],
    summaryAm: "ጌታችን ኢየሱስ ክርስቶስ በገዳመ ቆሮንቶስ የጾመውን ፵ ቀን እና ሰሙነ ሕማማትን ጨምሮ ፶፭ ቀናት የሚጾም የታላላቅ አጽዋማት ራስ የሆነ ጾም ነው።",
    summaryEn: "The premier and most solemn canonical fast of 55 days, commemorating our Lord’s 40-day wilderness fast, pre-Lent, and Passion Week.",
    spiritualMeaningAm: "ሥጋዊ ፍላጎትን ለመንፈሳዊ ድል ማገዛት፣ ራስን መመርመር፣ የስቅለትና የሞቱን መከራ በማሰብ ለትንሣኤው ክብር መዘጋጀት።",
    spiritualMeaningEn: "Disciplining bodily passions through ascetic prayer and prostration, spiritually journeying toward the Cross and Holy Pascha.",
    liturgicalHymnGeEz: "«ጾምሰ ትፌውስ ቍስለ ነፍስ፤ ወታበርህ አዕይንተ ልብ።»",
    liturgicalHymnTranslation: "Fasting heals the wounds of the soul and enlightens the eyes of the heart.",
    charitableAndEconomicDuties: {
      titleAm: "የእውነተኛ ጾም መገለጫ — ምጽዋትና ፍትሕ",
      descriptionAm: "«የተራበውን ታበላ ዘንድ፥ የተጨነቁትን አርነት ታወጣ ዘንድ... የተመረጠ ጾም ይህ አይደለምን?» (ኢሳ ፶፰)። የፍትሐዊ ንግድና የበጎ አድራጎት ከፍተኛው ወቅት።",
      descriptionEn: "Isaiah 58: 'Is this not the fast that I have chosen: to loose the bonds of wickedness and share bread with the hungry?' Active stewardship."
    }
  },
  {
    id: 'fasika-resurrection',
    title: "Holy Pascha / Resurrection (Tinsae / Fasika)",
    titleAm: "በዓለ ትንሣኤ (ፋሲካ - የጌታችን ትንሣኤ)",
    titleOm: "Ayyaana Du'aa Ka'uu (Faasikaa)",
    titleTi: "በዓለ ትንሣኤ (ፋሲካ)",
    type: 'major_feast',
    classification: 'Nine Major Lord’s Feasts (ዘጠኙ ዐበይት በዓላት)',
    ethiopianDate: "Miyazya (Movable / ተንቀሳቃሽ)",
    ethiopianDateAm: "ሚያዝያ (በባሕረ ሐሳብ ቀመር)",
    gregorianDateString: "April / May",
    seasonAm: "ዘመነ ትንሣኤ (ሃምሳ ዕለታት)",
    seasonEn: "Season of Holy Pascha (Pentecost / 50 Days)",
    status: 'annual',
    scriptureReferences: [
      "ማቴዎስ ፳፰፥፩-፲ (Matthew 28:1-10)",
      "፩ኛ ቆሮንቶስ ፲፭፥፳-፳፪ (1 Corinthians 15:20-22)",
      "ዮሐንስ ፳፥፩-፲፰ (John 20:1-18)"
    ],
    summaryAm: "የክርስቲያኖች ታላቁ የድል በዓል፤ ጌታችን ሞትን ድል አድርጎ የተነሳበት፣ ዲያብሎስ የተሸነፈበትና የዘላለም ሕይወት የታወጀበት ታላቁ በዓል።",
    summaryEn: "The Feast of Feasts and Solemnity of Solemnities: Celebrating the glorious bodily Resurrection of Jesus Christ from the dead, conquering sin and death.",
    spiritualMeaningAm: "ሞት ተሸነፈ፣ ተስፋ ለሰው ልጆች ዳግም በራ፤ ክርስቶስ አዲሱን ሕይወትና የዘላለም ሰላም ሰጠን።",
    spiritualMeaningEn: "The resurrection inaugurates the new creation, giving believers victory over death, assurance of eternal life, and spiritual joy.",
    liturgicalHymnGeEz: "«ክርስቶስ ተንሥአ እሙታን፤ በዐቢይ ኃይል ወሥልጣን፤ አሰሮ ለሰይጣን፤ አግአዞ ለአዳም፤ ሰላም፤ እምይእዜሰ ኮነ ፍሥሐ ወሰላም።»",
    liturgicalHymnTranslation: "Christ is risen from the dead with great power and authority; He bound Satan, set Adam free, peace be with you; henceforth let there be joy and peace.",
    charitableAndEconomicDuties: {
      titleAm: "የትንሣኤ ፍሥሐ ለሁሉም",
      descriptionAm: "በበዓሉ ወቅት ማንም የተራበና የተከፋ እንዳይኖር የተቸገሩ ቤተሰቦችን በገንዘብና በምግብ መደገፍ፤ የፍቅርና የይቅርታ ድልድይ መሆን።",
      descriptionEn: "Universal community inclusion: Ensuring no impoverished family is deprived of festive food and clothing, exemplifying Paschal generosity."
    }
  }
];

export const MONTHLY_ORTHODOX_MEMORIALS = [
  { day: 7, nameAm: 'ሥላሴ (Holy Trinity)', nameEn: 'Holy Trinity' },
  { day: 12, nameAm: 'ቅዱስ ሚካኤል (St. Michael)', nameEn: 'Archangel Michael' },
  { day: 19, nameAm: 'ቅዱስ ገብርኤል (St. Gabriel)', nameEn: 'Archangel Gabriel' },
  { day: 21, nameAm: 'እመቤታችን ማርያም (Virgin Mary)', nameEn: 'Saint Mary the Virgin' },
  { day: 23, nameAm: 'ቅዱስ ጊዮርጊስ (St. George)', nameEn: 'Saint George the Martyr' },
  { day: 27, nameAm: 'መድኃኔዓለም (Savior of the World)', nameEn: 'Medhane Alem (Savior of the World)' },
  { day: 29, nameAm: 'በዓለ ወልድ / ልደት (Nativity of the Son)', nameEn: 'Baale Wold (The Son)' }
];
