import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Volume2, 
  MessageSquare, 
  Award, 
  Send, 
  Sparkles, 
  BookOpen, 
  Mic, 
  PenTool, 
  BookOpenCheck,
  Compass, 
  User, 
  CheckCircle, 
  ChevronLeft, 
  ShieldAlert,
  GraduationCap, 
  VolumeX,
  X,
  Star,
  ShoppingBag,
  Utensils,
  MapPin,
  Home as HomeIcon,
  HelpCircle,
  TrendingUp,
  RotateCcw
} from 'lucide-react';

import { lessonsData } from './lessonsData';
import { Lesson, ChatMessage } from './types';
import StudyTab from './components/StudyTab';
import OralPracticeTab from './components/OralPracticeTab';
import WritingPracticeTab from './components/WritingPracticeTab';
import TutorView from './components/TutorView';

const ICONS_MAP: Record<string, any> = {
  ShoppingBag: ShoppingBag,
  Utensils: Utensils,
  MapPin: MapPin,
  Home: HomeIcon,
};

const ColombiaFlagCircle = ({ className = "w-6 h-6" }: { className?: string }) => (
  <div className={`rounded-full overflow-hidden shadow-xs border border-stone-250 shrink-0 inline-block relative ${className}`} title="Colombia">
    <div className="absolute inset-x-0 top-0 h-[50%] bg-[#FCD116]" />
    <div className="absolute inset-x-0 top-[50%] h-[25%] bg-[#003893]" />
    <div className="absolute inset-x-0 bottom-0 h-[25%] bg-[#CE1126]" />
  </div>
);

