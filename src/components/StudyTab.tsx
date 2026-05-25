import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Volume2, CheckCircle, BookOpen, Key, HelpCircle } from 'lucide-react';
import { Lesson, VocabularyItem, DialogueLine } from '../types';

interface StudyTabProps {
  lesson: Lesson;
  onSpeak: (text: string) => void;
  speakingId: string | null;
}

export default function StudyTab({ lesson, onSpeak, speakingId }: StudyTabProps) {
  const [activeVocabIndex, setActiveVocabIndex] = useState<number | null>(null);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Columna Izquierda: Objetivos y Vocabulario */}
      <div className="lg:col-span-1 space-y-6">
        {/* Objetivos */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 border border-amber-950/10 shadow-sm"
          id="objectives-card"
        >
          <div className="flex items-center gap-3 mb-4 text-[#2C302E]">
            <BookOpen className="w-5 h-5 text-red-500" />
            <h3 className="font-display font-semibold text-lg text-[#2C302E]">Objetivos de la Lección</h3>
          </div>
          <ul className="space-y-3">
            {lesson.objectives.map((obj, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-stone-600 leading-relaxed">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>{obj}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Vocabulario Interactivo */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 border border-amber-950/10 shadow-sm flex-1"
          id="vocab-card"
        >
          <div className="flex items-center gap-3 mb-4 text-[#2C302E]">
            <Key className="w-5 h-5 text-red-500" />
            <div className="flex-1">
              <h3 className="font-display font-semibold text-lg text-[#2C302E]">Vocabulario Clave</h3>
              <p className="text-xs text-stone-400">Toca para voltear y escuchar pronunciación</p>
            </div>
          </div>

          <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
            {lesson.vocabulary.map((item, idx) => {
              const isSelected = activeVocabIndex === idx;
              return (
                <div
                  key={idx}
                  id={`vocab-item-${idx}`}
                  onClick={() => {
                    setActiveVocabIndex(isSelected ? null : idx);
                    onSpeak(item.japanese);
                  }}
                  className={`p-3.5 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col gap-1.5 ${
                    isSelected 
                      ? 'bg-amber-50/70 border-amber-300' 
                      : 'bg-stone-50/50 hover:bg-stone-50 border-stone-200/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-sans font-medium text-base text-stone-800 tracking-wide">
                      {item.japanese}
                    </span>
                    <button
                      id={`vocab-speak-${idx}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSpeak(item.japanese);
                      }}
                      className={`p-1.5 rounded-lg transition-colors ${
                        speakingId === item.japanese 
                          ? 'bg-red-100 text-red-600' 
                          : 'text-stone-400 hover:text-stone-600 hover:bg-stone-200/40'
                      }`}
                    >
                      <Volume2 className={`w-4 h-4 ${speakingId === item.japanese ? 'animate-pulse' : ''}`} />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs border-t border-dashed border-stone-200 pt-1.5 mt-0.5">
                    <span className="font-mono text-stone-500 bg-stone-200/50 px-1.5 py-0.5 rounded">
                      {item.romaji}
                    </span>
                    <span className="font-medium text-[#2C302E] italic">
                      {item.meaning}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Columna Derecha: Diálogo de Práctica */}
      <div className="lg:col-span-2 space-y-4">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-[#FAF6F0] rounded-2xl p-6 border border-amber-950/15 shadow-sm min-h-full"
          id="dialogue-card"
        >
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-200/80">
            <div>
              <h3 className="font-display font-semibold text-lg text-[#2C302E]">Diálogo Demostrativo</h3>
              <p className="text-xs text-stone-500">Escucha cómo fluye la conversación en japonés nativo</p>
            </div>
            <div className="text-xs px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full font-medium">
              Lectura Guiada
            </div>
          </div>

          <div className="space-y-4">
            {lesson.dialogue.map((line, idx) => {
              const isPartner = line.speaker === 'partner';
              return (
                <div
                  key={line.id}
                  id={`dialogue-line-${line.id}`}
                  className={`flex gap-4 p-4 rounded-xl transition-all duration-200 ${
                    isPartner 
                      ? 'bg-white border border-stone-200/60' 
                      : 'bg-amber-100/45 border border-amber-200/50'
                  }`}
                >
                  {/* Avatar / Inicial */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-display font-bold text-sm select-none ${
                    isPartner 
                      ? 'bg-red-50 text-red-600 border border-red-200' 
                      : 'bg-indigo-50 text-indigo-600 border border-indigo-200'
                  }`}>
                    {isPartner ? 'JP' : 'TÚ'}
                  </div>

                  {/* Cuerpo del Diálogo */}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                        {isPartner ? lesson.partnerCharacter : 'TÚ (あなた)'}
                      </span>
                      <button
                        id={`dialogue-speak-${line.id}`}
                        onClick={() => onSpeak(line.japanese)}
                        className={`p-1.5 rounded-lg flex items-center gap-1.5 text-xs transition-colors ${
                          speakingId === line.japanese 
                            ? 'bg-red-100 text-red-600' 
                            : 'text-stone-400 hover:text-stone-600 hover:bg-stone-200/40'
                        }`}
                      >
                        <Volume2 className="w-4 h-4" />
                        <span>Escuchar</span>
                      </button>
                    </div>

                    <p className="text-stone-800 font-sans font-medium text-base leading-relaxed tracking-wide">
                      {line.japanese}
                    </p>
                    
                    <p className="text-xs font-mono text-stone-500">
                      {line.romaji}
                    </p>
                    
                    <p className="text-sm text-stone-600 pt-1 border-t border-emerald-900/5 mt-2">
                      {line.spanish}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
