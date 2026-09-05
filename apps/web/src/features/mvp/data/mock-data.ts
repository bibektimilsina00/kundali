import type { MvpBirthDetails, ReportSection, ChatMessage } from "../types";

export const SAMPLE_BIRTH_DETAILS: MvpBirthDetails = {
  name: "Bibek Timilsina",
  date: "2002-01-11",
  time: "07:30 PM",
  place: "Kapilbastu, Nepal (27.55° N, 83.05° E)",
};

export const MOCK_REPORT_SECTIONS: ReportSection[] = [
  {
    id: "personality",
    icon: "user",
    title: "Personality & Intellect",
    subtitle: "Core identity, mindset, and behavioral tendencies",
    summary: "Deeply analytical, strategic, and morally grounded with natural leadership capabilities.",
    content: [
      "You possess a sharp, inquiring mind that excels at solving complex problems. With Sagittarius Ascendant ruled by Jupiter, your fundamental drive is rooted in truth, continuous learning, and purposeful action.",
      "The placement of exalted Mercury in your 10th house grants exceptional clarity of thought, eloquence in communication, and a methodical approach to life's challenges.",
      "While you project calm confidence externally, your Moon in Libra makes you highly sensitive to environmental harmony and fairness in personal dealings."
    ],
    reasoning: [
      {
        placement: "Sagittarius (Dhanu) Ascendant",
        explanation: "Gives an optimistic, philosophical outlook and strong ethical principles."
      },
      {
        placement: "Mercury Exalted in 10th House (Virgo)",
        explanation: "Forms Bhadra Pancha Mahapurusha Yoga, granting high intellectual authority and strategic speech."
      },
      {
        placement: "Moon in Libra (Tula), Vishakha Nakshatra",
        explanation: "Creates an innate need for balance, diplomacy, and emotional equilibrium."
      }
    ]
  },
  {
    id: "strengths-weaknesses",
    icon: "scale",
    title: "Strengths & Growth Areas",
    subtitle: "Innate talents and potential pitfalls to guard against",
    summary: "High executive focus and financial acumen balanced against a tendency to over-analyze.",
    content: [
      "Key Strengths: Extraordinary capacity for sustained effort, financial prudence, ability to negotiate wins in diplomatic settings, and high ethical integrity.",
      "Growth Areas: You may occasionally experience mental paralysis by analysis due to mercury's intense scrutiny. Learning when to delegate and trust intuition over raw data will unlock your next growth phase.",
      "Be cautious of sudden impatience during Rahu transit windows, as it can strain working relationships."
    ],
    reasoning: [
      {
        placement: "Saturn in 3rd House (Own Sign Aquarius)",
        explanation: "Bestows immense courage, persistence, and perseverance under pressure."
      },
      {
        placement: "Venus in 11th House (Own Sign Libra)",
        explanation: "Ensures strong professional network and consistent financial gains."
      },
      {
        placement: "Rahu in 10th House",
        explanation: "Injects ambitious drive but can create periodic restlessness at work."
      }
    ]
  },
  {
    id: "career-finance",
    icon: "briefcase",
    title: "Career & Financial Outlook",
    subtitle: "Wealth potential, domain alignment, and career milestones",
    summary: "Strong potential for independent consulting, tech executive leadership, or high-yield ventures.",
    content: [
      "Your career trajectory points toward prominent positions in technology, strategic consulting, finance, or analytical leadership.",
      "Because the 10th lord Mercury is exalted in the 10th house itself, you thrive when granted autonomy over your projects rather than micromanagement.",
      "Financial gains expand significantly after age 30, with major wealth creation during the current Rahu-Jupiter Dasha cycle."
    ],
    reasoning: [
      {
        placement: "10th Lord Mercury Exalted in 10th House",
        explanation: "Direct indicator of high professional reputation and career authority."
      },
      {
        placement: "11th Lord Venus in 11th House",
        explanation: "Strong Dhana Yoga (Wealth Combination) promising multiple revenue channels."
      },
      {
        placement: "Jupiter in 12th House aspecting 4th House",
        explanation: "Indicates property acquisition and long-term asset buildup."
      }
    ]
  },
  {
    id: "love-marriage",
    icon: "heart",
    title: "Love & Marriage",
    subtitle: "Relationship dynamics, partner traits, and timing",
    summary: "Supportive, intelligent partner met through professional or educational circles.",
    content: [
      "Your 7th house of partnership is ruled by Mercury, which connects your marital life closely with intellectual companionship and shared life goals.",
      "Your partner is likely to be accomplished, expressive, and aesthetically inclined.",
      "The strongest window for marriage or significant relationship milestone is mid-2026 under the Jupiter Antardasha transit."
    ],
    reasoning: [
      {
        placement: "7th Lord Mercury in 10th House",
        explanation: "Indicates meeting partner through work, career events, or academia."
      },
      {
        placement: "Venus in 11th House (Tula)",
        explanation: "Adds harmony, mutual respect, and shared social circles in marriage."
      },
      {
        placement: "Jupiter aspect on 7th House in 2026 transit",
        explanation: "Triggers divine blessing for marital timing and commitment."
      }
    ]
  },
  {
    id: "travel-spirituality",
    icon: "compass",
    title: "Foreign Travel & Spirituality",
    subtitle: "Overseas opportunities and inner awakening",
    summary: "High probability of long-term foreign residence and deep spiritual evolution.",
    content: [
      "With Mars and Jupiter positioned in the 12th house (Scorpio), foreign travel, international commerce, or relocation across borders plays a major role in your life story.",
      "Spiritually, you are drawn to deep esoteric knowledge, meditation, and ancient Vedic wisdom rather than superficial rituals."
    ],
    reasoning: [
      {
        placement: "12th Lord Mars in 12th House (Scorpio)",
        explanation: "Creates strong foreign linkage, international success, and spiritual strength."
      },
      {
        placement: "Ascendant Lord Jupiter in 12th House",
        explanation: "Promotes deep introspection, retreat periods, and higher wisdom."
      }
    ]
  },
  {
    id: "current-dasha",
    icon: "clock",
    title: "Current Dasha & Important Periods",
    subtitle: "Vimshottari time lords shaping your current chapter",
    summary: "Currently in Rahu Mahadasha / Jupiter Antardasha (Sept 2024 – Feb 2027).",
    content: [
      "You are currently navigating **Rahu-Jupiter Dasha**, a pivotal 2.5-year window that bridges ambition with wisdom.",
      "Rahu in the 10th house pushes for outward achievement, while Jupiter in the 12th ensures you build on solid moral foundations.",
      "Next Key Period: **Jupiter-Saturn Antardasha** starting mid-2027 brings permanent career elevation and property investments."
    ],
    reasoning: [
      {
        placement: "Rahu (10th) - Jupiter (12th) Period",
        explanation: "Harmonizes commercial growth with global perspective and inner learning."
      },
      {
        placement: "Vimshottari Dasha calculation from Moon Nakshatra",
        explanation: "120-year astronomical timeline calculated strictly from Swiss Ephemeris."
      }
    ]
  },
  {
    id: "remedies",
    icon: "shield",
    title: "Vedic Remedies & Life Guidance",
    subtitle: "Harmonizing planetary frequencies for optimal wellbeing",
    summary: "Simple, potent daily practices to enhance benefics and calm malefic transits.",
    content: [
      "Recite **Vishnu Sahasranama** or Vishnu Gayatri mantra on Wednesday mornings to maximize Mercury's exalted blessings.",
      "Offer water to the rising Sun (Surya Arghya) with copper vessel on Sundays.",
      "Recommended Gemstone: **Yellow Sapphire (Pukhraj)** set in gold on index finger (after consulting exact birth chart transit dates).",
      "Donate yellow grains or books to students on Thursdays."
    ],
    reasoning: [
      {
        placement: "Mercury Exalted in 10th House",
        explanation: "Mantra practice amplifies clarity, public recognition, and business success."
      },
      {
        placement: "Ascendant Lord Jupiter in 12th House",
        explanation: "Charity on Thursdays calms 12th house expenditure and preserves savings."
      }
    ]
  }
];

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: "msg-1",
    sender: "astrologer",
    text: "Namaste Aarav! I have thoroughly analyzed your Kundali. Your exalted Mercury in the 10th house and current Rahu-Jupiter Dasha make this a very powerful phase for your career and personal growth. What specific questions do you have today?",
    timestamp: "10:32 AM",
    astrologicalBasis: "Chart initialized: Sagittarius Ascendant · Rahu-Jupiter Dasha"
  },
  {
    id: "msg-2",
    sender: "user",
    text: "What about my marriage timing? Is 2026 a good period?",
    timestamp: "10:33 AM"
  },
  {
    id: "msg-3",
    sender: "astrologer",
    text: "Yes, absolutely! Based on your 7th house lord Mercury placed in the 10th house, and Jupiter's upcoming transit activating your 7th house aspect in mid-2026 during your Jupiter Antardasha, mid-2026 to early 2027 is your strongest marriage window. You will likely meet your partner through professional networks or shared educational pursuits.",
    timestamp: "10:34 AM",
    astrologicalBasis: "7th Lord Mercury in 10th · Jupiter Transit over 7th House"
  }
];

export const SAMPLE_QUESTIONS = [
  "When is the strongest period for my career growth?",
  "Will I travel or settle abroad in 2026?",
  "What gemstone should I wear for wealth?",
  "Tell me about my financial prospects in Rahu Dasha."
];
