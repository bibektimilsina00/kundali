export type Language = "en" | "ne" | "hi";

export interface TranslationCatalog {
  // Navigation & Branding
  brandName: string;
  vedicAstrology: string;
  home: string;
  freeKundali: string;
  vedicReading: string;
  talkToAstrologer: string;
  selectLanguage: string;

  // Hero & Form
  heroTagline: string;
  heroTitle: string;
  heroSub: string;
  birthDetails: string;
  fullName: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  calculateKundali: string;
  calculating: string;

  // Features
  feature1Title: string;
  feature1Desc: string;
  feature2Title: string;
  feature2Desc: string;
  feature3Title: string;
  feature3Desc: string;

  // Reading Page
  readingHeader: string;
  seekerName: string;
  tabChart: string;
  tabPlanets: string;
  tabDasha: string;
  tabVargas: string;
  tabAnalysis: string;
  tabAskAI: string;
  lagnaAscendant: string;
  moonSign: string;
  nakshatra: string;
  currentDasha: string;
  openLiveVoice: string;
  backToReport: string;

  // Live Voice Workspace
  liveWorkspaceTitle: string;
  listeningState: string;
  thinkingState: string;
  speakingState: string;
  pausedState: string;
  askPlaceholder: string;
  sendQuery: string;
  interrupt: string;
  transcript: string;
  kundaliChart: string;
  exitVoice: string;
  mute: string;
  unmute: string;

  // Reading Page Widgets & Controls
  kundaliChartsTitle: string;
  kundaliChartsSub: string;
  d1LagnaChartTitle: string;
  d9NavamshaChartTitle: string;
  ascendantLabel: string;
  houseLabel: string;
  lordLabel: string;
  tapHouseHelper: string;
  avakhadaTitle: string;
  moonSignLabel: string;
  nakshatraLabel: string;
  nakshatraPadaLabel: string;
  nameSyllableLabel: string;
  ganaLabel: string;
  nadiLabel: string;
  yoniLabel: string;
  varnaElementLabel: string;
  auspiciousTitle: string;
  luckyColors: string;
  unluckyColors: string;
  luckyGemstones: string;
  unluckyGemstones: string;
  planetaryPositionsTitle: string;
  compactLabel: string;
  fullDetailsLabel: string;
  thPlanet: string;
  thSign: string;
  thHouse: string;
  thDegree: string;
  activeDashaTitle: string;
  narrativeAudioTitle: string;
  narrativeAudioSub: string;
  telemetryTitle: string;
  activeScriptLabel: string;
  catOverview: string;
  catPersonality: string;
  catCareer: string;
  catMarriage: string;
  catDasha: string;
  catRemedies: string;
  astrologicalFootnotes: string;
  bottomCtaQuestion: string;
  bottomCtaBtn: string;
  selectVoice: string;
  astrologerVoice: string;
  downloadPdf: string;
  shareReading: string;
  downloadAudio: string;
  shareAudio: string;
  pdfGenerating: string;

  // Live Workspace Extra UI Translations
  realtimeResponse: string;
  listeningToVoice: string;
  askAnyQuestionOrb: string;
  messagesCount: string;
  viewTranscript: string;
  closeChartDrawer: string;
  closeTranscriptDrawer: string;
  d1SiderealBirthChart: string;
  activeTimeLords: string;
  consultSuggestedTopics: string;
  groundedInChart: string;
  suggestedFollowups: string;
  realtimeListening: string;
  analyzingSpeech: string;
  astrologerSpeaking: string;
  voiceReadyPaused: string;
  micHardwareStatus: string;
  micVu: string;
  debugLabel: string;
  deskView: string;
  voiceView: string;
  tapToInterrupt: string;
  tapToStartVoice: string;
  realtimeAudioEngine: string;
  vedicVoiceEngine: string;
  sendNow: string;
  exitLabel: string;
  closePanel: string;
  connectingToDesk: string;
  calculatingEphemeris: string;
  mahadashaLabel: string;
  antardashaLabel: string;
  ascendantPlacementLabel: string;
  masterAstrologer: string;
}

