export interface SubCategory {
  id: string;
  nameAm: string;
  nameEn: string;
  iconName?: string;
  keywords: string[];
}

export interface SuperCategory {
  id: string;
  nameAm: string;
  nameEn: string;
  badgeCount: number;
  iconName: string;
  color: string;
  accentBg: string;
  borderColor: string;
  textColor: string;
  descriptionAm: string;
  descriptionEn: string;
  subcategories: SubCategory[];
}

export const WORK_SECTORS_DATA: SuperCategory[] = [
  {
    id: 'education',
    nameAm: 'ትምህርትና ሥልጠና',
    nameEn: 'Education & Training',
    badgeCount: 6,
    iconName: 'GraduationCap',
    color: '#123B6D',
    accentBg: 'bg-blue-50 text-blue-900 border-blue-200',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-800',
    descriptionAm: 'የአካዳሚክ፣ የቋንቋ፣ የሙያ ሥልጠናና የሰንበት ት/ቤት አስተምህሮ',
    descriptionEn: 'Academic tutoring, language & Ge\'ez mastery, STEM, vocational & liturgical training',
    subcategories: [
      {
        id: 'edu_tutoring',
        nameAm: 'የአካዳሚክና ሳይንስ የግል ትምህርት',
        nameEn: 'Academic Tutoring & STEM',
        keywords: ['tutoring', 'STEM', 'mathematics', 'physics', 'ግል ትምህርት', 'ማቲማቲክስ', 'ሳይንስ']
      },
      {
        id: 'edu_languages',
        nameAm: 'የቋንቋ ትምህርትና ግዕዝ',
        nameEn: "Language Instruction & Ge'ez",
        keywords: ["ge'ez", 'english', 'amharic', 'ቋንቋ', 'ግዕዝ', 'እንግሊዝኛ', 'ትምህርት']
      },
      {
        id: 'edu_vocational',
        nameAm: 'የቴክኒክና ሙያ ሥልጠና',
        nameEn: 'Vocational & Skill Training',
        keywords: ['vocational', 'skills', 'TVET', 'ሙያ', 'ሥልጠና', 'ቴክኒክ']
      },
      {
        id: 'edu_curriculum',
        nameAm: 'የሥርዓተ ትምህርትና ፈተና ዝግጅት',
        nameEn: 'Curriculum & Exam Prep',
        keywords: ['curriculum', 'exam prep', 'matric', 'ፈተና', 'ሥርዓተ ትምህርት']
      },
      {
        id: 'edu_sunday_school',
        nameAm: 'የሰንበት ት/ቤትና አብነት ትምህርት',
        nameEn: 'Ecclesiastical & Sunday School Teaching',
        keywords: ['sunday school', 'church education', 'abnet', 'ሰንበት ትምህርት', 'አብነት', 'ዜማ', 'ቅዳሴ']
      },
      {
        id: 'edu_coaching',
        nameAm: 'የአመራርና የሙያ ማጎልበቻ ሥልጠና',
        nameEn: 'Leadership & Professional Coaching',
        keywords: ['leadership', 'coaching', 'professional growth', 'አመራር', 'ሥልጠና']
      }
    ]
  },
  {
    id: 'construction',
    nameAm: 'ግንባታና እደ-ጥበብ',
    nameEn: 'Construction & Trades',
    badgeCount: 7,
    iconName: 'Hammer',
    color: '#D97706',
    accentBg: 'bg-amber-50 text-amber-900 border-amber-200',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-800',
    descriptionAm: 'ሥነ-ሕንፃ፣ ምህንድስና፣ የኤሌክትሪክ፣ ሳኒተሪ፣ የእንጨትና የብረት ሥራዎች',
    descriptionEn: 'Architectural BIM/CAD, civil engineering, electrical, plumbing, masonry and woodwork',
    subcategories: [
      {
        id: 'const_arch',
        nameAm: 'ሥነ-ሕንፃ፣ አርክቴክቸርና 3D ሞዴሊንግ',
        nameEn: 'Architectural Design & BIM/CAD',
        keywords: ['architecture', '3D modeling', 'AutoCAD', 'BIM', 'አርክቴክቸር', 'ዲዛይን', '3D']
      },
      {
        id: 'const_civil',
        nameAm: 'የሲቪልና መዋቅራዊ ምህንድስና',
        nameEn: 'Civil & Structural Engineering',
        keywords: ['civil engineering', 'structural', 'ኮንስትራክሽን', 'ሲቪል ምህንድስና']
      },
      {
        id: 'const_electrical',
        nameAm: 'የኤሌክትሪክ ዝርጋታና የፀሐይ ብርሃን ኃይል',
        nameEn: 'Electrical & Solar Power',
        keywords: ['electrical', 'solar power', 'wiring', 'ኤሌክትሪክ', 'ሶላር', 'የፀሐይ ብርሃን']
      },
      {
        id: 'const_plumbing',
        nameAm: 'የቧንቧና ሳኒተሪ ሲስተም ዝርጋታ',
        nameEn: 'Plumbing & Sanitary Systems',
        keywords: ['plumbing', 'sanitary', 'water system', 'ቧንቧ', 'ሳኒተሪ']
      },
      {
        id: 'const_masonry',
        nameAm: 'የድንጋይ፣ ጂፕሰምና የሕንፃ ማጠናቀቂያ ሥራ',
        nameEn: 'Masonry, Finishing & Stone Works',
        keywords: ['masonry', 'gypsum', 'finishing', 'tiling', 'ድንጋይ', 'ጂፕሰም', 'ማጠናቀቂያ']
      },
      {
        id: 'const_carpentry',
        nameAm: 'የእንጨት ሥራና ባሕላዊ አናጢነት',
        nameEn: 'Carpentry & Traditional Woodwork',
        keywords: ['carpentry', 'woodwork', 'furniture', 'እንጨት ስራ', 'አናጢነት', 'በር']
      },
      {
        id: 'const_metalwork',
        nameAm: 'የብረት ሥራና ብየዳ',
        nameEn: 'Metalwork & Welding',
        keywords: ['metalwork', 'welding', 'iron work', 'ብረት ስራ', 'ብየዳ', 'ጋሪ']
      }
    ]
  },
  {
    id: 'technology',
    nameAm: 'ቴክኖሎጂና ሶፍትዌር',
    nameEn: 'Technology & IT',
    badgeCount: 7,
    iconName: 'Code',
    color: '#2563EB',
    accentBg: 'bg-indigo-50 text-indigo-900 border-indigo-200',
    borderColor: 'border-indigo-200',
    textColor: 'text-indigo-800',
    descriptionAm: 'የሞባይልና ዌብ ልማት፣ ክላውድ፣ አርቴፊሻል ኢንተለጀንስ፣ ሳይበር ደኅንነትና UI/UX',
    descriptionEn: 'Mobile apps, full-stack web, cloud & DevOps, AI/data, cybersecurity, UI/UX and hardware',
    subcategories: [
      {
        id: 'tech_mobile',
        nameAm: 'የሞባይል መተግበሪያ ልማት',
        nameEn: 'Mobile App Development - Android/iOS',
        keywords: ['mobile app', 'flutter', 'react native', 'android', 'ios', 'ሞባይል መተግበሪያ']
      },
      {
        id: 'tech_web',
        nameAm: 'የድረ-ገጽና ዌብ ሲስተም ልማት',
        nameEn: 'Full-Stack Web Development',
        keywords: ['web development', 'full stack', 'react', 'node', 'ድረ-ገጽ', 'ዌብሳይት']
      },
      {
        id: 'tech_cloud',
        nameAm: 'ክላውድ፣ ሰርቨርና ዴቭኦፕስ',
        nameEn: 'Cloud Architecture & DevOps',
        keywords: ['cloud', 'devops', 'server', 'docker', 'aws', 'ክላውድ', 'ሰርቨር']
      },
      {
        id: 'tech_ai',
        nameAm: 'አርቴፊሻል ኢንተለጀንስና የዳታ ትንተና',
        nameEn: 'AI, Machine Learning & Data Analytics',
        keywords: ['AI', 'machine learning', 'data analytics', 'ዳታ', 'አርቴፊሻል ኢንተለጀንስ']
      },
      {
        id: 'tech_security',
        nameAm: 'የሳይበር ደኅንነትና የአይቲ መሠረተ-ልማት',
        nameEn: 'Cybersecurity & IT Infrastructure',
        keywords: ['cybersecurity', 'network', 'it infrastructure', 'ሳይበር ደኅንነት', 'ኔትወርክ']
      },
      {
        id: 'tech_uiux',
        nameAm: 'የዩአይ/ዩኤክስና የዲጂታል ምርት ዲዛይን',
        nameEn: 'UI/UX & Product Design',
        keywords: ['UI/UX', 'product design', 'figma', 'ዲዛይን', 'ዩአይ/ዩኤክስ']
      },
      {
        id: 'tech_repair',
        nameAm: 'የኮምፒውተርና ኤሌክትሮኒክስ ጥገና',
        nameEn: 'Computer & Hardware Repair',
        keywords: ['hardware repair', 'computer repair', 'ኮምፒውተር ጥገና', 'ኤሌክትሮኒክስ']
      }
    ]
  },
  {
    id: 'healthcare',
    nameAm: 'ጤናና ክብካቤ',
    nameEn: 'Healthcare & Wellbeing',
    badgeCount: 5,
    iconName: 'HeartPulse',
    color: '#059669',
    accentBg: 'bg-emerald-50 text-emerald-900 border-emerald-200',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-800',
    descriptionAm: 'የቤት ውስጥ ነርሲንግ፣ ፊዚዮቴራፒ፣ የእናቶች ጤና፣ ሥነ-ምግብና የቤተሰብ ምክር',
    descriptionEn: 'Home nursing, physiotherapy, maternal-child health, fasting nutrition & Christian counseling',
    subcategories: [
      {
        id: 'health_nursing',
        nameAm: 'የቤት ውስጥ ነርሲንግና የአረጋውያን ክብካቤ',
        nameEn: 'Home Nursing & Elderly Care',
        keywords: ['nursing', 'elderly care', 'home care', 'ነርሲንግ', 'አረጋውያን ክብካቤ']
      },
      {
        id: 'health_physio',
        nameAm: 'የፊዚዮቴራፒና የተሐድሶ ሕክምና',
        nameEn: 'Physiotherapy & Rehabilitation',
        keywords: ['physiotherapy', 'rehab', 'therapy', 'ፊዚዮቴራፒ', 'ተሐድሶ ሕክምና']
      },
      {
        id: 'health_maternal',
        nameAm: 'የእናቶችና ሕፃናት ጤና ድጋፍ',
        nameEn: 'Maternal & Child Health Consultation',
        keywords: ['maternal health', 'child care', 'pediatric', 'እናቶች', 'ሕፃናት ጤና']
      },
      {
        id: 'health_nutrition',
        nameAm: 'የአመጋገብ ሥነ-ምግብና የጾም ምግብ ማማከር',
        nameEn: 'Dietetics, Fasting & Nutrition',
        keywords: ['nutrition', 'diet', 'fasting food', 'ሥነ-ምግብ', 'የጾም ምግብ', 'አመጋገብ']
      },
      {
        id: 'health_counseling',
        nameAm: 'ክርስቲያናዊ የቤተሰብና ወጣቶች ምክር',
        nameEn: 'Christian Family & Youth Counseling',
        keywords: ['counseling', 'family advice', 'youth', 'ክርስቲያናዊ ምክር', 'ቤተሰብ', 'ወጣቶች']
      }
    ]
  },
  {
    id: 'agriculture',
    nameAm: 'ግብርናና አግሮ-ቢዝነስ',
    nameEn: 'Agriculture & Farming',
    badgeCount: 5,
    iconName: 'Wheat',
    color: '#15803D',
    accentBg: 'bg-green-50 text-green-900 border-green-200',
    borderColor: 'border-green-200',
    textColor: 'text-green-800',
    descriptionAm: 'የጓሮ አትክልት፣ የእንስሳት እርባታ፣ የንብ ማነብ፣ መስኖና የገዳማት ምርት ስርጭት',
    descriptionEn: 'Horticulture, poultry & livestock, apiculture, irrigation systems & monastery harvest',
    subcategories: [
      {
        id: 'agri_horticulture',
        nameAm: 'የጓሮ አትክልትና ከተማ ግብርና',
        nameEn: 'Horticulture & Urban Farming',
        keywords: ['horticulture', 'vegetables', 'urban farming', 'የጓሮ አትክልት', 'ከተማ ግብርና']
      },
      {
        id: 'agri_livestock',
        nameAm: 'የዶሮ፣ ወተትና የከብት እርባታ ማማከር',
        nameEn: 'Poultry, Dairy & Livestock',
        keywords: ['poultry', 'dairy', 'livestock', 'ዶሮ', 'ወተት', 'ከብት እርባታ']
      },
      {
        id: 'agri_apiculture',
        nameAm: 'የንብ ማነብና ንጹሕ ማር ማምረት',
        nameEn: 'Apiculture & Pure Honey Production',
        keywords: ['apiculture', 'honey', 'beeswax', 'ንብ ማነብ', 'ንጹሕ ማር', 'ሰም']
      },
      {
        id: 'agri_irrigation',
        nameAm: 'የመስኖ ሲስተም ዝርጋታና ግሪንሃውስ',
        nameEn: 'Irrigation Systems & Greenhouse',
        keywords: ['irrigation', 'greenhouse', 'drip systems', 'መስኖ', 'ግሪንሃውስ']
      },
      {
        id: 'agri_monastery',
        nameAm: 'የእህል አቅርቦትና የገዳማት ምርት ስርጭት',
        nameEn: 'Grain Supply & Monastery Produce Distribution',
        keywords: ['grain supply', 'monastery produce', 'wheat', 'teff', 'የእህል አቅርቦት', 'የገዳማት ምርት']
      }
    ]
  },
  {
    id: 'media_arts',
    nameAm: 'ሚዲያና ሥነ-ጥበብ',
    nameEn: 'Media & Creative Arts',
    badgeCount: 6,
    iconName: 'Camera',
    color: '#9333EA',
    accentBg: 'bg-purple-50 text-purple-900 border-purple-200',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-800',
    descriptionAm: 'የቪዲዮ ቀረጻ፣ ፎቶግራፍ፣ ግራፊክ ዲዛይን፣ የድምጽ ምህንድስና፣ ማርኬቲንግና አኒሜሽን',
    descriptionEn: 'Videography, professional portraits, graphic design, sound engineering, social media & 2D/3D animation',
    subcategories: [
      {
        id: 'media_video',
        nameAm: 'የቪዲዮ ቀረጻ፣ ክሊፕና ዝግጅት',
        nameEn: 'Videography & Event Video Production',
        keywords: ['videography', 'video editing', 'video production', 'ቪዲዮ ቀረጻ', 'ክሊፕ', 'ኤዲቲንግ']
      },
      {
        id: 'media_photo',
        nameAm: 'ፎቶግራፍና የስቱዲዮ ምስል ዝግጅት',
        nameEn: 'Professional Photography & Portraits',
        keywords: ['photography', 'portraits', 'studio', 'ፎቶግራፍ', 'ስቱዲዮ', 'ምስል']
      },
      {
        id: 'media_graphic',
        nameAm: 'ግራፊክ ዲዛይን፣ ሎጎና ብራንዲንግ',
        nameEn: 'Graphic Design & Branding',
        keywords: ['graphic design', 'logo', 'branding', 'flyer', 'ግራፊክ ዲዛይን', 'ሎጎ', 'ብራንዲንግ']
      },
      {
        id: 'media_sound',
        nameAm: 'የድምጽ ምህንድስና፣ ዜማና ስቱዲዮ ቅንብር',
        nameEn: 'Sound Engineering & Hymn Mixing',
        keywords: ['sound engineering', 'audio mixing', 'hymn', 'ድምጽ ምህንድስና', 'ዜማ', 'ስቱዲዮ']
      },
      {
        id: 'media_social',
        nameAm: 'የማኅበራዊ ሚዲያ ማስተዋወቅና አስተዳደር',
        nameEn: 'Social Media Growth & Marketing',
        keywords: ['social media', 'telegram', 'tiktok', 'marketing', 'ማኅበራዊ ሚዲያ', 'ማስተዋወቅ']
      },
      {
        id: 'media_animation',
        nameAm: 'አኒሜሽንና ሞሽን ግራፊክስ',
        nameEn: '2D/3D Animation & Motion Graphics',
        keywords: ['animation', 'motion graphics', '3d', 'አኒሜሽን', 'ሞሽን ግራፊክስ']
      }
    ]
  },
  {
    id: 'logistics',
    nameAm: 'ትራንስፖርትና ሎጅስቲክስ',
    nameEn: 'Logistics & Transport',
    badgeCount: 5,
    iconName: 'Truck',
    color: '#0284C7',
    accentBg: 'bg-sky-50 text-sky-900 border-sky-200',
    borderColor: 'border-sky-200',
    textColor: 'text-sky-800',
    descriptionAm: 'የዕቃ ማጓጓዝ፣ አሽከርካሪነት፣ የንግሥና ገዳማት ጉዞ፣ ፈጣን መልእክትና መጋዘን',
    descriptionEn: 'Freight & relocation, city chauffeur, pilgrimage & sacred tours, express delivery & warehousing',
    subcategories: [
      {
        id: 'log_freight',
        nameAm: 'የዕቃ ማጓጓዝ፣ ጭነትና የቤት መቀየር',
        nameEn: 'Freight Transport & Home Relocation',
        keywords: ['freight', 'cargo', 'home relocation', 'ጭነት', 'ዕቃ ማጓጓዝ', 'የቤት መቀየር']
      },
      {
        id: 'log_driver',
        nameAm: 'የግልና የድርጅት መኪና አሽከርካሪ',
        nameEn: 'Professional Chauffeur & City Driver',
        keywords: ['driver', 'chauffeur', 'car rental', 'አሽከርካሪ', 'ሾፌር', 'መኪና']
      },
      {
        id: 'log_pilgrimage',
        nameAm: 'የንግሥና የገዳማት ጉዞ ትራንስፖርት',
        nameEn: 'Pilgrimage & Sacred Tour Transport',
        keywords: ['pilgrimage', 'tour', 'monastery travel', 'ንግሥ', 'የገዳማት ጉዞ', 'ትራንስፖርት']
      },
      {
        id: 'log_delivery',
        nameAm: 'ፈጣን የከተማ ውስጥ መልእክትና ፓርሰል ማድረስ',
        nameEn: 'Express Delivery & Courier Service',
        keywords: ['delivery', 'courier', 'express', 'መልእክት', 'ፓርሰል', 'ዴሊቨሪ']
      },
      {
        id: 'log_warehouse',
        nameAm: 'የመጋዘን ኪራይና የንብረት አያያዝ',
        nameEn: 'Warehousing & Inventory Management',
        keywords: ['warehousing', 'storage', 'inventory', 'መጋዘን ኪራይ', 'ንብረት አያያዝ']
      }
    ]
  },
  {
    id: 'sacred_arts',
    nameAm: 'ቅዱሳት ጥበባትና ማኅበራዊ',
    nameEn: 'Sacred Arts & Community',
    badgeCount: 7,
    iconName: 'Sparkles',
    color: '#B45309',
    accentBg: 'bg-amber-100/70 text-amber-950 border-amber-300',
    borderColor: 'border-amber-300',
    textColor: 'text-amber-900',
    descriptionAm: 'ቅዱሳት ሥዕላት፣ ካህናት አልባሳት፣ ብራና፣ ቅርጻቅርጽ፣ ጧፍ/ዕጣን፣ ቆዳና የቤተክርስቲያን ዕቃዎች',
    descriptionEn: 'Orthodox iconography, clergy vestments, vellum manuscripts, sacred carvings, incense/candles & sacred bells',
    subcategories: [
      {
        id: 'sacred_iconography',
        nameAm: 'የኦርቶዶክስ ተዋሕዶ ቅዱሳት ሥዕላት ሥዕል',
        nameEn: 'Traditional Orthodox Iconography',
        keywords: ['iconography', 'icons', 'orthodox art', 'ቅዱሳት ሥዕላት', 'ሥዕል', 'አዶ']
      },
      {
        id: 'sacred_vestments',
        nameAm: 'የካህናት አልባሳት፣ ጥምጥም እና የጥልፍ ስራ',
        nameEn: 'Clergy Vestments & Liturgical Embroidery',
        keywords: ['vestments', 'liturgical robes', 'embroidery', 'የካህናት አልባሳት', 'ጥምጥም', 'ጥልፍ']
      },
      {
        id: 'sacred_manuscripts',
        nameAm: 'የብራና መጻሕፍት ዝግጅት፣ ጽሕፈትና ጥረዛ',
        nameEn: 'Vellum Manuscript Preparation & Binding',
        keywords: ['manuscript', 'vellum', 'binding', 'ብራና መጻሕፍት', 'ጥረዛ', 'ብራና']
      },
      {
        id: 'sacred_carvings',
        nameAm: 'የእጅ መስቀሎች፣ መንበረ ታቦትና መንበር ቅርጻ',
        nameEn: 'Carved Crosses, Menbere Tabot & Lecterns',
        keywords: ['cross carving', 'menbere tabot', 'wood carving', 'የእጅ መስቀል', 'መንበረ ታቦት', 'ቅርጻ']
      },
      {
        id: 'sacred_candles',
        nameAm: 'ንጹሕ የጧፍ፣ ሻማና የዕጣን ዝግጅት',
        nameEn: 'Natural Incense, Pure Beeswax Candles & Twaf',
        keywords: ['incense', 'beeswax candles', 'twaf', 'ጧፍ', 'ዕጣን', 'ሻማ']
      },
      {
        id: 'sacred_leather',
        nameAm: 'የቆዳ ሥራ፣ አክሊልና የአኮቴት ከረጢቶች',
        nameEn: 'Traditional Leather Craft & Book Pouches',
        keywords: ['leather craft', 'pouch', 'crown', 'የቆዳ ስራ', 'አክሊል', 'ከረጢት']
      },
      {
        id: 'sacred_instruments',
        nameAm: 'የደወል፣ ጸናጽል፣ መቋሚያና ከበሮ ስራ',
        nameEn: 'Church Bells, Cymbals & Meqwamiya',
        keywords: ['church bells', 'cymbals', 'meqwamiya', 'kebero', 'ደወል', 'ጸናጽል', 'መቋሚያ', 'ከበሮ']
      }
    ]
  },
  {
    id: 'business_finance',
    nameAm: 'ንግድ፣ ፋይናንስና ሕግ',
    nameEn: 'Business, Finance & Law',
    badgeCount: 8,
    iconName: 'Scale',
    color: '#0F172A',
    accentBg: 'bg-slate-100 text-slate-900 border-slate-300',
    borderColor: 'border-slate-300',
    textColor: 'text-slate-800',
    descriptionAm: 'ኦዲትና ታክስ፣ የሕግ ማማከር፣ ትርጉም፣ ቢዝነስ ፕላን፣ የሰው ኃይልና B2B ትስስር',
    descriptionEn: 'Auditing, legal counsel, translation, feasibility studies, HR screening, B2B procurement & event planning',
    subcategories: [
      {
        id: 'biz_audit',
        nameAm: 'የሒሳብ አያያዝ፣ ዓመታዊ ኦዲትና የግብር አገልግሎት',
        nameEn: 'Auditing, Bookkeeping & Tax',
        keywords: ['auditing', 'bookkeeping', 'tax', 'accounting', 'ሒሳብ አያያዝ', 'ኦዲት', 'ታክስ']
      },
      {
        id: 'biz_legal',
        nameAm: 'የሕግ ማማከር፣ የውል ሰነድና ስምምነት ዝግጅት',
        nameEn: 'Legal Consulting & Contract Drafting',
        keywords: ['legal', 'contracts', 'lawyer', 'የሕግ ማማከር', 'ውል ሰነድ', 'ስምምነት']
      },
      {
        id: 'biz_translation',
        nameAm: 'የሰነድ ትርጉምና የቋንቋ ኤዲቲንግ',
        nameEn: 'Document Translation & Proofreading',
        keywords: ['translation', 'proofreading', 'editing', 'ሰነድ ትርጉም', 'ቋንቋ ኤዲቲንግ']
      },
      {
        id: 'biz_plan',
        nameAm: 'የንግድ እቅድ (Business Plan) እና የፕሮጀክት ጥናት',
        nameEn: 'Business Feasibility & Proposals',
        keywords: ['business plan', 'proposals', 'feasibility', 'የንግድ እቅድ', 'ፕሮጀክት ጥናት']
      },
      {
        id: 'biz_hr',
        nameAm: 'የሰው ኃይል ቅጥርና የባለሙያዎች ማጣራት',
        nameEn: 'HR, Recruitment & Talent Screening',
        keywords: ['HR', 'recruitment', 'talent', 'የሰው ኃይል', 'ቅጥር', 'ማጣራት']
      },
      {
        id: 'biz_b2b',
        nameAm: 'የግዢ አቅርቦትና የB2B ንግድ ትስስር',
        nameEn: 'Procurement, B2B Sourcing & Logistics',
        keywords: ['procurement', 'B2B', 'sourcing', 'የግዢ አቅርቦት', 'B2B ንግድ']
      },
      {
        id: 'biz_admin',
        nameAm: 'የቢሮ አስተዳደር፣ የጽሕፈትና ዳታ ኢንትሪ',
        nameEn: 'Virtual Assistant & Data Entry',
        keywords: ['virtual assistant', 'data entry', 'typing', 'ቢሮ አስተዳደር', 'ዳታ ኢንትሪ', 'ጽሕፈት']
      },
      {
        id: 'biz_events',
        nameAm: 'የመንፈሳዊ ጉባኤያትና ዝግጅቶች አስተባባሪ',
        nameEn: 'Christian Event & Banquet Coordination',
        keywords: ['event planning', 'banquet', 'christian events', 'መንፈሳዊ ጉባኤያት', 'አስተባባሪ', 'ዝግጅት']
      }
    ]
  }
];

// Helper to get flat list of all 54 subcategories with parent supercategory info
export const ALL_54_WORK_SUBCATEGORIES = WORK_SECTORS_DATA.flatMap(superCat => 
  superCat.subcategories.map(sub => ({
    ...sub,
    superCategoryId: superCat.id,
    superCategoryNameAm: superCat.nameAm,
    superCategoryNameEn: superCat.nameEn,
    color: superCat.color
  }))
);

// Map of ID to subcategory object
export const SUBCATEGORIES_MAP = new Map(
  ALL_54_WORK_SUBCATEGORIES.map(sub => [sub.id, sub])
);
