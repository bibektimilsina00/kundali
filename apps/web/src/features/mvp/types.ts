export interface MvpBirthDetails {
  name: string;
  date: string;
  time: string;
  place: string;
}

export interface ReportSection {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  summary: string;
  content: string[];
  reasoning: {
    placement: string;
    explanation: string;
  }[];
}

export interface ChatMessage {
  id: string;
  sender: "user" | "astrologer";
  text: string;
  timestamp: string;
  astrologicalBasis?: string;
}
