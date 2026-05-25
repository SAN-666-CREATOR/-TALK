import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, Volume2, Award, RefreshCw, Check, Star, AlertCircle } from 'lucide-react';
import { Lesson, PracticePhrase } from '../types';

interface OralPracticeTabProps {
  lesson: Lesson;
  onSpeak: (text: string) => void;
  speakingId: string | null;
  onPhrasePassed: (phraseId: string, score: number) => void;
}

interface EvaluationResult {
  accuracyScore: number;
  feedback: string;
  matched: boolean;
  detectedWords: string;
}

export default function OralPracticeTab({ lesson, onSpeak, speakingId, onPhrasePassed }: OralPracticeTabProps) {
  const [selectedPhrase, setSelectedPhrase] = useState<PracticePhrase>(lesson.practicePhrases[0]);
  const [isRecording, setIsRecording] = useState(false);
  const [spokenTranscript, setSpokenTranscript] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Reset state on phrase change
    setSpokenTranscript('');
    setEvaluation(null);
    setErrorMsg('');
    setIsRecording(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
    }
  }, [selectedPhrase]);

  const startSpeechRecognition = () => {
    setErrorMsg('');
    setEvaluation(null);
    setSpokenTranscript('');

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setErrorMsg("Tu navegador no soporta el reconocimiento de voz nativo. Por favor, escribe lo que dirías en el cuadro inferior.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = 'ja-JP'; // Set Japanese!
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSpokenTranscript(transcript);
        evaluateSpeech(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event);
        if (event.error === 'not-allowed') {
          setErrorMsg("Permiso de micrófono denegado. Habilita el acceso en tu navegador para practicar de forma oral.");
        } else {
          setErrorMsg(`Error al escuchar (${event.error}). Intenta presionar el botón de nuevo.`);
        }
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e: any) {
      console.error(e);
      setErrorMsg("Error al iniciar el micrófono.");
      setIsRecording(false);
    }
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const evaluateSpeech = async (transcript: string) => {
    setIsEvaluating(true);
    try {
      const response = await fetch('/api/evaluate-phrase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetJapanese: selectedPhrase.japanese,
          targetRomaji: selectedPhrase.romaji,
          spokenText: transcript
        })
      });

      if (!response.ok) {
        throw new Error("No se pudo evaluar tu pronunciación.");
      }

      const result: EvaluationResult = await response.json();
      setEvaluation(result);
      if (result.matched) {
        onPhrasePassed(selectedPhrase.id, result.accuracyScore);
      }
    } catch (err: any) {
      console.error("Evaluation error:", err);
      setErrorMsg("No se pudo obtener el análisis del tutor de IA. ¿Tienes configurada tu GEMINI_API_KEY?");
    } finally {
      setIsEvaluating(false);
    }
  };

  // Helper to allow manual typing on devices without mic capability or in emulator
  const handleManualSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const typed = data.get('typedText') as string;
    if (typed.trim()) {
      setSpokenTranscript(typed);
      evaluateSpeech(typed);
      e.currentTarget.reset();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Columna Izquierda: Listado de Frases */}
      <div className="lg:col-span-1 space-y-3">
        <div className="bg-white rounded-2xl p-4 border border-stone-200/60 shadow-sm">
          <h3 className="font-display font-semibold text-[#2C302E] text-base mb-3 px-1">Frases de Práctica</h3>
          <div className="space-y-2">
            {lesson.practicePhrases.map((phrase) => {
              const isSelected = selectedPhrase.id === phrase.id;
              return (
                <button
                  key={phrase.id}
                  id={`phrase-select-${phrase.id}`}
                  onClick={() => setSelectedPhrase(phrase)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 flex flex-col gap-1 ${
                    isSelected 
                      ? 'bg-red-50/50 border-red-300 text-red-900 shadow-sm' 
                      : 'bg-stone-50/50 hover:bg-stone-50 border-stone-200/60 text-stone-600'
                  }`}
                >
                  <span className="font-sans font-bold text-base tracking-wide flex items-center gap-2">
                    {phrase.japanese}
                  </span>
                  <span className="text-xs font-mono text-stone-400">
                    {phrase.romaji}
                  </span>
                  <span className="text-xs font-medium text-stone-500 line-clamp-1">
                    {phrase.spanish}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Columna Principal: El Micrófono e Instructor de Voz */}
      <div className="lg:col-span-2 space-y-4">
        <motion.div 
          layout
          className="bg-white rounded-2xl p-6 border border-amber-950/10 shadow-sm flex flex-col justify-between"
          id="coaching-panel"
        >
          {/* Cabecera de la Frase Activa */}
          <div className="text-center pb-6 border-b border-stone-100">
            <span className="text-xs uppercase font-bold tracking-widest text-[#E05353] bg-red-50 px-3 py-1 rounded-full">
              Entrenamiento de Pronunciación
            </span>
            <h2 className="text-2xl font-sans font-bold text-[#2C302E] tracking-wide mt-4 mb-2">
              {selectedPhrase.japanese}
            </h2>
            <p className="text-sm font-mono text-stone-500 mb-1">
              "{selectedPhrase.romaji}"
            </p>
            <p className="text-sm text-stone-600 max-w-md mx-auto italic">
              — {selectedPhrase.spanish}
            </p>
            <div className="bg-amber-50 rounded-lg p-3 text-xs text-amber-900 border border-amber-100/60 mt-4 font-medium max-w-lg mx-auto">
              💡 {selectedPhrase.context}
            </div>
          </div>

          {/* Área de Control de Audio */}
          <div className="py-8 flex flex-col items-center justify-center space-y-6">
            <div className="flex gap-4">
              {/* Botón Escuchar Guía */}
              <button
                id="btn-hear-guide"
                onClick={() => onSpeak(selectedPhrase.japanese)}
                className={`flex items-center gap-2 px-5 py-3 rounded-full font-medium transition-all duration-200 ${
                  speakingId === selectedPhrase.japanese
                    ? 'bg-red-100 text-red-600 ring-2 ring-red-400'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-250 hover:text-stone-900'
                }`}
              >
                <Volume2 className="w-5 h-5" />
                <span>Escuchar Guía</span>
              </button>
            </div>

            {/* Micrófono Flotante */}
            <div className="relative flex flex-col items-center justify-center">
              <AnimatePresence>
                {isRecording && (
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1.15, opacity: 0.25 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                    className="absolute w-24 h-24 rounded-full bg-red-500 -z-10"
                  />
                )}
              </AnimatePresence>

              <button
                id="microphone-practice-btn"
                onClick={isRecording ? stopSpeechRecognition : startSpeechRecognition}
                disabled={isEvaluating}
                className={`w-16 h-16 rounded-full flex items-center justify-center text-white transition-all duration-300 shadow-md ${
                  isRecording 
                    ? 'bg-red-500 hover:bg-red-600 scale-105 shadow-red-200' 
                    : isEvaluating
                    ? 'bg-stone-300 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-105 shadow-indigo-100'
                }`}
              >
                {isRecording ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
              </button>

              <span className="text-xs font-semibold text-stone-400 mt-3 uppercase tracking-wider text-center">
                {isRecording ? "Grabando... Habla ahora" : isEvaluating ? "Evaluando con IA..." : "Toca el Micrófono para Hablar"}
              </span>
            </div>

            {/* Ondas tipo Soundwave de visualización para grabación */}
            {isRecording && (
              <div className="flex items-center justify-center gap-1 h-6">
                <span className="w-1 bg-red-500 rounded-full h-2 wave-bar" />
                <span className="w-1 bg-red-500 rounded-full h-4 wave-bar" />
                <span className="w-1 bg-red-500 rounded-full h-5 wave-bar" />
                <span className="w-1 bg-red-500 rounded-full h-4 wave-bar" />
                <span className="w-1 bg-red-500 rounded-full h-2 wave-bar" />
              </div>
            )}
          </div>

          {/* Casilla de Errores e Info Técnica opcional */}
          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-800 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p>{errorMsg}</p>
                {!SpeechRecognition && (
                  <form onSubmit={handleManualSubmit} className="mt-2.5 flex gap-2">
                    <input
                      type="text"
                      name="typedText"
                      required
                      placeholder="Escribe lo que dirías en japonés..."
                      className="flex-1 bg-white border border-stone-200 text-stone-900 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
                    />
                    <button type="submit" className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-indigo-700">
                      Evaluar
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* Panel de Análisis del Coach de IA */}
          <AnimatePresence>
            {isEvaluating && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-6 bg-stone-50 rounded-xl border border-stone-200 flex flex-col items-center justify-center text-center space-y-3"
              >
                <RefreshCw className="w-7 h-7 text-indigo-500 animate-spin" />
                <p className="text-sm font-semibold text-stone-700">Analizando tu pronunciación...</p>
                <p className="text-xs text-stone-400">Nuestro tutor inteligente está comparando los fonemas y tonos de tu grabación.</p>
              </motion.div>
            )}

            {evaluation && !isEvaluating && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-6 rounded-2xl border transition-all ${
                  evaluation.matched
                    ? 'bg-emerald-50/50 border-emerald-200'
                    : 'bg-amber-50/50 border-amber-200'
                }`}
                id="evaluation-result-panel"
              >
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div className="flex gap-4">
                    {/* Score circular o badge */}
                    <div className={`w-14 h-14 rounded-full flex flex-col items-center justify-center font-bold text-lg select-none ${
                      evaluation.matched 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      <span className="text-sm">Score</span>
                      <span className="leading-none mt-0.5">{evaluation.accuracyScore}</span>
                    </div>

                    <div>
                      <h4 className="font-semibold text-stone-800 flex items-center gap-1.5 text-base">
                        {evaluation.matched ? "¡Excelente intento! 🎉" : "Práctica un poco más 💪"}
                      </h4>
                      <p className="text-xs text-stone-500 font-medium">
                        Voz capturada: <span className="font-sans italic font-bold">"{evaluation.detectedWords}"</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const starValue = star * 20;
                      const filled = evaluation.accuracyScore >= starValue - 10;
                      return (
                        <Star 
                          key={star} 
                          className={`w-4 h-4 ${filled ? 'text-amber-500 fill-amber-400' : 'text-stone-200'}`} 
                        />
                      );
                    })}
                  </div>
                </div>

                <p className="text-sm text-stone-700 leading-relaxed mt-4 pt-4 border-t border-stone-200/50">
                  {evaluation.feedback}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