export const translations: Record<Language, TranslationCatalog> = {
  en: {
    brandName: "Nakhatra",
    vedicAstrology: "Vedic Astrology",
    home: "Home",
    freeKundali: "Free Kundali",
    vedicReading: "Vedic Reading",
    talkToAstrologer: "Talk to AI Astrologer",
    selectLanguage: "Language",

    heroTagline: "Precision Sidereal Ephemeris & Live AI Guidance",
    heroTitle: "Your kundali, calculated to the degree",
    heroSub: "Swiss Ephemeris computes every position. The AI astrologer reads what is actually there \u2014 it cannot invent a placement, a dasha, or a date.",
    birthDetails: "Enter Birth Details",
    fullName: "Full Name",
    birthDate: "Date of Birth",
    birthTime: "Time of Birth",
    birthPlace: "Place of Birth",
    calculateKundali: "Generate Birth Chart & Reading",
    calculating: "Calculating Ephemeris Coordinates...",

    feature1Title: "High Precision Sidereal Engine",
    feature1Desc: "Calculated using Swiss Ephemeris algorithm for exact degrees, houses, and divisional varga charts.",
    feature2Title: "Vimshottari Dasha Timeline",
    feature2Desc: "Track your active Mahadasha and Antardasha periods for precise timing of life events.",
    feature3Title: "Live Conversational Voice AI",
    feature3Desc: "Speak naturally to your AI Jyotish Acharya in English, Nepali, or Hindi with real-time audio synthesis.",

    readingHeader: "Full Vedic Kundali & Astrological Reading",
    seekerName: "Seeker Profile",
    tabChart: "D1 Kundali Chart",
    tabPlanets: "Planetary Placements",
    tabDasha: "Vimshottari Dasha",
    tabVargas: "Divisional Charts (Vargas)",
    tabAnalysis: "Detailed Analysis",
    tabAskAI: "Talk to Astrologer",
    lagnaAscendant: "Lagna Ascendant",
    moonSign: "Moon Sign (Rashi)",
    nakshatra: "Nakshatra",
    currentDasha: "Current Dasha Timeline",
    openLiveVoice: "Start Live Voice Consultation",
    backToReport: "Back to Full Report",

    liveWorkspaceTitle: "Live Astrologer Voice Consultation",
    listeningState: "Listening... Speak Now",
    thinkingState: "Analyzing Chart & Transcribing...",
    speakingState: "Master Astrologer Responding...",
    pausedState: "Voice Session Paused",
    askPlaceholder: "Ask your astrologer anything... (Type question & press Enter)",
    sendQuery: "Send Query",
    interrupt: "Interrupt",
    transcript: "Transcript",
    kundaliChart: "Kundali Chart",
    exitVoice: "Exit Voice",
    mute: "Mute",
    unmute: "Unmute",

    kundaliChartsTitle: "Kundali Charts",
    kundaliChartsSub: "D1 Lagna & D9 Navamsha Charts",
    d1LagnaChartTitle: "D1 · Lagna Chart (Main Birth Chart)",
    d9NavamshaChartTitle: "D9 · Navamsha Chart (Dharma & Destiny)",
    ascendantLabel: "Ascendant",
    houseLabel: "House",
    lordLabel: "Lord",
    tapHouseHelper: "💡 Tap any house in D1 or D9 to inspect its sign, ruling lord, and occupant planets.",
    avakhadaTitle: "Avakhada Chakra (Birth Attributes)",
    moonSignLabel: "Moon Sign (Rashi):",
    nakshatraLabel: "Nakshatra:",
    nakshatraPadaLabel: "Nakshatra Pada:",
    nameSyllableLabel: "Name Syllable:",
    ganaLabel: "Gana:",
    nadiLabel: "Nadi:",
    yoniLabel: "Yoni (Animal):",
    varnaElementLabel: "Varna / Element:",
    auspiciousTitle: "Auspicious & Inauspicious Elements",
    luckyColors: "✓ Lucky Colors (Shubha Ranga):",
    unluckyColors: "✗ Unlucky Colors (Ashubha Ranga):",
    luckyGemstones: "✓ Lucky Gemstones (Shubha Ratna):",
    unluckyGemstones: "✗ Unlucky Gemstones (Ashubha Ratna):",
    planetaryPositionsTitle: "Planetary Positions & Longitudes",
    compactLabel: "Compact",
    fullDetailsLabel: "Full Details",
    thPlanet: "Planet",
    thSign: "Sign",
    thHouse: "House",
    thDegree: "Degree (D°M'S\")",
    activeDashaTitle: "Active Dasha Systems & Predictions",
    narrativeAudioTitle: "Narrative Audio Reading",
    narrativeAudioSub: "Astrologer Voice: Acharya Dev (HD MP3 Stream Engine)",
    telemetryTitle: "Audio Telemetry & Live Script Reader",
    activeScriptLabel: "Active Spoken Teleprompter Script:",
    catOverview: "Overview",
    catPersonality: "Personality",
    catCareer: "Career & Wealth",
    catMarriage: "Love & Marriage",
    catDasha: "Current Dasha",
    catRemedies: "Remedies",
    astrologicalFootnotes: "Astrological Grounding Footnotes:",
    bottomCtaQuestion: "Have a specific question about your career or relationship timing?",
    bottomCtaBtn: "🔴 Talk to Live AI Astrologer",
    selectVoice: "Select Voice",
    astrologerVoice: "Astrologer Voice Persona",
    downloadPdf: "Download PDF Report",
    shareReading: "Share Reading Page",
    downloadAudio: "Download Audio",
    shareAudio: "Share Audio",
    pdfGenerating: "Generating complete PDF report...",

    realtimeResponse: "Realtime Response",
    listeningToVoice: "Listening to your voice...",
    askAnyQuestionOrb: "Ask any question or tap the cosmic orb to speak with your Master Astrologer.",
    messagesCount: "Messages",
    viewTranscript: "Transcript →",
    closeChartDrawer: "Close Chart",
    closeTranscriptDrawer: "Close Transcript",
    d1SiderealBirthChart: "D1 Sidereal Birth Chart",
    activeTimeLords: "Active Time Lords (Dasha)",
    consultSuggestedTopics: "Consult Suggested Topics",
    groundedInChart: "Grounded in Chart",
    suggestedFollowups: "Suggested Follow-ups",
    realtimeListening: "Realtime Listening...",
    analyzingSpeech: "Analyzing Speech...",
    astrologerSpeaking: "Astrologer Speaking...",
    voiceReadyPaused: "Voice Ready / Paused",
    micHardwareStatus: "Mic Hardware Status",
    micVu: "Mic VU",
    debugLabel: "Debug",
    deskView: "Desk",
    voiceView: "Voice",
    tapToInterrupt: "Tap to Interrupt",
    tapToStartVoice: "Tap to Start Realtime Voice",
    realtimeAudioEngine: "Realtime Audio Engine",
    vedicVoiceEngine: "Vedic Voice Engine",
    sendNow: "Send Now",
    exitLabel: "Exit",
    closePanel: "Close Panel",
    connectingToDesk: "Connecting to Live Astrologer Desk...",
    calculatingEphemeris: "Calculating Swiss Ephemeris chart coordinates",
    mahadashaLabel: "Mahadasha",
    antardashaLabel: "Antardasha",
    ascendantPlacementLabel: "Ascendant Placement:",
    masterAstrologer: "Master Astrologer",
  },

  ne: {
    brandName: "Nakhatra",
    vedicAstrology: "वैदिक ज्योतिष",
    home: "गृह पृष्ठ",
    freeKundali: "निःशुल्क कुण्डली",
    vedicReading: "वैदिक राशिफल",
    talkToAstrologer: "एआई ज्योतिषी परामर्श",
    selectLanguage: "भाषा",

    heroTagline: "सटीक वैदिक कुण्डली र प्रत्यक्ष एआई ज्योतिषी परामर्श",
    heroTitle: "तपाईंको कुण्डली, अंशसम्म सटीक",
    heroSub: "स्विस इफेमेरिसले हरेक ग्रहस्थिति गणना गर्छ। एआई ज्योतिषीले त्यहाँ भएकै कुरा पढ्छ — कुनै ग्रह, दशा वा मिति आफैं बनाउँदैन।",
    birthDetails: "जन्म विवरण प्रविष्ट गर्नुहोस्",
    fullName: "पूरा नाम",
    birthDate: "जन्म मिति",
    birthTime: "जन्म समय",
    birthPlace: "जन्म स्थान",
    calculateKundali: "जन्मकुण्डली र राशिफल तयार गर्नुहोस्",
    calculating: "खगोलीय ग्रह स्थिति गणना गर्दै...",

    feature1Title: "सटीक खगोलीय गणितीय गणना",
    feature1Desc: "सटीक डिग्री, भाव र वर्ग कुण्डलीका लागि स्वीस एफेमेरिस सिद्धान्तबाट गणना गरिएको।",
    feature2Title: "विंशोत्तरी दशा र समयरेखा",
    feature2Desc: "सटीक समय र घटनाको लागि तपाइँको सक्रिय महादशा र अन्तरदशा अवधिको विश्लेषण गर्नुहोस्।",
    feature3Title: "प्रत्यक्ष भ्वाइस एआई ज्योतिषी",
    feature3Desc: "तपाइँको एआई ज्योतिषीसँग अङ्ग्रेजी, नेपाली वा हिन्दीमा सहजरूपमा प्रत्यक्ष कुराकानी गर्नुहोस्।",

    readingHeader: "सम्पूर्ण वैदिक कुण्डली तथा ज्योतिषीय विश्लेषण",
    seekerName: "जातक विवरण",
    tabChart: "D1 लग्न कुण्डली",
    tabPlanets: "ग्रह स्थिति र डिग्री",
    tabDasha: "विंशोत्तरी महादशा",
    tabVargas: "वर्ग कुण्डली (D9 नवांश)",
    tabAnalysis: "विस्तृत जीवन विश्लेषण",
    tabAskAI: "ज्योतिषी परामर्श",
    lagnaAscendant: "लग्न राशि",
    moonSign: "चन्द्र राशि (राशि)",
    nakshatra: "जन्म नक्षत्र",
    currentDasha: "वर्तमान दशा समयरेखा",
    openLiveVoice: "प्रत्यक्ष भ्वाइस परामर्श सुरु गर्नुहोस्",
    backToReport: "रिपोर्टमा फर्कनुहोस्",

    liveWorkspaceTitle: "प्रत्यक्ष भ्वाइस ज्योतिषी परामर्श",
    listeningState: "सुन्दैछ... बोल्नुहोस्",
    thinkingState: "कुण्डली र आवाज विश्लेषण गर्दै...",
    speakingState: "मास्टर ज्योतिषी बोल्दै हुनुहुन्छ...",
    pausedState: "भ्वाइस सेसन रोकियो",
    askPlaceholder: "आफ्नो ज्योतिषीलाई केही पनि सोध्नुहोस्... (प्रश्न लेखेर इन्टर थिच्नुहोस्)",
    sendQuery: "प्रश्न पठाउनुहोस्",
    interrupt: "रोक्नुहोस्",
    transcript: "इतिहास",
    kundaliChart: "जन्मकुण्डली",
    exitVoice: "बाहिरिनुहोस्",
    mute: "मौन",
    unmute: "आवाज खोल्नुहोस्",

    kundaliChartsTitle: "कुण्डली चक्र",
    kundaliChartsSub: "D1 लग्न र D9 नवांश कुण्डली",
    d1LagnaChartTitle: "D1 · लग्न कुण्डली (मुख्य जन्मकुण्डली)",
    d9NavamshaChartTitle: "D9 · नवांश कुण्डली (धर्म र भाग्य)",
    ascendantLabel: "लग्न",
    houseLabel: "भाव",
    lordLabel: "स्वामी",
    tapHouseHelper: "💡 D1 वा D9 को कुनै पनि भाव थिचेर त्यसको राशि, स्वामी र ग्रहहरू हेर्नुहोस्।",
    avakhadaTitle: "अवकहडा चक्र (जन्म तत्व)",
    moonSignLabel: "चन्द्र राशि:",
    nakshatraLabel: "जन्म नक्षत्र:",
    nakshatraPadaLabel: "नक्षत्र चरण:",
    nameSyllableLabel: "नाम अक्षर:",
    ganaLabel: "गण:",
    nadiLabel: "नाडी:",
    yoniLabel: "योनि (जनावर):",
    varnaElementLabel: "वर्ण / तत्व:",
    auspiciousTitle: "शुभ तथा अशुभ तत्वहरू",
    luckyColors: "✓ शुभ रङ्गहरू (शुभ रङ्ग):",
    unluckyColors: "✗ अशुभ रङ्गहरू (अशुभ रङ्ग):",
    luckyGemstones: "✓ शुभ रत्नहरू (शुभ रत्न):",
    unluckyGemstones: "✗ अशुभ रत्नहरू (अशुभ रत्न):",
    planetaryPositionsTitle: "ग्रह स्थिति तथा डिग्री अंश",
    compactLabel: "संक्षिप्त",
    fullDetailsLabel: "पूरा विवरण",
    thPlanet: "ग्रह",
    thSign: "राशि",
    thHouse: "भाव",
    thDegree: "अंश (D°M'S\")",
    activeDashaTitle: "सक्रिय दशा प्रणाली र फलकथन",
    narrativeAudioTitle: "श्रव्य (अडियो) कुण्डली वाचन",
    narrativeAudioSub: "ज्योतिषी आवाज: आचार्य देव (HD अडियो स्ट्रिम)",
    telemetryTitle: "अडियो वाचन तथा प्रत्यक्ष पाठ",
    activeScriptLabel: "सक्रिय वाचन पाठ:",
    catOverview: "अवलोकन",
    catPersonality: "व्यक्तित्व",
    catCareer: "करियर र धन",
    catMarriage: "प्रेम र विवाह",
    catDasha: "वर्तमान दशा",
    catRemedies: "उपायहरू",
    astrologicalFootnotes: "ज्योतिषीय खगोलीय आधार:",
    bottomCtaQuestion: "के तपाइँको करियर वा सम्बन्धको बारेमा विशेष प्रश्न छ?",
    bottomCtaBtn: "🔴 प्रत्यक्ष एआई ज्योतिषीसँग कुरा गर्नुहोस्",
    selectVoice: "स्वर छान्नुहोस्",
    astrologerVoice: "ज्योतिषी स्वर",
    downloadPdf: "पीडीएफ रिपोर्ट डाउनलोड",
    shareReading: "कुण्डली सेयर गर्नुहोस्",
    downloadAudio: "अडियो डाउनलोड",
    shareAudio: "अडियो सेयर",
    pdfGenerating: "सम्पूर्ण कुण्डली पीडीएफ तयार हुँदैछ...",

    realtimeResponse: "प्रत्यक्ष उत्तर",
    listeningToVoice: "तपाईंको आवाज सुन्दैछ...",
    askAnyQuestionOrb: "मास्टर ज्योतिषीसँग बोल्न कुनै पनि प्रश्न सोध्नुहोस् वा ब्रह्माण्ड चक्र थिच्नुहोस्।",
    messagesCount: "सन्देशहरू",
    viewTranscript: "इतिहास →",
    closeChartDrawer: "कुण्डली बन्द गर्नुहोस्",
    closeTranscriptDrawer: "इतिहास बन्द गर्नुहोस्",
    d1SiderealBirthChart: "D1 निरयण जन्म कुण्डली",
    activeTimeLords: "सक्रिय दशा (काल स्वामी)",
    consultSuggestedTopics: "सुझाइएका परामर्श विषयहरू",
    groundedInChart: "कुण्डलीमा आधारित",
    suggestedFollowups: "सुझाइएका प्रश्नहरू",
    realtimeListening: "प्रत्यक्ष सुन्दैछ...",
    analyzingSpeech: "आवाज र कुण्डली विश्लेषण गर्दै...",
    astrologerSpeaking: "ज्योतिषी बोल्दै हुनुहुन्छ...",
    voiceReadyPaused: "आवाज तयार / रोकिएको",
    micHardwareStatus: "माइक्रोफोन स्थिति",
    micVu: "माइक सङ्केत",
    debugLabel: "डिबग",
    deskView: "डेस्क",
    voiceView: "आवाज",
    tapToInterrupt: "रोक्न थिच्नुहोस्",
    tapToStartVoice: "प्रत्यक्ष कुराकानी सुरु गर्न थिच्नुहोस्",
    realtimeAudioEngine: "प्रत्यक्ष अडियो इन्जिन",
    vedicVoiceEngine: "वैदिक भ्वाइस इन्जिन",
    sendNow: "अहिले पठाउनुहोस्",
    exitLabel: "बाहिरिनुहोस्",
    closePanel: "प्यानल बन्द गर्नुहोस्",
    connectingToDesk: "प्रत्यक्ष एआई ज्योतिषी कक्षमा जोडिँदैछ...",
    calculatingEphemeris: "स्वीस एफेमेरिस कुण्डली गणना हुँदैछ",
    mahadashaLabel: "महादशा",
    antardashaLabel: "अन्तरदशा",
    ascendantPlacementLabel: "लग्न स्थिति:",
    masterAstrologer: "मास्टर ज्योतिषी",
  },

  hi: {
    brandName: "Nakhatra",
    vedicAstrology: "वैदिक ज्योतिष",
    home: "मुख्य पृष्ठ",
    freeKundali: "निःशुल्क कुंडली",
    vedicReading: "वैदिक फलकथन",
    talkToAstrologer: "एआई ज्योतिषी परामर्श",
    selectLanguage: "भाषा",

    heroTagline: "सटीक वैदिक कुंडली एवं लाइव एआई ज्योतिषी मार्गदर्शन",
    heroTitle: "आपकी कुंडली, अंश तक सटीक",
    heroSub: "स्विस इफेमेरिस हर ग्रह स्थिति की गणना करता है। एआई ज्योतिषी वही पढ़ता है जो वास्तव में है — वह कोई ग्रह, दशा या तिथि स्वयं नहीं गढ़ता।",
    birthDetails: "जन्म विवरण दर्ज करें",
    fullName: "पूरा नाम",
    birthDate: "जन्म तिथि",
    birthTime: "जन्म समय",
    birthPlace: "जन्म स्थान",
    calculateKundali: "जन्मकुंडली और भविष्यफल तैयार करें",
    calculating: "खगोलीय ग्रह स्थितियों की गणना हो रही है...",

    feature1Title: "सटीक खगोलीय गणितीय गणना",
    feature1Desc: "सटीक डिग्री, भाव और वर्ग कुंडली के लिए स्विस एफेमेरिस सिद्धांत से गणना की गई।",
    feature2Title: "विंशोत्तरी दशा और समयरेखा",
    feature2Desc: "सटीक समय और जीवन घटनाओं के लिए अपनी सक्रिय महादशा और अंतर्दशा अवधि को ट्रैक करें।",
    feature3Title: "लाइव बातचीत एआई ज्योतिषी",
    feature3Desc: "अपने एआई ज्योतिषी से अंग्रेजी, नेपाली या हिंदी में स्वाभाविक रूप से बातचीत करें।",

    readingHeader: "संपूर्ण वैदिक कुंडली एवं ज्योतिषीय विश्लेषण",
    seekerName: "जातक विवरण",
    tabChart: "D1 लग्न कुंडली",
    tabPlanets: "ग्रह स्थिति और डिग्री",
    tabDasha: "विंशोत्तरी महादशा",
    tabVargas: "वर्ग कुंडली (D9 नवांश)",
    tabAnalysis: "विस्तृत जीवन विश्लेषण",
    tabAskAI: "ज्योतिषी परामर्श",
    lagnaAscendant: "लग्न राशि",
    moonSign: "चंद्र राशि (राशि)",
    nakshatra: "जन्म नक्षत्र",
    currentDasha: "वर्तमान दशा समयरेखा",
    openLiveVoice: "लाइव ऑडियो परामर्श शुरू करें",
    backToReport: "मुख्य रिपोर्ट पर लौटें",

    liveWorkspaceTitle: "लाइव ऑडियो ज्योतिषी परामर्श",
    listeningState: "सुन रहा है... बोलिए",
    thinkingState: "कुंडली और वाणी का विश्लेषण हो रहा है...",
    speakingState: "मास्टर ज्योतिषी मार्गदर्शन दे रहे हैं...",
    pausedState: "ऑडियो सत्र रोका गया",
    askPlaceholder: "अपने ज्योतिषी से कुछ भी पूछें... (प्रश्न लिखकर एंटर दबाएं)",
    sendQuery: "प्रश्न भेजें",
    interrupt: "रोकें",
    transcript: "इतिहास",
    kundaliChart: "जन्मकुंडली",
    exitVoice: "बाहर निकलें",
    mute: "मौन",
    unmute: "आवाज़ खोलें",

    kundaliChartsTitle: "कुंडली चक्र",
    kundaliChartsSub: "D1 लग्न एवं D9 नवांश कुंडली",
    d1LagnaChartTitle: "D1 · लग्न कुंडली (मुख्य जन्मकुंडली)",
    d9NavamshaChartTitle: "D9 · नवांश कुंडली (धर्म एवं भाग्य)",
    ascendantLabel: "लग्न",
    houseLabel: "भाव",
    lordLabel: "स्वामी",
    tapHouseHelper: "💡 D1 या D9 के किसी भी भाव को दबाकर उसकी राशि, स्वामी और ग्रह देखें।",
    avakhadaTitle: "अवकहड़ा चक्र (जन्म तत्व)",
    moonSignLabel: "चंद्र राशि:",
    nakshatraLabel: "जन्म नक्षत्र:",
    nakshatraPadaLabel: "नक्षत्र चरण:",
    nameSyllableLabel: "नाम अक्षर:",
    ganaLabel: "गण:",
    nadiLabel: "नाड़ी:",
    yoniLabel: "योनि (पशु):",
    varnaElementLabel: "वर्ण / तत्व:",
    auspiciousTitle: "शुभ एवं अशुभ तत्व",
    luckyColors: "✓ शुभ रंग (शुभ रंग):",
    unluckyColors: "✗ अशुभ रंग (अशुभ रंग):",
    luckyGemstones: "✓ शुभ रत्न (शुभ रत्न):",
    unluckyGemstones: "✗ अशुभ रत्न (अशुभ रत्न):",
    planetaryPositionsTitle: "ग्रह स्थिति एवं अंश (डिग्री)",
    compactLabel: "संक्षिप्त",
    fullDetailsLabel: "पूरा विवरण",
    thPlanet: "ग्रह",
    thSign: "राशि",
    thHouse: "भाव",
    thDegree: "अंश (D°M'S\")",
    activeDashaTitle: "सक्रिय दशा प्रणाली एवं भविष्यवाणी",
    narrativeAudioTitle: "श्रव्य (ऑडियो) कुंडली वाचन",
    narrativeAudioSub: "ज्योतिषी वाणी: आचार्य देव (HD ऑडियो स्ट्रीम)",
    telemetryTitle: "ऑडियो वाचन एवं लाइव पाठ",
    activeScriptLabel: "सक्रिय वाचन पाठ:",
    catOverview: "अवलोकन",
    catPersonality: "व्यक्तित्व",
    catCareer: "करियर एवं धन",
    catMarriage: "प्रेम एवं विवाह",
    catDasha: "वर्तमान दशा",
    catRemedies: "उपाय",
    astrologicalFootnotes: "ज्योतिषीय खगोलीय आधार:",
    bottomCtaQuestion: "क्या आपके पास अपने करियर या रिश्ते के बारे में कोई विशेष प्रश्न है?",
    bottomCtaBtn: "🔴 लाइव एआई ज्योतिषी से बात करें",
    selectVoice: "आवाज चुनें",
    astrologerVoice: "ज्योतिषी आवाज",
    downloadPdf: "पीडीएफ डाउनलोड",
    shareReading: "कुंडली शेयर करें",
    downloadAudio: "ऑडियो डाउनलोड",
    shareAudio: "ऑडियो शेयर",
    pdfGenerating: "संपूर्ण कुंडली पीडीएफ तैयार हो रही है...",

    realtimeResponse: "लाइव उत्तर",
    listeningToVoice: "आपकी आवाज़ सुन रहा है...",
    askAnyQuestionOrb: "मास्टर ज्योतिषी से बात करने के लिए कोई भी प्रश्न पूछें या ब्रह्मांड चक्र दबाएं।",
    messagesCount: "संदेश",
    viewTranscript: "इतिहास →",
    closeChartDrawer: "कुंडली बंद करें",
    closeTranscriptDrawer: "इतिहास बंद करें",
    d1SiderealBirthChart: "D1 निरयण जन्म कुंडली",
    activeTimeLords: "सक्रिय दशा (काल स्वामी)",
    consultSuggestedTopics: "सुझाए गए परामर्श विषय",
    groundedInChart: "कुंडली पर आधारित",
    suggestedFollowups: "सुझाए गए प्रश्न",
    realtimeListening: "लाइव सुन रहा है...",
    analyzingSpeech: "वाणी एवं कुंडली का विश्लेषण हो रहा है...",
    astrologerSpeaking: "ज्योतिषी मार्गदर्शन दे रहे हैं...",
    voiceReadyPaused: "आवाज़ तैयार / रुकी हुई",
    micHardwareStatus: "माइक हार्डवेयर स्थिति",
    micVu: "माइक संकेत",
    debugLabel: "डिबग",
    deskView: "डेस्क",
    voiceView: "आवाज़",
    tapToInterrupt: "रोकने के लिए दबाएं",
    tapToStartVoice: "लाइव बातचीत शुरू करने के लिए दबाएं",
    realtimeAudioEngine: "लाइव ऑडियो इंजन",
    vedicVoiceEngine: "वैदिक वॉइस इंजन",
    sendNow: "अभी भेजें",
    exitLabel: "बाहर निकलें",
    closePanel: "पैनल बंद करें",
    connectingToDesk: "लाइव एआई ज्योतिषी कक्ष से जुड़ रहा है...",
    calculatingEphemeris: "स्विस एफेमेरिस कुंडली गणना हो रही है",
    mahadashaLabel: "महादशा",
    antardashaLabel: "अंतर्दशा",
    ascendantPlacementLabel: "लग्न स्थिति:",
    masterAstrologer: "मास्टर ज्योतिषी",
  },
};

