export type AstrologerVoice = {
  id: string;
  name: string;
  title: string;
  gender: "male" | "female" | "neutral";
  description: Record<"en" | "ne" | "hi", string>;
};

export const ASTROLOGER_VOICES: AstrologerVoice[] = [
  {
    id: "onyx",
    name: "Acharya Dev",
    title: "Master Astrologer",
    gender: "male",
    description: {
      en: "Deep, authoritative & wise male tone",
      ne: "गहिरो, गम्भीर र विद्वान पुरुष स्वर",
      hi: "गहरा, गंभीर और ज्ञानी पुरुष स्वर",
    },
  },
  {
    id: "ash",
    name: "Acharya Rishi",
    title: "Vedic Scholar",
    gender: "male",
    description: {
      en: "Clear, authentic & tranquil male tone",
      ne: "स्पष्ट, प्रामाणिक र शान्त पुरुष स्वर",
      hi: "स्पष्ट, प्रामाणिक और शांत पुरुष स्वर",
    },
  },
  {
    id: "sage",
    name: "Guru Sage",
    title: "Jyotish Vidushi",
    gender: "female",
    description: {
      en: "Serene, insightful female tone",
      ne: "शान्त, ज्ञानपूर्ण महिला स्वर",
      hi: "शांत, ज्ञानपूर्ण महिला स्वर",
    },
  },
  {
    id: "coral",
    name: "Devi Coral",
    title: "Celestial Mystic",
    gender: "female",
    description: {
      en: "Warm, empathetic & melodic female tone",
      ne: "न्यानो, आत्मीय र मधुर महिला स्वर",
      hi: "सौम्य, आत्मीय और मधुर महिला स्वर",
    },
  },
  {
    id: "echo",
    name: "Acharya Echo",
    title: "Resonant Orator",
    gender: "male",
    description: {
      en: "Resonant, powerful male voice",
      ne: "गुञ्जायमान र शक्तिशाली पुरुष स्वर",
      hi: "गूंजता और शक्तिशाली पुरुष स्वर",
    },
  },
  {
    id: "alloy",
    name: "Guru Alloy",
    title: "Harmonious Guide",
    gender: "neutral",
    description: {
      en: "Balanced, clear & precise tone",
      ne: "संतुलित, स्पष्ट र सटीक स्वर",
      hi: "संतुलित, स्पष्ट और सटीक स्वर",
    },
  },
  {
    id: "shimmer",
    name: "Devi Shimmer",
    title: "Divine Voice",
    gender: "female",
    description: {
      en: "Soft, graceful female voice",
      ne: "कोमल र सुन्दर महिला स्वर",
      hi: "कोमल और सुंदर महिला स्वर",
    },
  },
  {
    id: "ballad",
    name: "Guru Ballad",
    title: "Narrative Seer",
    gender: "male",
    description: {
      en: "Warm, storytelling male voice",
      ne: "कथावाचक न्यानो पुरुष स्वर",
      hi: "कथावाचक सौम्य पुरुष स्वर",
    },
  },
  {
    id: "verse",
    name: "Acharya Verse",
    title: "Expressive Guru",
    gender: "male",
    description: {
      en: "Expressive & dynamic male voice",
      ne: "अभिव्यक्तिपूर्ण र गतिशील पुरुष स्वर",
      hi: "अभिव्यक्तिपूर्ण और गतिशील पुरुष स्वर",
    },
  },
];
