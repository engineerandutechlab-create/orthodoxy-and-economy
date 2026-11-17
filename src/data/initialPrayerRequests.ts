import { PrayerRequest } from '../types';

export const INITIAL_PRAYER_REQUESTS: PrayerRequest[] = [
  {
    id: 'prayer_01',
    authorName: 'ዮናስ ታደለ',
    authorSpiritualName: 'ገብረ መስቀል',
    isAnonymous: false,
    title: 'Prayer for Blessing on Our New Agro-Processing & Beekeeping Enterprise',
    titleAm: 'ለአዲሱ የግብርናና የንብ ማነብ ሥራችን የእግዚአብሔርን በረከት እንሻለን',
    description: 'በጎጃም አካባቢ ለወጣቶች የሥራ ዕድል የሚፈጥር የተፈጥሮ ማርና የሰም ምርት ማቀነባበሪያ ጀምረናል። እግዚአብሔር አምላክ ሥራችንን እንዲባርክ፣ በታማኝነትና በቅንነት አገልግለን ለብዙዎች በረከት እንድንሆን በጸሎታችሁ አስቡን።',
    category: 'work_business',
    categoryAm: 'ሥራና ንግድ',
    location: 'ባሕር ዳር / ደብረ ማርቆስ',
    parish: 'ደብረ ጽዮን ቅድስት ማርያም',
    prayersCount: 42,
    comments: [
      {
        id: 'c_1',
        authorName: 'ቀሲስ አስፋው',
        authorSpiritualName: 'ወልደ ሩፋኤል',
        commentText: 'እግዚአብሔር አምላክ የልፋታችሁን ፍሬ ይባርክላችሁ። በቅን ልብ ለወገን የምትደክሙትን ሁሉ በረከቱ ይክበበው። አሜን!',
        createdAt: 'ከ2 ሰዓት በፊት'
      },
      {
        id: 'c_2',
        authorName: 'ሰላማዊት',
        commentText: 'በጸሎታችን እናስባችኋለን። መልካም ጅማሬ ነው፤ ቅዱስ ጊዮርጊስ ይጠብቃችሁ።',
        createdAt: 'ከ1 ሰዓት በፊት'
      }
    ],
    createdAt: '2026-11-05T14:30:00Z'
  },
  {
    id: 'prayer_02',
    authorName: 'ምዕመን',
    authorSpiritualName: 'ወለተ ኪዳን',
    isAnonymous: false,
    title: 'Spiritual Healing and Recovery Prayers for our Dear Mother',
    titleAm: 'በሕክምና ላይ ለምትገኘው ውድ እናታችን የፈውስና የጤና ጸሎት',
    description: 'እናታችን ወለተ ኪዳን በጠና ታማ ሆስፒታል ትገኛለች። ፈዋሹ ጌታችን መድኃኒታችን ኢየሱስ ክርስቶስ በቅዱስ ሚካኤል አማላጅነት የጤናውን ጸጋ እንዲያድላት በጸሎታችሁ እንድታስቧት በትሕትና እንጠይቃለን።',
    category: 'health_healing',
    categoryAm: 'ጤናና ፈውስ',
    location: 'አዲስ አበባ',
    parish: 'የካ ሚካኤል ቤተክርስቲያን',
    prayersCount: 68,
    comments: [
      {
        id: 'c_3',
        authorName: 'ዲ/ን ብሩክ',
        commentText: 'ፈዋሽ እግዚአብሔር በቸርነቱ ይማራት፤ ቶሎ ድና ለምስጋና እንድትቆም በጸሎት አብረናችሁ ነን።',
        createdAt: 'ከ3 ሰዓት በፊት'
      }
    ],
    createdAt: '2026-11-05T09:15:00Z'
  },
  {
    id: 'prayer_03',
    authorName: 'ዳዊት መንግሥቱ',
    authorSpiritualName: 'ኃይለ ሚካኤል',
    isAnonymous: false,
    title: 'Divine Guidance & Success for University Graduates Seeking Honest Work',
    titleAm: 'ለዩኒቨርሲቲ ተመራቂዎችና ሥራ ለሚፈልጉ ወጣቶች የጽናትና የበረከት ጸሎት',
    description: 'ትምህርታችንን በምህንድስናና በሶፍትዌር አጠናቀን ወደ ሥራ ዓለም እየገባን ነው። እግዚአብሔር በታማኝነትና በቅን ልብ የምናገለግልበትን የሥራ በር እንዲከፍትልን በጸሎታችሁ ደግፉን።',
    category: 'education_exam',
    categoryAm: 'ትምህርትና ሥራ ፍለጋ',
    location: 'አዲስ አበባ (ቦሌ)',
    parish: 'ቦሌ መድኃኔዓለም ካቴድራል',
    prayersCount: 35,
    comments: [
      {
        id: 'c_4',
        authorName: 'እህት ትዕግሥት',
        commentText: 'እግዚአብሔር በፈቀደው መልካም ሥራ ያገናኛችሁ፤ የታታሪዎችን እጅ ይባርካል!',
        createdAt: 'ከ4 ሰዓት በፊት'
      }
    ],
    createdAt: '2026-11-04T18:20:00Z'
  },
  {
    id: 'prayer_04',
    authorName: 'አባ ወልደ ጊዮርጊስ',
    authorSpiritualName: 'ወልደ ጊዮርጊስ',
    isAnonymous: false,
    title: 'Thanksgiving for Blessed Monastery Harvest & Production Distribution',
    titleAm: 'ስለ ገዳማዊ ምርቶችና የእህል በረከት ማከፋፈል የተደረገ የምስጋና ጸሎት',
    description: 'በዚህ ወር ከገዳማት ያቀረብናቸው የዕጣን፣ የጧፍና የንጹሕ ዘይት አቅርቦቶች ያለ ምንም ችግር በሰላም ለምዕመናን እንዲደርሱ ረድቶናልና ለአምላካችን ክብርና ምስጋና ይሁን።',
    category: 'thanksgiving',
    categoryAm: 'ምስጋና',
    location: 'ደብረ ዳሞ / አክሱም',
    parish: 'ደብረ ዳሞ አቡነ አረጋዊ',
    prayersCount: 54,
    comments: [
      {
        id: 'c_5',
        authorName: 'ተስፋዬ',
        commentText: 'እግዚአብሔር ይመስገን! ገዳማቱንና አባቶቻችንን በበረከት ይጠብቅልን።',
        createdAt: 'ከትናንት በስቲያ'
      }
    ],
    createdAt: '2026-11-03T11:00:00Z'
  },
  {
    id: 'prayer_05',
    authorName: 'አስቴር ከበደ',
    authorSpiritualName: 'ወለተ ማርያም',
    isAnonymous: false,
    title: 'Peace, Unity, and Love in Christian Families and Homes',
    titleAm: 'በክርስቲያናዊ ትዳራችንና በልጆቻችን ማደግ ላይ ፍቅርና ሰላም እንዲሰፍን',
    description: 'በቤታችን ፍቅር፣ መከባበርና እውነተኛ ክርስቲያናዊ አንድነት እንዲጸና፣ ልጆቻችንም በቤተክርስቲያን ሥርዓትና በሥነ-ምግባር ታንጸው እንዲያድጉ በጸሎት አግዙን።',
    category: 'family_peace',
    categoryAm: 'ቤተሰብና ትዳር',
    location: 'ሐዋሳ',
    parish: 'ደብረ ምጥማቅ ቅዱስ ጊዮርጊስ',
    prayersCount: 49,
    comments: [],
    createdAt: '2026-11-02T16:45:00Z'
  }
];
