import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Volume2, 
  RotateCcw, 
  Send, 
  Mic, 
  MicOff, 
  Coffee, 
  HelpCircle, 
  Lightbulb, 
  AlertCircle,
  CheckCircle2,
  Bookmark
} from 'lucide-react';
import { ChatMessage } from '../types';

interface TutorViewProps {
  tutorMessages: ChatMessage[];
  setTutorMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  isChatSending: boolean;
  chatInput: string;
  setChatInput: (val: string) => void;
  isApiKeyMissing: boolean;
  studentName: string;
  handleSendTutorMessage: (e?: React.FormEvent, customText?: string) => Promise<void>;
  handleSpeakText: (text: string) => void;
  speakingId: string | null;
}

export default function TutorView({
  tutorMessages,
  setTutorMessages,
  isChatSending,
  chatInput,
  setChatInput,
  isApiKeyMissing,
  studentName,
  handleSendTutorMessage,
  handleSpeakText,
  speakingId
}: TutorViewProps) {
  const [localListening, setLocalListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [tutorMessages, isChatSending]);

  // Voice Speech Recognition toggle for Tutor
  const toggleListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Tu dispositivo móvil o navegador no soporta reconocimiento de voz nativo en japonés. Te recomendamos escribir.");
      return;
    }

    if (localListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setLocalListening(false);
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.lang = 'ja-JP';
      rec.continuous = false;
      rec.interimResults = false;

      rec.onstart = () => {
        setLocalListening(true);
      };

      rec.onresult = (e: any) => {
        const text = e.results[0][0].transcript;
        setChatInput(text);
      };

      rec.onerror = () => {
        setLocalListening(false);
      };

      rec.onend = () => {
        setLocalListening(false);
      };

      recognitionRef.current = rec;
      rec.start();
    } catch {
      setLocalListening(false);
    }
  };

  // Clean conversational prompt templates
  const WARMUP_PROMPTS = [
    {
      label: 'Presentarse',
      japanese: 'はじめまして！自己紹介をします。私の名前は' + studentName + 'です。',
      spanish: 'Preséntate a Sakura Sensei en japonés.'
    },
    {
      label: 'Pedir refrán',
      japanese: '日本の面白いことわざを一つ日本語で教えてください！',
      spanish: 'Pídele un proverbio tradicional japonés.'
    },
    {
      label: 'Quiz de partículas',
      japanese: '日本語の助詞のクイズを一つ出してください！',
      spanish: 'Pídele que te haga una pregunta de partículas.'
    },
    {
      label: 'Preguntar gramática',
      japanese: '日本語の「は」と「が」の違いをやさしく教えて！',
      spanish: 'Pregunta la diferencia entre "wa" y "ga".'
    }
  ];

  const handleResetChat = () => {
    if (confirm("¿Estás seguro de que deseas reiniciar tu historial de chat libre con Sakura Sensei?")) {
      const initialMsg: ChatMessage = {
        id: 'tutor-init',
        role: 'model',
        japanese: 'こんにちは！私はサクラ先生です. 何でも質問したり、楽しく日本語でおしゃべりしましょう！🌸',
        romaji: 'Konnichiwa! Watashi wa Sakura sensei desu. Nandemo shitsumon shitari, tanoshiku Nihongo de oshaberi shimashou!',
        spanish: '¡Hola! Soy tu sensei Sakura. Podemos charlar libremente sobre lo que gustes, practicar tu habla sin presión o resolver cualquier duda de gramática o vocabulario en español. ¿De qué te gustaría hablar hoy? (Creada por SAN-666 con orgullo colombiano 🇨🇴)',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setTutorMessages([initialMsg]);
      localStorage.setItem('japanese_tutor_chat', JSON.stringify([initialMsg]));
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
      
      {/* Sidebar: Teacher bio and tools */}
      <div className="lg:col-span-1 space-y-5">
        
        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs text-center relative overflow-hidden">
          {/* Subtle decoration accent */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-400 via-amber-400 to-yellow-400" />
          
          <div className="relative inline-block mt-3 mb-2">
            {/* Avatar Circle */}
            <div className="w-18 h-18 rounded-full bg-red-50 border-2 border-red-200 flex items-center justify-center mx-auto text-3xl select-none">
              👩‍🏫
            </div>
            {/* Colombia Floating Sticker Badge */}
            <div className="absolute -bottom-1.5 -right-1.5 bg-white p-1 rounded-full shadow-md border border-stone-150 flex items-center justify-center" title="Orgullo Colombiano">
              <span className="w-4 h-4 rounded-full bg-gradient-to-b from-yellow-300 via-blue-500 to-red-500 flex animate-pulse shrink-0" />
            </div>
          </div>

          <h3 className="font-display font-bold text-base text-stone-800">
            Sakura Sensei 🌸
          </h3>
          <p className="text-[10px] bg-red-50 text-red-700 font-extrabold uppercase px-2.5 py-0.5 rounded-full inline-block tracking-wider mt-1.5">
            Tutor Virtual de IA
          </p>
          
          <div className="bg-stone-50 border border-stone-150 rounded-xl p-3 mt-4 text-xs text-stone-550 leading-relaxed text-left space-y-1.5">
            <p className="flex items-center gap-1.5 font-bold text-stone-700">
              <Coffee className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Acerca de la Sensei:</span>
            </p>
            <p>¡Creada por <strong>SAN-666</strong>! Con su corazón en Colombia y su sabiduría de Japón, le encanta tomar café mientras te guía y corrige con paciencia infinita.</p>
            <div className="text-[10px] font-mono bg-stone-100 rounded px-1.5 py-0.5 text-center block text-stone-400">
              Sin contexto ni guión previo
            </div>
          </div>

          <button
            onClick={handleResetChat}
            className="w-full mt-4 py-2 bg-stone-100 hover:bg-red-50 hover:text-red-700 text-stone-550 border border-stone-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reiniciar conversación</span>
          </button>
        </div>

        {/* Suggestion Prompt Cards */}
        <div className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-xs space-y-3">
          <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider px-1 flex items-center gap-1.5">
            <Lightbulb className="w-4 h-4 text-yellow-500" />
            <span>Temas para iniciar</span>
          </h4>
          
          <div className="space-y-2">
            {WARMUP_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendTutorMessage(undefined, prompt.japanese)}
                disabled={isChatSending}
                className="w-full bg-stone-50/50 hover:bg-amber-50/70 border border-stone-155 hover:border-amber-300 rounded-xl p-2.5 text-left transition-all duration-200 group text-xs text-stone-700 disabled:opacity-50"
              >
                <div className="flex justify-between items-center font-bold text-stone-850 mb-0.5">
                  <span className="group-hover:text-amber-800 text-[11px]">{prompt.label}</span>
                  <span className="text-stone-300 group-hover:text-amber-500 font-bold">→</span>
                </div>
                <p className="font-mono text-[10px] text-stone-500 line-clamp-1 group-hover:text-stone-700 mb-0.5">{prompt.japanese}</p>
                <p className="text-[10px] text-stone-400 italic line-clamp-1">{prompt.spanish}</p>
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Main Chat Deck */}
      <div className="lg:col-span-3 flex flex-col bg-white rounded-2xl border border-stone-200/80 shadow-xs h-[550px] overflow-hidden" id="tutor-chat-deck">
        
        {/* Chat Deck Header */}
        <div className="bg-stone-50/50 border-b border-stone-200/80 px-5 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-display font-bold text-sm text-stone-800">Sala de Tutorías (チャット)</span>
          </div>
          <div className="text-[11px] font-mono text-stone-405 font-bold">
            Estudiante: {studentName}
          </div>
        </div>

        {/* Warn if Missing API Key */}
        {isApiKeyMissing && (
          <div className="bg-red-50 text-red-800 border-b border-stone-200 px-4 py-2.5 text-xs font-medium text-center shrink-0">
            ⚠️ No hay clave API configurada en Secrets. Sakura Sensei no podrá responder automáticamente hasta que configures tu <code>GEMINI_API_KEY</code> en la barra.
          </div>
        )}

        {/* Message Thread Scroll Box */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-stone-50/25" id="tutor-thread-box">
          {tutorMessages.map((msg) => {
            const isModel = msg.role === 'model';
            
            return (
              <div 
                key={msg.id}
                className={`flex flex-col max-w-[85%] ${
                  isModel ? 'self-start items-start' : 'self-end items-end ml-auto'
                }`}
              >
                {/* Visual bubble */}
                <div className={`p-4 rounded-2xl text-sm leading-relaxed relative border ${
                  isModel 
                    ? 'bg-white text-stone-950 border-stone-200 rounded-tl-none shadow-3xs' 
                    : 'bg-stone-850 text-white border-stone-900 rounded-tr-none shadow-xs'
                }`}>
                  {/* Japanese Main Text */}
                  <p className={`font-sans font-semibold text-[15px] tracking-wide ${isModel ? 'text-stone-900' : 'text-white'}`}>
                    {msg.japanese}
                  </p>
                  
                  {/* Romaji readable guide */}
                  {msg.romaji && (
                    <p className={`text-xs mt-1 font-mono ${isModel ? 'text-stone-500' : 'text-stone-300'}`}>
                      {msg.romaji}
                    </p>
                  )}

                  {/* Spanish translation line */}
                  {msg.spanish && (
                    <p className={`text-xs mt-2 pt-1.5 border-t ${
                      isModel ? 'text-stone-600 border-stone-100' : 'text-stone-300 border-stone-700'
                    }`}>
                      {msg.spanish}
                    </p>
                  )}

                  {/* Audio Speaker trigger */}
                  {isModel && (
                    <button
                      onClick={() => handleSpeakText(msg.japanese)}
                      className={`absolute -right-2 -bottom-2 p-1.5 rounded-full border transition-all ${
                        speakingId === msg.japanese
                          ? 'bg-red-500 text-white border-red-600 shadow-md'
                          : 'bg-white text-stone-400 hover:text-[#E05353] border-stone-200 hover:border-red-200 shadow-2xs'
                      }`}
                      title="Escuchar audio nativo"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Detailed Kanji/Vocab Word Breakdown List */}
                {isModel && msg.breakdown && msg.breakdown.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5 p-3 bg-white border border-stone-150 rounded-xl max-w-lg shadow-3xs animate-fadeIn">
                    <div className="w-full text-[9px] text-stone-400 font-extrabold uppercase tracking-wider mb-1 flex items-center gap-1 select-none">
                      <Bookmark className="w-3 h-3 text-red-500 fill-red-100" />
                      <span>Análisis palabra por palabra (単語分析):</span>
                    </div>
                    {msg.breakdown.map((item, idx) => (
                      <div 
                        key={idx} 
                        className="bg-stone-50 hover:bg-red-50 px-2 py-1 rounded-lg border border-stone-200 shadow-3xs flex flex-col items-center min-w-[3.5rem] text-center hover:border-red-300 transition-colors"
                      >
                        <span className="font-bold text-stone-800 text-xs font-sans select-all">{item.japanese}</span>
                        <span className="text-[8px] text-stone-450 font-mono -mt-0.5 select-all">{item.romaji}</span>
                        <span className="text-[10px] text-stone-600 font-medium font-sans leading-tight mt-1 border-t border-stone-150 w-full pt-0.5 select-all">{item.spanish}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Real-time tutor evaluation card */}
                {isModel && msg.feedback && (
                  <div className="bg-amber-50/80 border border-amber-250 p-3.5 rounded-xl text-xs text-stone-800 mt-2.5 max-w-md shadow-3xs animate-fadeIn space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold flex items-center gap-1.5 text-amber-900">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600 fill-amber-200" />
                        <span>Retroalimentación de Sakura</span>
                      </span>
                      <span className={`px-2 py-0.5 rounded-full font-extrabold text-[10px] ${
                        (msg.feedback.score ?? 0) >= 80 
                          ? 'bg-emerald-100/80 text-emerald-850 border border-emerald-250' 
                          : 'bg-amber-100/80 text-amber-850 border border-amber-200'
                      }`}>
                        {msg.feedback.score}% Naturalidad
                      </span>
                    </div>

                    {msg.feedback.corrections ? (
                      <p className="text-stone-750 leading-relaxed font-sans mt-1">
                        📌 <strong>Corrección:</strong> {msg.feedback.corrections}
                      </p>
                    ) : (
                      <p className="text-emerald-750 font-semibold leading-relaxed font-sans mt-1">
                        ✓ ¡Gramática y vocabulario excelentes! Sigue hablando así.
                      </p>
                    )}

                    {msg.feedback.naturalAlternative && (
                      <p className="text-stone-750 font-sans">
                        💡 <strong>Alternativa nativa:</strong> <span className="font-semibold text-stone-900 bg-stone-100 rounded px-1.5 py-0.5 border border-stone-200">{msg.feedback.naturalAlternative}</span>
                      </p>
                    )}

                    {msg.feedback.explanation && (
                      <p className="text-[#6D6B64] italic text-[11px] leading-relaxed pt-1.5 border-t border-amber-900/10">
                        • {msg.feedback.explanation}
                      </p>
                    )}
                  </div>
                )}

                <span className="text-[9px] text-stone-400 mt-1 pl-1">
                  {msg.timestamp}
                </span>

              </div>
            );
          })}

          {/* AI Loader bubble */}
          {isChatSending && (
            <div className="flex gap-2 items-center self-start bg-white p-3.5 rounded-2xl rounded-tl-none border border-stone-200">
              <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mr-1">Sakura está escribiendo...</span>
              <div className="w-2 h-2 bg-[#E05353] rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-[#E05353] rounded-full animate-bounce delay-75" />
              <div className="w-2 h-2 bg-[#E05353] rounded-full animate-bounce delay-150" />
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Action input control footer */}
        <div className="p-4 bg-stone-50/50 border-t border-stone-200/80 shrink-0">
          <form onSubmit={handleSendTutorMessage} className="flex gap-2">
            
            {/* Audio Voice mic toggle */}
            <button
              type="button"
              onClick={toggleListening}
              className={`p-3 rounded-xl border transition-all ${
                localListening
                  ? 'bg-red-550 border-red-600 text-white animate-pulse'
                  : 'bg-white text-stone-400 hover:text-stone-700 border-stone-250 hover:border-stone-350 shadow-3xs'
              }`}
              title={localListening ? "Detener grabación de voz" : "Grabar habla en japonés"}
            >
              {localListening ? <MicOff className="w-4.5 h-4.5" /> : <Mic className="w-4.5 h-4.5" />}
            </button>

            {/* Main string input */}
            <input
              type="text"
              id="tutor-chat-input-field"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              disabled={isChatSending}
              placeholder={localListening ? "Habla en japonés ahora..." : "Escribe en japonés (o consulta a Sakura en español)..."}
              className="flex-1 bg-white border border-stone-250 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#E05353] shadow-3xs text-stone-900 font-sans disabled:opacity-50"
            />

            {/* Submit sender icon */}
            <button
              type="submit"
              disabled={!chatInput.trim() || isChatSending}
              className="px-4 py-2.5 bg-stone-850 hover:bg-[#E05353] text-white rounded-xl shadow-xs transition-colors font-bold text-xs flex items-center gap-1.5 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Enviar</span>
            </button>
          </form>
          <div className="text-[10px] text-stone-400 text-center mt-2 font-medium">
            💡 Consejo: puedes escribir en español sobre gramática o responderle libremente en japonés.
          </div>
        </div>

      </div>

    </div>
  );
}
