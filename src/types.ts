export interface VocabularyItem {
  japanese: string;
  romaji: string;
  meaning: string;
}

export interface DialogueLine {
  id: string;
  speaker: 'partner' | 'user';
  japanese: string;
  romaji: string;
  spanish: string;
  note?: string;
}

export interface PracticePhrase {
  id: string;
  japanese: string;
  romaji: string;
  spanish: string;
  context: string;
  audioGuide?: string;
}

export interface Lesson {
  id: string;
  title: string;
  japaneseTitle: string;
  level: 'Básico' | 'Intermedio';
  icon: string; // lucide icon name
  description: string;
  objectives: string[];
  vocabulary: VocabularyItem[];
  dialogue: DialogueLine[];
  practicePhrases: PracticePhrase[];
  partnerCharacter: string;
  partnerImagePrompt: string; // for potential image generation
  systemPrompt: string;
  initialMessage: string;
  initialMessageRomaji: string;
  initialMessageSpanish: string;
}

export interface ChatMessage {
  id: string;
  role: 'system' | 'user' | 'model';
  japanese: string;
  romaji?: string;
  spanish?: string;
  feedback?: {
    isCorrectJapanese: boolean;
    corrections?: string;
    naturalAlternative?: string;
    explanation?: string; // in Spanish
    score?: number; // stars or 0-100
  };
  timestamp: string;
}
