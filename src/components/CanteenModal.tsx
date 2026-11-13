import React from 'react';
import { Player } from '../types/game';
import { CANTEEN_ITEMS } from '../data/initialData';
import { soundManager } from '../utils/audio';
import confetti from 'canvas-confetti';
import { X, Store, Coins, Sparkles, Heart } from 'lucide-react';

interface CanteenModalProps {
  isOpen: boolean;
  players: Player[];
  onClose: () => void;
  onDeductCoins: (playerIndex: number, amount: number) => void;
}

export const CanteenModal: React.FC<CanteenModalProps> = ({
  isOpen,
  players,
  onClose,
  onDeductCoins,
}) => {
  if (!isOpen) return null;

  const activePlayer = players[0]; // Player 1 is primary payer or squad leader

  const handleBuy = (item: (typeof CANTEEN_ITEMS)[0]) => {
    if (activePlayer.coins < item.price) {
      soundManager.play('wrong');
      alert(`Koin ${activePlayer.name} tidak cukup (${activePlayer.coins} koin). Kerjakan kuis serentak di gedung untuk mengumpulkan koin!`);
      return;
    }

    onDeductCoins(0, item.price);
    soundManager.play('buy');
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.7 },
    });
    alert(`🎉 Yummy! ${activePlayer.name} berhasil membeli ${item.name}! Skuad mendapatkan bonus semangat +${item.xp} XP!`);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border-4 border-pink-400 p-6 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-pink-100 text-pink-600 rounded-xl flex items-center justify-center text-xl font-bold shadow-inner">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading text-lg sm:text-xl font-bold text-slate-800">
                Kantin Jajanan Edublox
              </h3>
              <p className="text-xs text-slate-500 font-semibold">
                Tukarkan koin kuis dengan camilan lezat untuk menambah kebahagiaan skuad!
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

        {/* Squad Balance Card */}
        <div className="bg-gradient-to-r from-pink-50 to-amber-50 p-3.5 rounded-2xl border border-pink-200 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: activePlayer.colorHex }} />
            <span className="text-xs font-bold text-slate-700">Saldo {activePlayer.name}:</span>
          </div>
          <span className="font-extrabold text-amber-600 bg-white px-3 py-1 rounded-xl shadow-sm border border-amber-200 flex items-center gap-1.5 text-sm">
            <Coins className="w-4 h-4 text-amber-500" />
            {activePlayer.coins} Koin
          </span>
        </div>

        {/* Snack Catalog Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {CANTEEN_ITEMS.map((item) => (
            <div
              key={item.id}
              className="bg-pink-50/70 hover:bg-pink-50 p-3.5 rounded-2xl border-2 border-pink-200 flex flex-col items-center text-center gap-1.5 transition shadow-sm hover:shadow"
            >
              <span className="text-4xl my-1">{item.emoji}</span>
              <h4 className="font-bold text-xs text-slate-800 leading-tight">{item.name}</h4>
              <p className="text-[10px] text-slate-500 leading-snug line-clamp-2">{item.description}</p>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-[11px] font-extrabold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-md flex items-center gap-0.5">
                  <Coins className="w-3 h-3 text-amber-500" />
                  {item.price}
                </span>
                <span className="text-[10px] font-bold text-pink-600 bg-pink-100 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                  <Sparkles className="w-2.5 h-2.5" />+{item.xp} XP
                </span>
              </div>
              <button
                onClick={() => handleBuy(item)}
                className="btn-blox btn-blox-pink text-white text-xs px-3 py-1.5 rounded-xl font-bold mt-2 w-full flex items-center justify-center gap-1"
              >
                <Heart className="w-3 h-3 fill-white" /> Beli Jajanan
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
