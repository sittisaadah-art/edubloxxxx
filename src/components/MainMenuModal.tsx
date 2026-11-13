import React from 'react';
import { Player } from '../types/game';
import { AVATAR_OPTIONS } from '../data/initialData';
import { School, Users, Plus, Play, Sparkles } from 'lucide-react';

interface MainMenuModalProps {
  isOpen: boolean;
  schoolName: string;
  arenaTitle: string;
  players: Player[];
  onUpdateSchoolName: (name: string) => void;
  onUpdateArenaTitle: (title: string) => void;
  onUpdatePlayer: (index: number, updates: Partial<Player>) => void;
  onAddPlayer: () => void;
  onClose: () => void;
}

export const MainMenuModal: React.FC<MainMenuModalProps> = ({
  isOpen,
  schoolName,
  arenaTitle,
  players,
  onUpdateSchoolName,
  onUpdateArenaTitle,
  onUpdatePlayer,
  onAddPlayer,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border-4 border-amber-400 p-6 flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="text-center border-b border-slate-100 pb-3">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-tr from-amber-400 to-yellow-300 rounded-2xl text-white text-3xl shadow-lg mb-2">
            🧊
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-slate-800">
            Edublox City{' '}
            <span className="text-xs font-normal text-amber-600 bg-amber-100 px-2.5 py-1 rounded-lg">
              By Sitty
            </span>
          </h2>
          <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">
            Game Edukasi 3D Informatika Kelas VIII (Petualangan Berpikir Komputasional)
          </p>
        </div>

        {/* Instansi & Kelas Settings */}
        <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200">
          <h3 className="font-heading text-base font-bold text-amber-900 flex items-center gap-2">
            <School className="w-4 h-4 text-amber-600" /> Pengaturan Kelas & Arena 3D
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
            <div>
              <label className="text-xs font-bold text-slate-600 block">
                Nama Kelas / Instansi:
              </label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => onUpdateSchoolName(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-white rounded-xl border border-amber-300 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Contoh: Informatika Kelas VIII"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 block">
                Judul Arena 3D Kota:
              </label>
              <input
                type="text"
                value={arenaTitle}
                onChange={(e) => onUpdateArenaTitle(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-white rounded-xl border border-amber-300 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Contoh: Kota Algoritma Edublox"
              />
            </div>
          </div>
        </div>

        {/* Multi-Player Squad Customization */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-heading text-base font-bold text-slate-800 flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-500" /> Skuad Pemain Co-op ({players.length}/4)
            </h3>
            {players.length < 4 && (
              <button
                onClick={onAddPlayer}
                className="btn-blox btn-blox-green text-xs px-3 py-1.5 rounded-xl font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah Pemain
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {players.map((p, idx) => (
              <div
                key={p.id}
                className="bg-slate-50 p-3.5 rounded-2xl border-2 flex flex-col gap-2.5 text-xs shadow-sm transition"
                style={{ borderColor: p.colorHex }}
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-700 flex items-center gap-1.5">
                    <span
                      className="w-3 h-3 rounded-full inline-block"
                      style={{ backgroundColor: p.colorHex }}
                    />
                    Pemain #{idx + 1}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-400 font-bold">Warna Baju:</span>
                    <input
                      type="color"
                      value={p.colorHex}
                      onChange={(e) =>
                        onUpdatePlayer(idx, {
                          colorHex: e.target.value,
                          color: parseInt(e.target.value.replace('#', '0x')),
                        })
                      }
                      className="w-6 h-6 rounded-md cursor-pointer border border-slate-300 p-0"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 block">Nama Karakter:</label>
                  <input
                    type="text"
                    value={p.name}
                    onChange={(e) => onUpdatePlayer(idx, { name: e.target.value })}
                    className="w-full mt-1 p-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 block">Pilihan Topi / Avatar:</label>
                  <select
                    value={p.avatar}
                    onChange={(e) =>
                      onUpdatePlayer(idx, {
                        avatar: e.target.value as Player['avatar'],
                      })
                    }
                    className="w-full mt-1 p-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-400 text-xs"
                  >
                    {AVATAR_OPTIONS.map((av) => (
                      <option key={av.id} value={av.id}>
                        {av.emoji} {av.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Start Game Button */}
        <div className="border-t border-slate-100 pt-3 flex justify-end">
          <button
            onClick={onClose}
            className="btn-blox btn-blox-yellow text-white text-sm sm:text-base px-8 py-3.5 rounded-2xl font-bold shadow-xl flex items-center justify-center gap-2 w-full hover:brightness-105"
          >
            <Play className="w-5 h-5 fill-white" />
            MASUK KE KOTA 3D EDUBLOX
          </button>
        </div>
      </div>
    </div>
  );
};
