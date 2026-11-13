import React, { useState } from 'react';
import { BuildingData, Question } from '../types/game';
import { soundManager } from '../utils/audio';
import {
  X,
  GraduationCap,
  Wand2,
  Building,
  Plus,
  Loader2,
  Check,
  Palette,
  Sparkles,
} from 'lucide-react';

interface TeacherModalProps {
  isOpen: boolean;
  buildings: Record<string, BuildingData>;
  onClose: () => void;
  onUpdateBuilding: (code: string, updates: Partial<BuildingData>) => void;
  onAddBuilding: () => void;
  onSetBuildingQuestions: (code: string, questions: Question[], mode: 'replace' | 'append') => void;
}

export const TeacherModal: React.FC<TeacherModalProps> = ({
  isOpen,
  buildings,
  onClose,
  onUpdateBuilding,
  onAddBuilding,
  onSetBuildingQuestions,
}) => {
  const [aiPrompt, setAiPrompt] = useState(
    'Buat soal pilihan ganda Informatika kelas VIII tentang penelusuran (tracing) algoritma dan sistem bilangan biner'
  );
  const [aiTargetBuilding, setAiTargetBuilding] = useState('A');
  const [aiMode, setAiMode] = useState<'replace' | 'append'>('replace');
  const [isGenerating, setIsGenerating] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    setFeedbackMsg(null);

    try {
      const res = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: aiPrompt,
          targetBuilding: buildings[aiTargetBuilding]?.title || aiTargetBuilding,
          count: 3,
        }),
      });

      const data = await res.json();

      let newQuestions: Question[] = [];

      if (data.success && Array.isArray(data.questions) && data.questions.length > 0) {
        newQuestions = data.questions.map((q: any, idx: number) => ({
          id: `ai_${Date.now()}_${idx}`,
          submateri: q.submateri || 'Materi AI Generator',
          q: q.q,
          options: q.options,
          key: q.key,
          explanation: q.explanation || 'Pembahasan materi terkait.',
        }));
      } else {
        // Fallback generator
        newQuestions = [
          {
            id: `fb_${Date.now()}_1`,
            submateri: 'Berpikir Komputasional & Algoritma',
            q: 'Dalam struktur data Stack (Tumpukan), manakah prinsip pengeluaran elemen yang benar?',
            options: [
              'A. FIFO (First In, First Out)',
              'B. LIFO (Last In, First Out)',
              'C. Random Access',
              'D. Binary Traversal',
            ],
            key: 'B',
            explanation:
              'Stack bekerja berdasarkan prinsip LIFO (Last In, First Out), di mana item yang terakhir masuk akan menjadi item pertama yang keluar.',
          },
          {
            id: `fb_${Date.now()}_2`,
            submateri: 'Sistem Bilangan Biner',
            q: 'Berapakah nilai desimal dari bilangan biner 1010₂?',
            options: ['A. 8', 'B. 10', 'C. 12', 'D. 14'],
            key: 'B',
            explanation:
              '(1 × 2³) + (0 × 2²) + (1 × 2¹) + (0 × 2⁰) = 8 + 0 + 2 + 0 = 10₁₀.',
          },
          {
            id: `fb_${Date.now()}_3`,
            submateri: 'Konsep Pemetaan Fungsi',
            q: 'Relasi yang memasangkan setiap elemen di himpunan asal (domain) tepat ke satu elemen di himpunan kawan disebut ...',
            options: ['A. Algoritma', 'B. Fungsi', 'C. Variable', 'D. Array'],
            key: 'B',
            explanation:
              'Fungsi adalah relasi khusus yang memetakan setiap anggota himpunan domain tepat satu ke anggota himpunan kodomain.',
          },
        ];
      }

      onSetBuildingQuestions(aiTargetBuilding, newQuestions, aiMode);
      soundManager.play('correct');
      setFeedbackMsg({
        type: 'success',
        text: `Berhasil membuat ${newQuestions.length} butir soal untuk Gedung ${aiTargetBuilding}!`,
      });
    } catch (err: any) {
      console.warn('API error, using fallback questions:', err);
      const fallbackQuestions: Question[] = [
        {
          id: `fb_err_${Date.now()}_1`,
          submateri: 'Berpikir Komputasional',
          q: 'Operasi untuk menyisipkan data baru ke atas tumpukan (stack) dinamakan ...',
          options: ['A. POP', 'B. PUSH', 'C. TOP', 'D. PEEK'],
          key: 'B',
          explanation: 'Operasi PUSH memasukkan elemen baru ke puncak stack.',
        },
      ];
      onSetBuildingQuestions(aiTargetBuilding, fallbackQuestions, aiMode);
      setFeedbackMsg({
        type: 'success',
        text: `Soal alternatif kurikulum merdeka berhasil dimuat ke Gedung ${aiTargetBuilding}!`,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border-4 border-blue-400 p-5 sm:p-6 flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center text-xl font-bold shadow-inner">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading text-lg sm:text-xl font-bold text-slate-800">
                Panel Guru: Custom Gedung & AI Generator Soal
              </h3>
              <p className="text-xs text-slate-500 font-semibold">
                Kelola materi, ubah warna dinding 3D gedung, dan buat soal otomatis berstandar Kurikulum Merdeka!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* AI Soal Generator Banner Box (Gemini 3.8 Flash) */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white p-4 sm:p-5 rounded-3xl shadow-lg border-2 border-blue-400 flex flex-col gap-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="font-heading text-base font-bold text-amber-300 flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-amber-400" />
              AI Generator Soal Otomatis (Gemini 3.8 Flash)
            </span>
            <span className="text-[10px] font-bold bg-blue-800 text-blue-200 px-2 py-0.5 rounded-full border border-blue-600">
              Informatika Kelas VIII • Bab 2
            </span>
          </div>

          <p className="text-xs text-blue-100 leading-relaxed">
            Buat soal pilihan ganda Informatika secara otomatis sesuai Capaian Pembelajaran Kurikulum Merdeka
            (Fungsi, Himpunan Data, Sistem Bilangan, & Stack).
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="text-[11px] font-bold text-blue-300 block">
                Topik / Prompt Khusus Guru:
              </label>
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                className="w-full text-xs bg-slate-800/90 border border-blue-400/60 p-2.5 rounded-xl font-bold text-white mt-1 focus:ring-2 focus:ring-amber-400 focus:outline-none"
                placeholder="Ketik topik soal..."
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-blue-300 block">
                Gedung Sasaran:
              </label>
              <select
                value={aiTargetBuilding}
                onChange={(e) => setAiTargetBuilding(e.target.value)}
                className="w-full text-xs bg-slate-800/90 border border-blue-400/60 p-2.5 rounded-xl font-bold text-white mt-1 focus:ring-2 focus:ring-amber-400 focus:outline-none"
              >
                {Object.keys(buildings).map((code) => (
                  <option key={code} value={code}>
                    Gedung {code} - {buildings[code].title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-blue-800/80 flex-wrap gap-2">
            <div className="flex items-center gap-3 text-xs text-blue-200 font-semibold">
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="ai-mode"
                  value="replace"
                  checked={aiMode === 'replace'}
                  onChange={() => setAiMode('replace')}
                />
                <span>Ganti Soal Lama</span>
              </label>
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="ai-mode"
                  value="append"
                  checked={aiMode === 'append'}
                  onChange={() => setAiMode('append')}
                />
                <span>Tambahkan ke Soal</span>
              </label>
            </div>

            <button
              onClick={handleGenerateAI}
              disabled={isGenerating}
              className="btn-blox btn-blox-yellow text-slate-900 px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 hover:brightness-105"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-900" /> Sedang Menyusun Soal...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-slate-900" /> Buat Soal Dengan AI Sekarang
                </>
              )}
            </button>
          </div>

          {feedbackMsg && (
            <div
              className={`p-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
                feedbackMsg.type === 'success'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-red-500/20 text-red-300 border border-red-500/40'
              }`}
            >
              <Check className="w-4 h-4" /> {feedbackMsg.text}
            </div>
          )}
        </div>

        {/* Manage 3D Buildings & Signs */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-heading text-base font-bold text-slate-800 flex items-center gap-2">
              <Building className="w-4 h-4 text-blue-600" /> Kelola Gedung & Papan Nama 3D ({Object.keys(buildings).length} Gedung)
            </h4>
            <button
              onClick={onAddBuilding}
              className="btn-blox btn-blox-green text-xs px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> + Tambah Gedung Baru
            </button>
          </div>

          <div className="space-y-3">
            {Object.keys(buildings).map((code) => {
              const b = buildings[code];
              return (
                <div
                  key={code}
                  className="bg-slate-50 p-4 rounded-2xl border-2 flex flex-col gap-3 shadow-sm"
                  style={{ borderColor: b.colorHex }}
                >
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <span className="font-heading font-bold text-sm text-slate-800 flex items-center gap-1.5">
                      <span className="text-xl">{b.icon}</span> Gedung {b.code} - {b.title}
                    </span>
                    <div className="flex items-center gap-2 text-xs">
                      <Palette className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-bold text-slate-600">Warna Dinding 3D:</span>
                      <input
                        type="color"
                        value={b.colorHex}
                        onChange={(e) =>
                          onUpdateBuilding(code, {
                            colorHex: e.target.value,
                            color: parseInt(e.target.value.replace('#', '0x')),
                          })
                        }
                        className="w-7 h-7 rounded-md cursor-pointer border border-slate-300 p-0"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div className="sm:col-span-2">
                      <label className="text-[10px] font-bold text-slate-500 block">Judul Materi:</label>
                      <input
                        type="text"
                        value={b.title}
                        onChange={(e) => onUpdateBuilding(code, { title: e.target.value })}
                        className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 mt-0.5"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block">Ikon Emoji:</label>
                      <input
                        type="text"
                        value={b.icon}
                        onChange={(e) => onUpdateBuilding(code, { icon: e.target.value })}
                        className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 mt-0.5 text-center"
                      />
                    </div>
                  </div>

                  {/* Questions Preview Accordion */}
                  <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                    <p className="font-bold text-xs text-slate-700 flex justify-between items-center">
                      <span>Daftar Pertanyaan Kuis:</span>
                      <span className="text-blue-600 font-extrabold bg-blue-50 px-2 py-0.5 rounded-full text-[11px]">
                        {b.questions.length} Soal
                      </span>
                    </p>
                    <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                      {b.questions.map((q, qIdx) => (
                        <div
                          key={q.id || qIdx}
                          className="text-xs p-2 bg-slate-50 rounded-lg border border-slate-100 flex justify-between items-center gap-2"
                        >
                          <span className="font-semibold text-slate-700 truncate">
                            {qIdx + 1}. {q.q}
                          </span>
                          <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-[10px] flex-shrink-0">
                            Kunci: {q.key}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
