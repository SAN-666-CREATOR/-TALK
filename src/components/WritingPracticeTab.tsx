import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Check, AlertTriangle, Eye, HelpCircle, ArrowRight, Star, RefreshCw } from 'lucide-react';
import { Lesson, VocabularyItem } from '../types';

interface WritingPracticeTabProps {
  lesson: Lesson;
}

type QuizDifficultLevel = 'romaji' | 'kana' | 'kanji';

export default function WritingPracticeTab({ lesson }: WritingPracticeTabProps) {
  const [level, setLevel] = useState<QuizDifficultLevel>('romaji');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [history, setHistory] = useState<{ vocab: VocabularyItem; input: string; correct: boolean }[]>([]);

  // For the alternative "Complete Sentence" activity
  const [activeActivity, setActiveActivity] = useState<'spelling' | 'completion'>('spelling');
  const [completionAnswers, setCompletionAnswers] = useState<string[]>(Array(lesson.dialogue.filter(d => d.speaker === 'user').length).fill(''));
  const [completionChecked, setCompletionChecked] = useState(false);

  useEffect(() => {
    // Reset state when lesson changes
    setCurrentIndex(0);
    setUserInput('');
    setShowHint(false);
    setIsAnswered(false);
    setScore(0);
    setQuizFinished(false);
    setHistory([]);
    setCompletionAnswers(Array(lesson.dialogue.filter(d => d.speaker === 'user').length).fill(''));
    setCompletionChecked(false);
  }, [lesson, level, activeActivity]);

  const activeVocab = lesson.vocabulary[currentIndex];

  const getTargetRaw = (vocab: VocabularyItem) => {
    if (level === 'romaji') return vocab.romaji.toLowerCase().trim();
    
    // Extract hiragana/katakana by stripping kanji if any, or matching the raw parenthesis
    // E.g. "お弁当 (おべんとう)" -> "おべんとう"
    // E.g. "袋 (ふくろ)" -> "ふくろ"
    const kanaMatch = vocab.japanese.match(/\(([^)]+)\)/);
    if (kanaMatch) {
      return kanaMatch[1].trim();
    }
    return vocab.japanese.trim();
  };

  const getTargetDisplay = (vocab: VocabularyItem) => {
    if (level === 'romaji') return vocab.romaji;
    
    const kanaMatch = vocab.japanese.match(/\(([^)]+)\)/);
    if (kanaMatch) {
      return level === 'kana' ? kanaMatch[1] : vocab.japanese.split(' ')[0];
    }
    return vocab.japanese;
  };

  const checkAnswer = () => {
    if (!userInput.trim()) return;

    const target = getTargetRaw(activeVocab);
    const targetWithParenthesisFull = activeVocab.japanese.toLowerCase().trim();
    
    // Clean user input
    const cleanUser = userInput.trim().toLowerCase();
    
    // Check multiple matching combinations for user convenience
    let correct = false;
    
    if (level === 'romaji') {
      correct = cleanUser === target || cleanUser === activeVocab.romaji.toLowerCase().replace(/ō/g, 'ou').replace(/ō/g, 'o');
    } else if (level === 'kana') {
      correct = cleanUser === target || targetWithParenthesisFull.includes(cleanUser);
    } else {
      // Kanji mode: match the first part before parenthesis or whole thing
      const kanjiOnly = activeVocab.japanese.split(' ')[0].trim();
      correct = cleanUser === kanjiOnly || cleanUser === target || targetWithParenthesisFull.includes(cleanUser);
    }

    setIsCorrect(correct);
    setIsAnswered(true);
    if (correct) {
      setScore(prev => prev + 1);
    }
    setHistory(prev => [...prev, { vocab: activeVocab, input: userInput, correct }]);
  };

  const handleNext = () => {
    setUserInput('');
    setShowHint(false);
    setIsAnswered(false);
    
    if (currentIndex + 1 < lesson.vocabulary.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setQuizFinished(true);
    }
  };

  const restartQuiz = () => {
    setCurrentIndex(0);
    setUserInput('');
    setShowHint(false);
    setIsAnswered(false);
    setScore(0);
    setQuizFinished(false);
    setHistory([]);
  };

  // Convert key clicks to text helper
  const addCharacter = (char: string) => {
    setUserInput(prev => prev + char);
  };

  // Get some common Japanese characters based on active target to help them type
  const getHelperCharacters = () => {
    const target = getTargetRaw(activeVocab);
    // Break target into individual kana or letters, shuffle with some random Japanese characters
    const uniqueChars = Array.from(new Set(target.split(''))).filter(c => c !== ' ' && c !== ')' && c !== '(');
    const fillers = level === 'romaji' 
      ? ['a', 'i', 'u', 'e', 'o', 'n', 't', 'k', 's', 'r'] 
      : ['あ', 'い', 'う', 'え', 'お', 'は', 'を', 'く', 'す', 'て', 'の', 'か', 'だ', 'つ', 'い', 'ん', 'っ', 'ー'];
    
    const combined = Array.from(new Set([...uniqueChars, ...fillers])).slice(0, 14);
    // Shuffle
    return combined.sort(() => 0.5 - Math.random());
  };

  const completionQuestions = lesson.dialogue.filter(d => d.speaker === 'user');

  const checkCompletion = () => {
    setCompletionChecked(true);
  };

  return (
    <div className="space-y-6">
      {/* Selector de sub-actividades */}
      <div className="flex bg-stone-100 p-1 rounded-xl max-w-md mx-auto">
        <button
          id="btn-sub-spelling"
          onClick={() => setActiveActivity('spelling')}
          className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${
            activeActivity === 'spelling' 
              ? 'bg-white text-stone-900 shadow-sm' 
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          Deletreo de Vocabulario
        </button>
        <button
          id="btn-sub-completion"
          onClick={() => setActiveActivity('completion')}
          className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${
            activeActivity === 'completion' 
              ? 'bg-white text-stone-900 shadow-sm' 
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          Completa el Diálogo
        </button>
      </div>

      {activeActivity === 'spelling' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panel de Configuración y Progreso */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-2xl p-5 border border-stone-200/60 shadow-sm">
              <h3 className="font-display font-semibold text-[#2C302E] text-base mb-3">Ajustes de Escritura</h3>
              
              <div className="space-y-2 mb-6">
                <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider block">
                  Nivel de Escritura
                </label>
                {(['romaji', 'kana', 'kanji'] as QuizDifficultLevel[]).map((lvl) => (
                  <button
                    key={lvl}
                    id={`btn-level-${lvl}`}
                    onClick={() => setLevel(lvl)}
                    className={`w-full text-left p-3 rounded-xl border transition-all duration-200 flex flex-col ${
                      level === lvl
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-900'
                        : 'bg-stone-50/50 hover:bg-stone-50 border-stone-200/60 text-stone-600'
                    }`}
                  >
                    <span className="font-bold text-sm capitalize">
                      {lvl === 'romaji' ? 'Fácil (Práctica en Romaji)' : lvl === 'kana' ? 'Normal (Silabario Kana)' : 'Avanzado (Ideogramas Kanji)'}
                    </span>
                    <span className="text-xs text-stone-400 mt-0.5">
                      {lvl === 'romaji' && 'Escribe la pronunciación transcrita (ej. o-bento, fukuro)'}
                      {lvl === 'kana' && 'Escribe usando Hiragana/Katakana o sílabas puras'}
                      {lvl === 'kanji' && 'Usa los ideogramas nativos (Kanji) más complejos'}
                    </span>
                  </button>
                ))}
              </div>

              <div className="border-t border-stone-100 pt-4">
                <h4 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">Progreso</h4>
                <div className="flex items-center justify-between text-sm text-stone-650">
                  <span>Palabras:</span>
                  <span className="font-bold">{currentIndex + 1} de {lesson.vocabulary.length}</span>
                </div>
                <div className="w-full bg-stone-100 h-2 rounded-full mt-2 overflow-hidden">
                  <div 
                    className="bg-indigo-600 h-full rounded-full transition-all duration-300" 
                    style={{ width: `${((currentIndex + 1) / lesson.vocabulary.length) * 100}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-sm text-stone-650 mt-3 pt-3 border-t border-dotted border-stone-100">
                  <span>Aciertos:</span>
                  <span className="font-bold text-emerald-600">{score}</span>
                </div>
              </div>
            </div>

            <div className="bg-amber-50/60 border border-amber-900/10 rounded-2xl p-4 text-xs text-stone-600 leading-relaxed space-y-2">
              <span className="font-bold block text-amber-900">💡 Tip de Teclado Japonés (IME)</span>
              <p>Puedes instalar el teclado "Japonés con entrada de romaji" en tu dispositivo para escribir fácilmente hiragana pulsando letras como "f-u-k-u-r-o" convirtiéndose en "ふくろ".</p>
              <p>Si no cuentas con él, puedes seleccionar la opción de <strong>Romaji</strong>, o usar la botonera de ayuda de abajo.</p>
            </div>
          </div>

          {/* Panel del Quiz Activo */}
          <div className="lg:col-span-2">
            {!quizFinished ? (
              <motion.div 
                key={currentIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-2xl p-6 border border-stone-200/60 shadow-sm flex flex-col justify-between min-h-[460px]"
                id="spelling-game-panel"
              >
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <BookOpen className="w-5 h-5 text-indigo-500" />
                    <span className="text-xs uppercase font-bold tracking-wider text-indigo-600">
                      Ejercicio de Deletreo de Voces
                    </span>
                  </div>

                  <div className="py-6 text-center border-b border-stone-100 mb-6">
                    <span className="text-xs font-semibold text-stone-400 uppercase tracking-widest block mb-1">
                      Significado en Español
                    </span>
                    <h2 className="text-2xl font-display font-medium text-[#2C302E]">
                      {activeVocab.meaning}
                    </h2>
                    
                    {/* Visual hints */}
                    {showHint && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-3 inline-block bg-stone-100 rounded-lg px-4 py-2 text-stone-700 font-sans"
                      >
                        <span className="text-xs text-stone-400 block font-semibold mb-0.5">Pista de escritura:</span>
                        <span className="font-bold font-mono tracking-wide">{getTargetDisplay(activeVocab)}</span>
                      </motion.div>
                    )}
                  </div>

                  {/* Input form */}
                  <div className="space-y-4 max-w-md mx-auto">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                        Escribe la palabra en {level.toUpperCase()}:
                      </label>
                      <input
                        type="text"
                        id="spelling-user-input"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        disabled={isAnswered}
                        placeholder={
                          level === 'romaji' 
                            ? 'Ej. obentō / obento' 
                            : level === 'kana' 
                            ? 'Ej. おべんとう / ぷくろ' 
                            : 'Ej. お弁当 / 袋'
                        }
                        className={`w-full bg-stone-50 border rounded-xl py-3.5 px-4 font-sans text-lg tracking-wide text-center focus:outline-none focus:ring-2 transition-all ${
                          isAnswered
                            ? isCorrect
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                              : 'bg-red-50 border-red-300 text-red-800'
                            : 'border-stone-250 focus:ring-indigo-500 focus:bg-white'
                        }`}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !isAnswered) {
                            checkAnswer();
                          } else if (e.key === 'Enter' && isAnswered) {
                            handleNext();
                          }
                        }}
                      />
                    </div>

                    {/* Botonera de Ayuda Letras */}
                    {!isAnswered && (
                      <div className="space-y-2">
                        <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block text-center">
                          Letras de ayuda (toca para insertar)
                        </span>
                        <div className="flex flex-wrap items-center justify-center gap-1.5">
                          {getHelperCharacters().map((char, index) => (
                            <button
                              key={index}
                              id={`helper-char-${index}`}
                              onClick={() => addCharacter(char)}
                              className="px-2.5 py-1 text-xs bg-stone-100 hover:bg-stone-200 border border-stone-250 text-stone-700 rounded-lg font-mono font-bold transition-all active:scale-95"
                            >
                              {char}
                            </button>
                          ))}
                          <button
                            id="btn-clear-spelling"
                            onClick={() => setUserInput('')}
                            className="px-2.5 py-1 text-xs bg-red-50 hover:bg-red-100 border border-red-200/60 text-red-600 rounded-lg font-bold"
                          >
                            Borrar todo
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Zona de Resultados de Evaluación */}
                <div className="mt-8 border-t border-stone-100 pt-6">
                  <AnimatePresence mode="wait">
                    {isAnswered ? (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className={`p-4 rounded-xl border flex items-start gap-4 ${
                          isCorrect 
                            ? 'bg-emerald-50/50 border-emerald-250 text-emerald-800' 
                            : 'bg-amber-50/50 border-amber-250 text-amber-800'
                        }`}
                        id="spelling-feedback-box"
                      >
                        <div className={`p-2 rounded-full ${isCorrect ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                          {isCorrect ? <Check className="w-5 h-5 text-emerald-600" /> : <AlertTriangle className="w-5 h-5 text-amber-600" />}
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="font-bold text-base leading-none">
                            {isCorrect ? '¡Excelente! 正しい (Correcto)' : '¡Casi lo tienes! El término correcto es:'}
                          </p>
                          <div className="text-sm font-sans flex flex-col gap-0.5 mt-2">
                            <span className="font-bold text-stone-800">
                              En Japonés: {activeVocab.japanese}
                            </span>
                            <span className="font-mono text-xs text-stone-500">
                              Lectura/Romaji: {activeVocab.romaji}
                            </span>
                            <span className="text-xs text-stone-600">
                              Definición: {activeVocab.meaning}
                            </span>
                          </div>
                        </div>
                        <button
                          id="btn-next-spelling"
                          onClick={handleNext}
                          className="self-center bg-stone-900 hover:bg-stone-850 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center gap-1 shrink-0 shadow-sm"
                        >
                          <span>Siguiente</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </motion.div>
                    ) : (
                      <div className="flex items-center justify-between gap-4">
                        <button
                          id="btn-eye-spelling"
                          onClick={() => setShowHint(true)}
                          disabled={showHint}
                          className="flex items-center gap-1.5 text-stone-400 hover:text-stone-600 text-xs font-semibold px-3 py-2 border border-stone-200 rounded-lg disabled:opacity-50"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Mostrar Pista</span>
                        </button>

                        <button
                          id="btn-check-spelling"
                          onClick={checkAnswer}
                          disabled={!userInput.trim()}
                          className="bg-indigo-650 disabled:opacity-40 text-white py-2.5 px-5 rounded-xl text-sm font-bold shadow-md shadow-indigo-100 flex items-center gap-1.5"
                        >
                          <span>Validar Respuesta</span>
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl p-8 border border-amber-950/10 shadow-sm text-center space-y-6"
                id="spelling-completed-panel"
              >
                <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mx-auto">
                  <Star className="w-10 h-10 fill-amber-500 stroke-amber-600" />
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-2xl font-display font-bold text-[#2C302E]">
                    ¡Práctica de Deletreo Completada!
                  </h2>
                  <p className="text-stone-550 max-w-md mx-auto text-sm">
                    Has completado con éxito la sesión de escritura del vocabulario esencial para <strong>{lesson.title}</strong> en nivel <strong>{level.toUpperCase()}</strong>.
                  </p>
                </div>

                <div className="bg-stone-50 border border-stone-150 rounded-xl p-4 max-w-sm mx-auto flex items-center justify-around py-4">
                  <div>
                    <span className="text-xs text-stone-450 block uppercase tracking-wider font-semibold">Puntuación</span>
                    <span className="text-2xl font-bold text-indigo-700">{score} / {lesson.vocabulary.length}</span>
                  </div>
                  <div className="h-8 border-r border-stone-200" />
                  <div>
                    <span className="text-xs text-stone-450 block uppercase tracking-wider font-semibold">Porcentaje</span>
                    <span className="text-2xl font-bold text-emerald-600">
                      {Math.round((score / lesson.vocabulary.length) * 100)}%
                    </span>
                  </div>
                </div>

                <div className="flex gap-4 items-center justify-center">
                  <button
                    id="btn-restart-spelling"
                    onClick={restartQuiz}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold border border-stone-200 hover:bg-stone-50 text-stone-700 transition"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Recomenzar</span>
                  </button>
                  <button
                    id="btn-change-level-spelling"
                    onClick={() => {
                      setLevel(level === 'romaji' ? 'kana' : level === 'kana' ? 'kanji' : 'romaji');
                      restartQuiz();
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold transition"
                  >
                    Cambiar Dificultad
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      ) : (
        /* Dialogue completion sub-activity card */
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-2xl p-6 border border-stone-200/60 shadow-sm"
          id="completion-game-panel"
        >
          <div className="mb-6">
            <h3 className="font-display font-semibold text-lg text-[#2C302E]">Completa el Rol Escrito</h3>
            <p className="text-stone-500 text-sm">
              Escribe las respuestas correspondientes al diálogo del usuario. Puedes consultar la pestaña de "Estudiar" para revisar la estructura correcta.
            </p>
          </div>

          <div className="space-y-6 max-w-2xl mx-auto">
            {completionQuestions.map((q, qIdx) => {
              // find the dialogue position before it to give context
              const originalIndex = lesson.dialogue.findIndex(line => line.id === q.id);
              const partnerPrompt = originalIndex > 0 ? lesson.dialogue[originalIndex - 1] : null;
              
              const isUserCorrect = completionAnswers[qIdx].trim().toLowerCase() === q.japanese.toLowerCase().trim() ||
                                   completionAnswers[qIdx].trim().toLowerCase() === q.romaji.toLowerCase().trim();

              return (
                <div key={q.id} className="border border-stone-150 rounded-xl p-4 bg-stone-50/50 space-y-3" id={`completion-group-${q.id}`}>
                  {partnerPrompt && (
                    <div className="flex gap-3 text-xs bg-white border border-stone-100 rounded-lg p-2.5 text-stone-500">
                      <span className="font-bold text-red-500">{lesson.partnerCharacter}:</span>
                      <p className="italic font-sans text-stone-750">"{partnerPrompt.japanese}" ({partnerPrompt.spanish})</p>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider block">
                      Tu Turno en Español: "{q.spanish}"
                    </span>
                    <input
                      type="text"
                      id={`completion-input-${q.id}`}
                      placeholder="Deletrea tu turno aquí de forma interactiva (en Hiragana/Kanji o Romaji)"
                      value={completionAnswers[qIdx]}
                      disabled={completionChecked}
                      onChange={(e) => {
                        const nextAns = [...completionAnswers];
                        nextAns[qIdx] = e.target.value;
                        setCompletionAnswers(nextAns);
                      }}
                      className={`w-full bg-white border rounded-xl py-2.5 px-3.5 text-sm transition focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                        completionChecked
                          ? isUserCorrect 
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                            : 'bg-red-50 border-red-300 text-red-800'
                          : 'border-stone-250'
                      }`}
                    />
                    
                    {completionChecked && (
                      <div className="mt-2 text-xs space-y-1 border-t border-dotted border-stone-200 pt-2">
                        <p className={isUserCorrect ? 'text-emerald-700 font-semibold' : 'text-red-700 font-semibold'}>
                          {isUserCorrect ? '✓ ¡Coincidencia Exacta!' : '✗ Intento libre. Lo correcto sugerido era:'}
                        </p>
                        <p className="text-stone-800 font-sans tracking-wide">
                          <strong>Hiragana/Kanji:</strong> {q.japanese}
                        </p>
                        <p className="text-stone-500 font-mono">
                          <strong>Romaji:</strong> {q.romaji}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            <div className="flex justify-end pt-4 border-t border-stone-100">
              {completionChecked ? (
                <button
                  id="btn-retry-completion"
                  onClick={() => {
                    setCompletionAnswers(Array(completionQuestions.length).fill(''));
                    setCompletionChecked(false);
                  }}
                  className="bg-stone-900 hover:bg-stone-800 text-white text-sm font-bold py-2.5 px-6 rounded-xl shadow-sm transition-all"
                >
                  Intentar Nuevamente
                </button>
              ) : (
                <button
                  id="btn-check-completion"
                  onClick={checkCompletion}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold py-2.5 px-6 rounded-xl shadow-sm transition-all"
                >
                  Verificar Soluciones
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