export default function App() {
  // State for learning path
  // 'start' triggers the welcome mode selection screen
  const [appMode, setAppMode] = useState<'start' | 'habla' | 'escritura' | 'tutor'>('start');
  const [studentName, setStudentName] = useState(() => localStorage.getItem('japanese_student_name') || 'Invitado');
  const [selectedLessonId, setSelectedLessonId] = useState<string>('konbini');
  const [activeTab, setActiveTab] = useState<'study' | 'practice' | 'chat'>('study');
  
  // Game/Rewards/Progress states
  const [isApiKeyMissing, setIsApiKeyMissing] = useState(false);
  const [completedPhrases, setCompletedPhrases] = useState<Record<string, number>>(() => {
    try {
      return JSON.parse(localStorage.getItem('japanese_completed_phrases') || '{}');
    } catch {
      return {};
    }
  });

  // State for AI Tutor (Free Talk Mode)
  const [tutorMessages, setTutorMessages] = useState<ChatMessage[]>(() => {
    try {
      const stored = localStorage.getItem('japanese_tutor_chat');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}
    return [
      {
        id: 'tutor-init',
        role: 'model',
        japanese: 'こんにちは！私はサクラ先生です。何でも質問したり、楽しく日本語でおしゃべりしましょう！🌸',
        romaji: 'Konnichiwa! Watashi wa Sakura sensei desu. Nandemo shitsumon shitari, tanoshiku Nihongo de oshaberi shimashou!',
        spanish: '¡Hola! Soy tu sensei Sakura. Podemos charlar libremente sobre lo que gustes, practicar tu habla sin presión o resolver cualquier duda de gramática o vocabulario en español. ¿De qué te gustaría hablar hoy? (Creada por SAN-666 con orgullo colombiano 🇨🇴)',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });

  // Speaking voice guidance state
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  // Chat message histories grouped by lessonId
  const [chats, setChats] = useState<Record<string, ChatMessage[]>>({});
  const [isChatSending, setIsChatSending] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // Audio recognition for chat input state
  const [isChatListening, setIsChatListening] = useState(false);
  const chatRecognitionRef = useRef<any>(null);

  const selectedLesson = lessonsData.find(l => l.id === selectedLessonId) || lessonsData[0];

  // Load and check health of API
  useEffect(() => {
    fetch('/api/health')
      .then(r => r.json())
      .then(data => {
        setIsApiKeyMissing(!data.hasApiKey);
      })
      .catch(() => {
        setIsApiKeyMissing(true);
      });
  }, []);

  // Save progress
  useEffect(() => {
    localStorage.setItem('japanese_completed_phrases', JSON.stringify(completedPhrases));
  }, [completedPhrases]);

  // Save tutor conversations
  useEffect(() => {
    localStorage.setItem('japanese_tutor_chat', JSON.stringify(tutorMessages));
  }, [tutorMessages]);

  // Handle auto-starting voice speech voices list load
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  // Set initial chat messages for each lesson oncechats is accessed
  useEffect(() => {
    const initialized: Record<string, ChatMessage[]> = {};
    lessonsData.forEach(lesson => {
      initialized[lesson.id] = [
        {
          id: `${lesson.id}-init`,
          role: 'model',
          japanese: lesson.initialMessage,
          romaji: lesson.initialMessageRomaji,
          spanish: lesson.initialMessageSpanish,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ];
    });
    setChats(initialized);
  }, []);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chats, tutorMessages, isChatSending]);

  // Browser speech synthesis (TTS)
  const handleSpeakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      // Clean Japanese string from romaji parenthesis if any
      const cleanedText = text.replace(/\([^)]+\)/g, '').trim();
      const utterance = new SpeechSynthesisUtterance(cleanedText);
      utterance.lang = 'ja-JP';
      
      const voices = window.speechSynthesis.getVoices();
      const jaVoice = voices.find(v => v.lang.startsWith('ja') || v.lang.includes('JP'));
      if (jaVoice) {
        utterance.voice = jaVoice;
      }
      utterance.rate = 0.88; // Slightly slower for language learners

      utterance.onstart = () => setSpeakingId(text);
      utterance.onend = () => setSpeakingId(null);
      utterance.onerror = () => setSpeakingId(null);

      window.speechSynthesis.speak(utterance);
    }
  };

  // Recording audio inside Chats
  const toggleListeningChatInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Tu dispositivo no cuenta con reconocimiento de voz integrado de forma nativa. Te aconsejamos escribir.");
      return;
    }

    if (isChatListening) {
      if (chatRecognitionRef.current) {
        chatRecognitionRef.current.stop();
      }
      setIsChatListening(false);
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.lang = 'ja-JP';
      rec.continuous = false;
      rec.interimResults = false;

      rec.onstart = () => {
        setIsChatListening(true);
      };

      rec.onresult = (e: any) => {
        const text = e.results[0][0].transcript;
        setChatInput(text);
      };

      rec.onerror = () => {
        setIsChatListening(false);
      };

      rec.onend = () => {
        setIsChatListening(false);
      };

      chatRecognitionRef.current = rec;
      rec.start();
    } catch {
      setIsChatListening(false);
    }
  };

  // Submit chat message to server to get evaluation and partner character reply
  const handleSendChatMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || isChatSending) return;

    const userText = chatInput.trim();
    setChatInput('');

    // Insert user message in client list
    const timestampString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      japanese: userText,
      timestamp: timestampString
    };

    const currentChatHistory = chats[selectedLessonId] || [];
    const updatedHistory = [...currentChatHistory, userMsg];
    
    setChats(prev => ({
      ...prev,
      [selectedLessonId]: updatedHistory
    }));

    setIsChatSending(true);

    try {
      // Map history for context omitting complex objects to prevent overfeeding
      const contextualHistory = currentChatHistory.slice(-5).map(m => ({
        role: m.role,
        text: m.japanese
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemPrompt: selectedLesson.systemPrompt,
          partnerCharacter: selectedLesson.partnerCharacter,
          messageHistory: contextualHistory,
          userInput: userText
        })
      });

      if (!response.ok) {
        throw new Error("No se pudo obtener el análisis o respuesta.");
      }

      const result = await response.json();

      // Create model message combining conversation response and evaluation
      const modelMsg: ChatMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        japanese: result.characterReply,
        romaji: result.characterReplyRomaji,
        spanish: result.characterReplySpanish,
        breakdown: result.characterBreakdown || undefined,
        feedback: {
          isCorrectJapanese: result.userFeedback.isNatural,
          score: result.userFeedback.score,
          corrections: result.userFeedback.corrections || undefined,
          naturalAlternative: result.userFeedback.naturalAlternative || undefined,
          explanation: result.userFeedback.explanation || undefined
        },
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      // Add feedback and update user message with Romaji & Spanish, plus append model reply
      setChats(prev => ({
        ...prev,
        [selectedLessonId]: (prev[selectedLessonId] || []).map(m => {
          if (m.id === userMsg.id) {
            return {
              ...m,
              romaji: result.userRomaji || undefined,
              spanish: result.userSpanish || undefined
            };
          }
          return m;
        }).concat(modelMsg)
      }));

      handleSpeakText(result.characterReply);

    } catch (err) {
      console.error(err);
      // Give error dialogue
      const errMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'model',
        japanese: 'エラーが発生しました。設定を確認してください。',
        romaji: 'Erā ga hassei shimashita. Settei o kakunin shite kudasai.',
        spanish: 'Ocurrió un problema de red al intentar conectar con el tutor de japonés. ¿Está tu servidor arriba?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChats(prev => ({
        ...prev,
        [selectedLessonId]: [...prev[selectedLessonId], errMsg]
      }));
    } finally {
      setIsChatSending(false);
    }
  };

  // Submit free chat message to AI Tutor (Sakura Sensei)
  const handleSendTutorMessage = async (e?: React.FormEvent, customPromptText?: string) => {
    if (e) e.preventDefault();
    const textToSend = customPromptText !== undefined ? customPromptText : chatInput.trim();
    if (!textToSend || isChatSending) return;

    if (customPromptText === undefined) {
      setChatInput('');
    }

    const timestampString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      japanese: textToSend,
      timestamp: timestampString
    };

    const updatedHistory = [...tutorMessages, userMsg];
    setTutorMessages(updatedHistory);
    setIsChatSending(true);

    try {
      // Keep last messages for conversational context
      const contextualHistory = tutorMessages.slice(-6).map(m => ({
        role: m.role,
        text: m.japanese
      }));

      const sysPrompt = `You are Sakura Sensei, an incredibly kind, dedicated, and interactive Japanese language teacher.
You were developed by SAN-666. Because of SAN-666's heritage, you are super proud of Colombia 🇨🇴, often comparing Japanese wonders to the beautiful coffee mountains of Quindío or saying warm things to the student!
Your primary directive is to have an open-ended conversational "Free Talk" with the student in Japanese (1-2 sentences), but with absolute dedication to TEACHING.
ALWAYS correct any particle, vocabulary, or grammar spelling mistakes the student makes in their Japanese input, giving helpful linguistic tips in Spanish.
If the student asks you anything about grammar, vocabulary, culture, or translations in Spanish, answer them fully and clearly in Spanish like an exceptionally supporting sensei, and keep the dialogue going in Japanese!`;

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemPrompt: sysPrompt,
          partnerCharacter: "Sakura Sensei (Tutor Libre de IA)",
          messageHistory: contextualHistory,
          userInput: textToSend
        })
      });

      if (!response.ok) {
        throw new Error("No se pudo conectar con el tutor.");
      }

      const result = await response.json();

      const modelMsg: ChatMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        japanese: result.characterReply,
        romaji: result.characterReplyRomaji,
        spanish: result.characterReplySpanish,
        breakdown: result.characterBreakdown || undefined,
        feedback: {
          isCorrectJapanese: result.userFeedback.isNatural,
          score: result.userFeedback.score,
          corrections: result.userFeedback.corrections || undefined,
          naturalAlternative: result.userFeedback.naturalAlternative || undefined,
          explanation: result.userFeedback.explanation || undefined
        },
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setTutorMessages(prev => {
        return prev.map(m => {
          if (m.id === userMsg.id) {
            return {
              ...m,
              romaji: result.userRomaji || undefined,
              spanish: result.userSpanish || undefined
            };
          }
          return m;
        }).concat(modelMsg);
      });
      handleSpeakText(result.characterReply);

    } catch (err) {
      console.error(err);
      const errMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'model',
        japanese: 'エラーが発生しました。接続を確認してください。',
        romaji: 'Erā ga hassei shimashita. Setsuzoku o kakunin shite kudasai.',
        spanish: 'Ocurrió un problema al intentar conectar con Sakura Sensei. ¿Está el servidor activo?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setTutorMessages(prev => [...prev, errMsg]);
    } finally {
      setIsChatSending(false);
    }
  };

  // Track completed speaking phrase
  const handlePhrasePassed = (phraseId: string, scorePassed: number) => {
    setCompletedPhrases(prev => ({
      ...prev,
      [phraseId]: Math.max(prev[phraseId] || 0, scorePassed)
    }));
  };

  // Calculate global completed badges
  const lessonsCompletedCount = lessonsData.filter(l => 
    l.practicePhrases.every(phrase => (completedPhrases[phrase.id] || 0) >= 70)
  ).length;

  const totalXP = Object.values(completedPhrases).reduce((sum: number, current: number) => sum + current, 0);

  // Return component based on startup screen choice
  if (appMode === 'start') {
    return (
      <div className="min-h-screen bg-[#FAF7F2] text-[#2C302E] flex flex-col items-center justify-between p-6 select-none font-sans relative overflow-hidden">
        {/* Floating aesthetics blobs */}
        <div className="absolute w-64 h-64 rounded-full bg-red-100/45 filter blur-3xl -top-20 -left-20" />
        <div className="absolute w-80 h-80 rounded-full bg-amber-100/50 filter blur-3xl -bottom-30 -right-20" />

        {/* Top brand header */}
        <div className="w-full max-w-5xl flex items-center justify-between relative mt-2">
          <div className="flex items-center gap-2">
            <span className="w-9 h-9 rounded-full bg-[#E05353] flex items-center justify-center text-white font-display font-bold text-sm shadow-sm">
              和
            </span>
            <span className="font-display font-bold text-lg tracking-wide text-stone-850 flex items-center gap-2">
              <span>NihongoTalk</span>
              <ColombiaFlagCircle className="w-4.5 h-4.5 shadow-xs" />
            </span>
          </div>
          <div className="text-xs bg-amber-100/60 text-amber-900 border border-amber-200/50 rounded-full px-3 py-1 font-medium flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>2026 Nihongo Core Engine</span>
          </div>
        </div>

        {/* Central Card Choice */}
        <div className="w-full max-w-4xl flex flex-col items-center justify-center space-y-10 py-12 relative">
          <div className="space-y-3.5 text-center max-w-xl">
            <span className="text-[#E05353] font-display font-medium text-xs tracking-widest uppercase">
              Interactúa, Habla y Aprende
            </span>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-stone-855 tracking-tight leading-tight">
              Aprende Japonés con Situaciones Reales
            </h1>
            <div className="flex items-center justify-center gap-2 mt-2" id="app-designer-badge">
              <div className="text-xs bg-red-50 border border-red-200/60 text-red-700 px-3 py-1 rounded-full font-bold flex items-center gap-1.5 shadow-xs">
                <span>Creada por <strong className="font-extrabold uppercase tracking-wide text-red-850">SAN-666</strong></span>
                <ColombiaFlagCircle className="w-4 h-4 shadow-xs" />
              </div>
            </div>
            <p className="text-[#6E6B64] text-sm md:text-base leading-relaxed pt-1">
              Practica tu pronunciación, entrena tu caligrafía y conversa en situaciones de viaje cotidianas con retroalimentación inmediata de Inteligencia Artificial.
            </p>
          </div>

          {/* User Name input area */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200/70 shadow-sm w-full max-w-md flex flex-col gap-3">
            <label className="text-xs font-bold text-stone-400 uppercase tracking-wider block">
              Configura tu Nombre de Estudiante
            </label>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-indigo-50 border border-indigo-150 rounded-xl flex items-center justify-center text-indigo-700 shrink-0">
                <User className="w-4.5 h-4.5" />
              </div>
              <input
                type="text"
                id="input-applicant-name"
                value={studentName}
                onChange={(e) => {
                  setStudentName(e.target.value);
                  localStorage.setItem('japanese_student_name', e.target.value);
                }}
                placeholder="Ej. Carlos-san, Luisa..."
                className="flex-1 bg-stone-50 border border-stone-250 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-stone-900 font-sans text-sm font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
            {/* Mode Option 1: HABLA */}
            <motion.div
              whileHover={{ y: -4, scale: 1.01 }}
              onClick={() => setAppMode('habla')}
              className="bg-white rounded-3xl p-6 border-2 border-stone-200 hover:border-red-400/80 cursor-pointer shadow-sm flex flex-col justify-between group transition-all"
              id="select-mode-habla"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center group-hover:bg-[#E05353] group-hover:text-white transition-all">
                  <Mic className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-display font-bold text-lg text-stone-850 flex items-center gap-2">
                    <span>Estudiar el Habla (口頭)</span>
                  </h3>
                  <span className="inline-block text-[10px] bg-red-100/75 text-red-800 font-bold tracking-wider px-2 py-0.5 rounded-full uppercase mt-1 mb-2">Recomendado</span>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Practica pronunciación de oraciones cotidianas y simula chats reales con clientes, cajeros u hostales guiados por audio real nativo.
                  </p>
                </div>
              </div>
              
              <div className="mt-8 flex items-center justify-between text-xs text-stone-400 font-semibold border-t border-stone-100 pt-4 group-hover:text-red-500 transition-colors">
                <span>Evaluación de pronunciación por IA</span>
                <span className="text-base">→</span>
              </div>
            </motion.div>

            {/* Mode Option 2: ESCRITURA */}
            <motion.div
              whileHover={{ y: -4, scale: 1.01 }}
              onClick={() => setAppMode('escritura')}
              className="bg-white rounded-3xl p-6 border-2 border-stone-200 hover:border-indigo-400/80 cursor-pointer shadow-sm flex flex-col justify-between group transition-all"
              id="select-mode-escritura"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  <PenTool className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-display font-bold text-lg text-stone-850 flex items-center gap-2">
                    <span>Estudiar Escritura (筆記)</span>
                  </h3>
                  <span className="inline-block text-[10px] bg-indigo-100/75 text-indigo-800 font-bold tracking-wider px-2 py-0.5 rounded-full uppercase mt-1 mb-2">Interactiva</span>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Aprende el silabario Kana y escribe vocabulario de supervivencia. Completa ejercicios de redacción con teclado o letra por letra.
                  </p>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between text-xs text-stone-400 font-semibold border-t border-stone-100 pt-4 group-hover:text-indigo-650 transition-colors">
                <span>Quiz de deletreo y diálogos</span>
                <span className="text-base">→</span>
              </div>
            </motion.div>

            {/* Mode Option 3: CHARLA LIBRE IA TUTOR */}
            <motion.div
              whileHover={{ y: -4, scale: 1.01 }}
              onClick={() => setAppMode('tutor')}
              className="bg-white rounded-3xl p-6 border-2 border-stone-200 hover:border-[#E05353] cursor-pointer shadow-sm flex flex-col justify-between group transition-all"
              id="select-mode-tutor"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-all">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-display font-bold text-lg text-stone-850 flex items-center gap-2">
                    <span>Charla Libre (フリートーク)</span>
                  </h3>
                  <span className="inline-block text-[10px] bg-amber-100/75 text-amber-800 font-bold tracking-wider px-2 py-0.5 rounded-full uppercase mt-1 mb-2">Tutor de IA Integrado</span>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Conversa sin libreto ni límites de temas con Sakura Sensei. Su objetivo principal es enseñarte, corregir tus partículas y responder dudas.
                  </p>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between text-xs text-stone-400 font-semibold border-t border-stone-100 pt-4 group-hover:text-amber-600 transition-colors">
                <span>Desglose de vocabulario y gramática</span>
                <span className="text-base">→</span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* API warning key safety bottom bar */}
        {isApiKeyMissing && (
          <div className="bg-amber-100 border border-amber-300 text-amber-900 rounded-2xl p-3 max-w-md text-xs text-center flex items-center gap-3 shadow-xs mb-4">
            <ShieldAlert className="w-4.5 h-4.5 text-amber-700 shrink-0" />
            <p>La clave API no se encuentra asignada. Los ejercicios básicos están activos pero la IA necesitará que ingreses la <code>GEMINI_API_KEY</code> en la barra de Ajustes para darte análisis personalizado.</p>
          </div>
        )}

        {/* Footer info */}
        <p className="text-stone-400 text-xs text-center pb-2">
          Creado con ♥ para estudiantes de japonés. Soporta síntesis de texto a voz y reconocimiento de voz nativos.
        </p>
      </div>
    );
  }

  // Active Dashboard Experience
  const activeIcon = selectedLesson.icon;
  const ActiveIconComponent = ICONS_MAP[activeIcon] || BookOpen;

  return (
    <div className="min-h-screen bg-[#F6F3ED] text-[#2C302E] flex flex-col font-sans">
      
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-stone-200/80 px-4 py-3 sticky top-0 z-50 shadow-xs" id="navigation-top-bar">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-3">
          
          {/* Brand/Back to mode selection */}
          <div className="flex items-center gap-3">
            <button
              id="btn-back-home"
              onClick={() => setAppMode('start')}
              className="p-1.5 hover:bg-stone-100 rounded-lg text-stone-500 hover:text-stone-800 transition"
              title="Volver a la selección de modo"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-[#E05353] flex items-center justify-center text-white font-display font-medium text-xs shadow-xs">
                和
              </span>
              <div>
                <span className="font-display font-bold text-sm tracking-wide text-stone-850 flex items-center gap-1.5 leading-none">
                  <span>NihongoTalk</span>
                  <ColombiaFlagCircle className="w-3.5 h-3.5" />
                </span>
                <span className="text-[10px] text-stone-400 font-semibold block mt-0.5">Estudiante: <strong className="text-stone-600">{studentName}</strong></span>
              </div>
            </div>
          </div>

          {/* Quick mode swapper widget */}
          <div className="flex bg-[#F6F3ED] p-1 rounded-xl shrink-0" id="mode-badge-swapper">
            <button
              id="swap-mode-habla"
              onClick={() => {
                setAppMode('habla');
                setActiveTab('study');
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                appMode === 'habla'
                  ? 'bg-white text-red-600 shadow-xs'
                  : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Hablar (口頭)</span>
            </button>
            <button
              id="swap-mode-escritura"
              onClick={() => {
                setAppMode('escritura');
                setActiveTab('study');
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                appMode === 'escritura'
                  ? 'bg-white text-indigo-650 shadow-xs'
                  : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>Escribir (筆記)</span>
            </button>
            <button
              id="swap-mode-tutor"
              onClick={() => {
                setAppMode('tutor');
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                appMode === 'tutor'
                  ? 'bg-white text-amber-600 shadow-xs'
                  : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Charla Libre (会話)</span>
            </button>
          </div>

          {/* User Score Stats bar */}
          <div className="flex items-center gap-3 bg-stone-50 px-3.5 py-1.5 rounded-full border border-stone-200">
            <div className="flex items-center gap-1 text-xs text-amber-700 font-bold">
              <Star className="w-4 h-4 fill-amber-400 stroke-amber-500" />
              <span>{totalXP} XP</span>
            </div>
            <div className="w-px h-3 bg-stone-200" />
            <div className="flex items-center gap-1.5 text-xs text-stone-600 font-medium">
              <GraduationCap className="w-4 h-4 text-indigo-500" />
              <span>{lessonsCompletedCount} Lecciones</span>
            </div>
          </div>

        </div>
      </nav>

      {/* Main Container Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6">
        {appMode === 'tutor' ? (
          <TutorView
            tutorMessages={tutorMessages}
            setTutorMessages={setTutorMessages}
            isChatSending={isChatSending}
            chatInput={chatInput}
            setChatInput={setChatInput}
            isApiKeyMissing={isApiKeyMissing}
            studentName={studentName}
            handleSendTutorMessage={handleSendTutorMessage}
            handleSpeakText={handleSpeakText}
            speakingId={speakingId}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Sidebar/Drawer of Situation lessons list */}
        <aside className="md:col-span-1 space-y-4">
          <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-xs">
            <h3 className="text-xs uppercase font-bold tracking-wider text-stone-400 px-1 mb-3">
              Situaciones Cotidianas
            </h3>
            <div className="space-y-1.5">
              {lessonsData.map((lesson) => {
                const isSelected = selectedLessonId === lesson.id;
                const LessonIcon = ICONS_MAP[lesson.icon] || BookOpen;
                
                // Count completed phrase activities in this lesson
                const lessonPhrasesCount = lesson.practicePhrases.length;
                const completedInLesson = lesson.practicePhrases.filter(p => (completedPhrases[p.id] || 0) >= 70).length;

                return (
                  <button
                    key={lesson.id}
                    id={`sidebar-lesson-${lesson.id}`}
                    onClick={() => {
                      setSelectedLessonId(lesson.id);
                      setActiveTab('study');
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all duration-200 ${
                      isSelected
                        ? 'bg-stone-50 border-stone-300 text-stone-900 font-semibold shadow-xs'
                        : 'bg-transparent border-transparent hover:bg-stone-50/50 text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                        isSelected 
                          ? 'bg-red-50 border-red-200 text-red-500' 
                          : 'bg-stone-100 border-stone-200 text-stone-400'
                      }`}>
                        <LessonIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs block text-stone-450 font-medium font-sans">
                          {lesson.japaneseTitle}
                        </span>
                        <span className="text-sm block text-stone-800 line-clamp-1 leading-tight">
                          {lesson.title}
                        </span>
                      </div>
                    </div>

                    {completedInLesson > 0 && (
                      <div className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full px-1.5 py-0.5 shrink-0 font-bold">
                        {completedInLesson}/{lessonPhrasesCount}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Language Helpers block */}
          <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider px-1">Conceptos Útiles</h4>
            <div className="text-xs space-y-2 leading-relaxed text-stone-600">
              <p>🌸 <strong>Deletreo</strong>: En japonés "o" larga se suele escribir como <em>ou</em> (obentou). Las consonantes dobles usan un pequeño tsu (っ).</p>
              <p>🗣️ <strong>Partículas</strong>: La partícula <strong>o</strong> (objeto) se escribe y tipea como <em>o</em> (を), y la partícula de tema <strong>wa</strong> se tipea <em>ha</em> (は).</p>
            </div>
          </div>
        </aside>

        {/* Central Lesson Detail Container */}
        <main className="md:col-span-3 space-y-6">
          
          {/* Situation Header */}
          <motion.div 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 border border-amber-950/10 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            id="situation-hero-card"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#E05353] text-white flex items-center justify-center shadow-md">
                <ActiveIconComponent className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#E05353] font-bold uppercase tracking-widest bg-red-50 border border-red-100 rounded-full px-2.5 py-0.5">
                    {selectedLesson.level}
                  </span>
                  <span className="text-xs font-mono text-stone-400 font-semibold">{selectedLesson.japaneseTitle}</span>
                </div>
                <h2 className="text-2xl font-display font-medium text-stone-850">
                  {selectedLesson.title}
                </h2>
                <p className="text-[#6D6B64] text-xs max-w-xl leading-relaxed">
                  {selectedLesson.description}
                </p>
              </div>
            </div>

            {/* Quick action button */}
            <div className="flex items-center gap-1.5">
              <button
                id="btn-speak-initial-lesson"
                onClick={() => handleSpeakText(selectedLesson.initialMessage)}
                className={`p-2 rounded-xl transition ${
                  speakingId === selectedLesson.initialMessage
                    ? 'bg-red-100 text-red-500'
                    : 'bg-stone-50 hover:bg-stone-150 border border-stone-200 text-stone-500'
                }`}
                title="Escuchar saludo inicial de la situación"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>

          {/* Sub Navigation Tabs inside Lesson (Study, Practice, Real Interaction) */}
          <div className="flex border-b border-stone-200">
            <button
              id="subtab-study"
              onClick={() => setActiveTab('study')}
              className={`py-2 px-4 font-semibold text-sm transition-all relative ${
                activeTab === 'study'
                  ? 'text-indigo-600'
                  : 'text-stone-400 hover:text-stone-600'
              }`}
            >
              1. Estudiar Vocabulario {activeTab === 'study' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />}
            </button>

            <button
              id="subtab-practice"
              onClick={() => setActiveTab('practice')}
              className={`py-2 px-4 font-semibold text-sm transition-all relative ${
                activeTab === 'practice'
                  ? 'text-indigo-600'
                  : 'text-stone-400 hover:text-stone-600'
              }`}
            >
              {appMode === 'habla' ? '2. Práctica Oral' : '2. Ejercicios Escritos'} {activeTab === 'practice' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />}
            </button>

            <button
              id="subtab-chat"
              onClick={() => setActiveTab('chat')}
              className={`py-2 px-4 font-semibold text-sm transition-all relative ${
                activeTab === 'chat'
                  ? 'text-indigo-600'
                  : 'text-stone-400 hover:text-stone-600'
              }`}
            >
              3. Conversación de IA {activeTab === 'chat' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />}
            </button>
          </div>

          {/* Tab Rendering Router Area */}
          <div className="min-h-[400px]">
            {activeTab === 'study' && (
              <StudyTab 
                lesson={selectedLesson} 
                onSpeak={handleSpeakText} 
                speakingId={speakingId} 
              />
            )}

            {activeTab === 'practice' && (
              appMode === 'habla' ? (
                <OralPracticeTab 
                  lesson={selectedLesson} 
                  onSpeak={handleSpeakText} 
                  speakingId={speakingId} 
                  onPhrasePassed={handlePhrasePassed}
                />
              ) : (
                <WritingPracticeTab 
                  lesson={selectedLesson} 
                />
              )
            )}

            {/* Simulated/AI real back-and-forth chat component */}
            {activeTab === 'chat' && (
              <div className="bg-white rounded-3xl border border-stone-250/70 shadow-xs flex flex-col h-[520px] overflow-hidden">
                {/* Chat Head */}
                <div className="bg-stone-50/50 border-b border-stone-150 px-5 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-display font-bold text-sm">
                      JP
                    </div>
                    <div>
                      <span className="font-semibold text-[#2C302E] block text-sm">
                        {selectedLesson.partnerCharacter}
                      </span>
                      <span className="text-[10px] text-emerald-600 font-bold block leading-none mt-0.5">
                        ● Conectado
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      id="btn-reset-current-chat"
                      onClick={() => {
                        if (confirm("¿Seguro que deseas reiniciar esta simulación de chat?")) {
                          setChats(prev => ({
                            ...prev,
                            [selectedLessonId]: [
                              {
                                id: `${selectedLessonId}-init`,
                                role: 'model',
                                japanese: selectedLesson.initialMessage,
                                romaji: selectedLesson.initialMessageRomaji,
                                spanish: selectedLesson.initialMessageSpanish,
                                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              }
                            ]
                          }));
                        }
                      }}
                      className="text-stone-400 hover:text-stone-600 p-2 rounded-lg hover:bg-stone-100 transition text-xs flex items-center gap-1 font-semibold"
                      title="Reiniciar chat"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reiniciar</span>
                    </button>
                  </div>
                </div>

                {/* API Missing Banner */}
                {isApiKeyMissing && (
                  <div className="bg-red-50 text-red-800 border-b border-red-150 px-4 py-2 text-xs font-medium text-center">
                    💥 No hay clave api configurada. Usa el simulador escribiendo tu texto libremente o configura tu <code>GEMINI_API_KEY</code> en Settings para recibir corrección instantánea de IA.
                  </div>
                )}

                {/* Chat Bubble Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50/20" id="chat-messages-container">
                  {(chats[selectedLessonId] || []).map((message) => {
                    const isModel = message.role === 'model';
                    
                    return (
                      <div
                        key={message.id}
                        id={`chat-msg-${message.id}`}
                        className={`flex flex-col max-w-[85%] ${
                          isModel ? 'self-start items-start' : 'self-end items-end ml-auto'
                        }`}
                      >
                        {/* Bubble */}
                        <div className={`p-4 rounded-2xl text-sm leading-relaxed relative border ${
                          isModel 
                            ? 'bg-white text-stone-800 border-dotted border-stone-250 rounded-tl-none' 
                            : 'bg-indigo-600 text-white border-indigo-700 rounded-tr-none shadow-sm'
                        }`}>
                          <p className="font-sans font-medium text-[15px] tracking-wide">
                            {message.japanese}
                          </p>
                          
                          {message.romaji && (
                            <p className={`text-xs mt-1 font-mono ${isModel ? 'text-stone-550' : 'text-indigo-200'}`}>
                              {message.romaji}
                            </p>
                          )}

                          {message.spanish && (
                            <p className={`text-xs mt-1.5 pt-1.5 border-t ${
                              isModel ? 'text-stone-600 border-stone-100' : 'text-indigo-100 border-indigo-500'
                            }`}>
                              {message.spanish}
                            </p>
                          )}

                          {isModel && (
                            <button
                              id={`chat-msg-speak-${message.id}`}
                              onClick={() => handleSpeakText(message.japanese)}
                              className={`absolute -right-2 -bottom-2 p-1.5 rounded-full border transition ${
                                speakingId === message.japanese
                                  ? 'bg-red-500 text-white'
                                  : 'bg-white text-stone-400 hover:text-stone-600 shadow-xs'
                              }`}
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {/* Detailed Kanji/Vocab Word Breakdown List */}
                        {isModel && message.breakdown && message.breakdown.length > 0 && (
                          <div className="mt-2.5 flex flex-wrap gap-1.5 p-2.5 bg-white border border-stone-200 rounded-xl max-w-lg shadow-3xs animate-fadeIn">
                            {message.breakdown.map((item, idx) => (
                              <div 
                                key={idx} 
                                className="bg-stone-50 hover:bg-red-50 px-2 py-1 rounded-lg border border-stone-150 flex flex-col items-center min-w-[3rem] text-center hover:border-red-350 transition-colors"
                              >
                                <span className="font-bold text-stone-850 text-xs font-sans">{item.japanese}</span>
                                <span className="text-[8px] text-stone-400 font-mono -mt-0.5">{item.romaji}</span>
                                <span className="text-[9.5px] text-stone-605 font-medium font-sans leading-tight mt-0.5 border-t border-stone-200 w-full pt-1">{item.spanish}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Educational Evaluator Box from Model reply to previous message */}
                        {isModel && message.feedback && (
                          <div className="bg-amber-50/80 border border-amber-250/70 p-3.5 rounded-xl text-xs text-stone-800 mt-2.5 max-w-md shadow-xs animate-fadeIn space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-bold flex items-center gap-1 text-amber-900">
                                <Sparkles className="w-3.5 h-3.5 text-amber-600 fill-amber-300" />
                                <span>Tutor de Japonés IA</span>
                              </span>
                              <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                (message.feedback.score || 0) >= 80 
                                  ? 'bg-emerald-100 text-emerald-850' 
                                  : 'bg-amber-100 text-amber-850'
                              }`}>
                                {message.feedback.score}% Naturalidad
                              </span>
                            </div>

                            {message.feedback.corrections ? (
                              <p className="text-stone-700 leading-relaxed font-sans">
                                📌 <strong>Corrección:</strong> {message.feedback.corrections}
                              </p>
                            ) : (
                              <p className="text-emerald-700 font-semibold leading-relaxed font-sans">
                                ✓ ¡Estructura gramatical correcta y natural! Buenas partículas.
                              </p>
                            )}

                            {message.feedback.naturalAlternative && (
                              <p className="text-stone-750 font-sans">
                                💡 <strong>Alternativa nativa:</strong> <span className="font-medium text-stone-900 bg-stone-150 rounded px-1.5 py-0.5">{message.feedback.naturalAlternative}</span>
                              </p>
                            )}

                            {message.feedback.explanation && (
                              <p className="text-[#6D6B64] italic text-[11px] leading-relaxed pt-1.5 border-t border-amber-900/5">
                                • {message.feedback.explanation}
                              </p>
                            )}
                          </div>
                        )}

                        <span className="text-[10px] text-stone-400 mt-1 select-none">
                          {message.timestamp}
                        </span>
                      </div>
                    );
                  })}
                  {isChatSending && (
                    <div className="flex gap-2 items-center self-start bg-white p-3 rounded-2xl rounded-tl-none border border-stone-200">
                      <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce delay-75" />
                      <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce delay-150" />
                    </div>
                  )}
                  <div ref={chatBottomRef} />
                </div>

                {/* Chat Input controls */}
                <form onSubmit={handleSendChatMessage} className="bg-white border-t border-stone-200 px-4 py-3 flex items-center gap-2">
                  {appMode === 'habla' && (
                    <button
                      type="button"
                      id="btn-voice-chat-input"
                      onClick={toggleListeningChatInput}
                      className={`p-3 rounded-xl transition shrink-0 ${
                        isChatListening
                          ? 'bg-red-500 text-white animate-pulse'
                          : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                      }`}
                      title="Hablar mediante micrófono en japonés"
                    >
                      <Mic className="w-5 h-5" />
                    </button>
                  )}

                  <input
                    type="text"
                    id="chat-user-input-field"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={
                      isChatListening 
                        ? 'Escuchando tu voz...' 
                        : appMode === 'habla' 
                        ? 'Responde al personaje en japonés...' 
                        : 'Deletrea o escribe tu respuesta en japonés...'
                    }
                    disabled={isChatSending}
                    className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm text-[#2C302E] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />

                  <button
                    type="submit"
                    id="btn-submit-chat-input"
                    disabled={!chatInput.trim() || isChatSending}
                    className="p-3 bg-indigo-650 disabled:opacity-40 text-white rounded-xl hover:bg-indigo-700 transition"
                  >
                    <Send className="w-4.5 h-4.5" />
                  </button>
                </form>
              </div>
            )}
          </div>
        </main>
          </div>
        )}
      </div>
    </div>
  );
}
