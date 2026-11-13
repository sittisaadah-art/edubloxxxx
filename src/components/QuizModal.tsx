import React, { useState, useEffect } from 'react';
import { BuildingData, Player, Question, RecapItem } from '../types/game';
import { soundManager } from '../utils/audio';
import confetti from 'canvas-confetti';
import { X, CheckCircle, ArrowLeft, ArrowRight, Lightbulb, User, Coins, Award } from 'lucide-react';

interface QuizModalProps {
  isOpen: boolean;
  buildingCode: string;
  buildings: Record<string, BuildingData>;
  players: Player[];
  schoolName: string;
  onClose: () => void;
  onAwardCoinsAndScore: (playerIndex: number, coins: number, score: number) => void;
  onAddRecapItem: (item: RecapItem) => void;
}

interface PreparedQuestion extends Question {
  shuffledOptions: Array<{ key: string; text: string; isCorrect: boolean }>;
}

export const QuizModal: React.FC<QuizModalProps> = ({
  isOpen,
  buildingCode,
  buildings,
  players,
  schoolName,
  onClose,
  onAwardCoinsAndScore,
  onAddRecapItem,
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [playerChoices, setPlayerChoices] = useState<Record<number, string>>({});
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [shuffledQuestions, setShuffledQuestions] = useState<PreparedQuestion[]>([]);

  const building = buildings[buildingCode] || buildings['A'];

  // Prepare questions and shuffle options on building change or open
  useEffect(() => {
    if (!building || !building.questions.length) return;

    const prepared: PreparedQuestion[] = building.questions.map((q) => {
      // Parse original options
      const parsed = q.options.map((opt) => {
        const key = opt.charAt(0);
        const text = opt.substring(3).trim();
        return {
          key,
          text,
          isCorrect: key === q.key,
        };
      });

      // Shuffle options array
      const shuffled = [...parsed].sort(() => Math.random() - 0.5);
      const standardKeys = ['A', 'B', 'C', 'D'];
      const remapped = shuffled.map((item, idx) => ({
        key: standardKeys[idx] || item.key,
        text: item.text,
        isCorrect: item.isCorrect,
      }));

      // Find which remapped key is the correct one
      const newKey = remapped.find((i) => i.isCorrect)?.key || 'A';

      return {
        ...q,
        key: newKey,
        shuffledOptions: remapped,
      };
    });

    // Shuffle questions
    setShuffledQuestions([...prepared].sort(() => Math.random() - 0.5));
    setCurrentIdx(0);
    setPlayerChoices({});
    setIsAnswerChecked(false);
  }, [buildingCode, isOpen]);

  if (!isOpen || !building || !shuffledQuestions.length) return null;

  const currentQ = shuffledQuestions[currentIdx];

  const handleSelectChoice = (playerIdx: number, key: string) => {
    if (isAnswerChecked) return;
    soundManager.play('click');
    setPlayerChoices((prev) => ({
      ...prev,
      [playerIdx]: key,
    }));
  };

  const handleCheckAnswers = () => {
    if (isAnswerChecked) return;
    setIsAnswerChecked(true);

    let hadAnyCorrect = false;

    players.forEach((p, idx) => {
      const choice = playerChoices[idx];
      if (!choice) return;

      const isCorrect = choice === currentQ.key;
      if (isCorrect) {
        hadAnyCorrect = true;
        onAwardCoinsAndScore(idx, 10, 100);
      }

      onAddRecapItem({
        time: new Date().toLocaleTimeString('id-ID'),
        school: schoolName,
        player: p.name,
        building: `Gedung ${building.code}`,
        materi: building.title,
        question: currentQ.q,
        userAns: choice,
        key: currentQ.key,
        status: isCorrect ? 'BENAR' : 'SALAH',
        points: isCorrect ? 100 : 0,
      });
    });

    if (hadAnyCorrect) {
      soundManager.play('correct');
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
      });
    } else {
      soundManager.play('wrong');
    }
  };

  const handleNext = () => {
    if (currentIdx < shuffledQuestions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
      setPlayerChoices({});
      setIsAnswerChecked(false);
    } else {
      soundManager.play('fanfare');
      alert(`🎉 Selamat! Seluruh soal di Gedung ${building.code} (${building.title}) telah selesai dikerjakan!`);
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1);
      setPlayerChoices({});
      setIsAnswerChecked(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[95vh] overflow-y-auto shadow-2xl border-4 border-amber-400 p-5 sm:p-6 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 text-white rounded-2xl flex items-center justify-center text-2xl font-bold shadow-md"
              style={{ backgroundColor: building.colorHex }}
            >
              {building.icon}
            </div>
            <div>
              <h3 className="font-heading text-lg sm:text-xl font-bold text-slate-800">
                Gedung {building.code} - {building.title}
              </h3>
              <p className="text-xs text-slate-500 font-semibold">
                Kuis Serentak Informatika Kelas VIII • Soal {currentIdx + 1} dari {shuffledQuestions.length}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center text-xl font-bold transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Question Prompt Card */}
        <div className="bg-amber-50/80 p-4 sm:p-5 rounded-2xl border-2 border-amber-200">
          <span className="bg-amber-200/90 text-amber-900 text-[11px] font-bold px-2.5 py-0.5 rounded-md">
            {currentQ.submateri || 'Materi Inti'}
          </span>
          <p className="text-sm sm:text-base font-bold text-slate-800 mt-2 leading-relaxed">
            {currentQ.q}
          </p>
        </div>

        {/* Player Options Panel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {players.map((p, pIdx) => {
            const playerChoice = playerChoices[pIdx];
            return (
              <div
                key={p.id}
                className="bg-slate-50/80 p-3.5 rounded-2xl border-2 flex flex-col gap-2"
                style={{ borderColor: p.colorHex }}
              >
                <div className="flex justify-between items-center border-b border-slate-200/60 pb-1.5">
                  <span
                    className="font-bold text-xs flex items-center gap-1.5"
                    style={{ color: p.colorHex }}
                  >
                    <User className="w-3.5 h-3.5" /> P{pIdx + 1}: {p.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-500">
                      Pilihan: <strong className="text-slate-800">{playerChoice || '-'}</strong>
                    </span>
                    {isAnswerChecked && playerChoice && (
                      <span
                        className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                          playerChoice === currentQ.key
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {playerChoice === currentQ.key ? 'BENAR (+100)' : 'SALAH'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Option Buttons */}
                <div className="space-y-1.5 mt-1">
                  {currentQ.shuffledOptions.map((opt) => {
                    const isSelected = playerChoice === opt.key;
                    let btnStyle = 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200';

                    if (isAnswerChecked) {
                      if (opt.key === currentQ.key) {
                        btnStyle = 'bg-emerald-500 text-white font-bold border-emerald-600';
                      } else if (isSelected) {
                        btnStyle = 'bg-red-500 text-white font-bold border-red-600';
                      } else {
                        btnStyle = 'bg-slate-100 text-slate-400 opacity-70';
                      }
                    } else if (isSelected) {
                      btnStyle = 'bg-amber-400 text-slate-900 font-bold border-amber-600 shadow-sm';
                    }

                    return (
                      <button
                        key={opt.key}
                        onClick={() => handleSelectChoice(pIdx, opt.key)}
                        disabled={isAnswerChecked}
                        className={`w-full text-left text-xs p-2.5 rounded-xl border font-semibold transition ${btnStyle}`}
                      >
                        <strong>{opt.key}.</strong> {opt.text}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Explanation & Key Box (Shown after checking) */}
        {isAnswerChecked && (
          <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-300 text-xs sm:text-sm text-slate-700 animate-in fade-in">
            <p className="font-bold text-slate-800 flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-amber-500" /> Kunci & Pembahasan:
            </p>
            <p className="font-extrabold text-emerald-700 mt-1">
              Kunci Jawaban: Pilihan {currentQ.key}
            </p>
            <p className="text-slate-600 mt-1 italic leading-relaxed">
              {currentQ.explanation}
            </p>
          </div>
        )}

        {/* Bottom Action Footer */}
        <div className="flex justify-between items-center border-t border-slate-100 pt-3 flex-wrap gap-2">
          <button
            onClick={handlePrev}
            disabled={currentIdx === 0}
            className={`btn-blox px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1 ${
              currentIdx === 0 ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Soal Sebelumnya
          </button>

          <div className="flex items-center gap-2">
            {!isAnswerChecked ? (
              <button
                onClick={handleCheckAnswers}
                className="btn-blox btn-blox-blue text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <CheckCircle className="w-3.5 h-3.5" /> Periksa Jawaban Semua Pemain
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="btn-blox btn-blox-green text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                {currentIdx < shuffledQuestions.length - 1 ? (
                  <>
                    Soal Berikutnya <ArrowRight className="w-3.5 h-3.5" />
                  </>
                ) : (
                  <>
                    <Award className="w-3.5 h-3.5" /> Selesaikan Kuis
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
