import React, { useState } from 'react';
import { Player } from '../types/game';
import { ChevronDown, ChevronUp, Keyboard, Coins, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Play, Eye } from 'lucide-react';

interface PlayerDocksProps {
  players: Player[];
  onMovePlayer: (playerIndex: number, dx: number, dz: number) => void;
  onJumpPlayer: (playerIndex: number) => void;
  onToggleAuto: (playerIndex: number) => void;
  onFocusPlayer: (playerIndex: number) => void;
}

export const PlayerDocks: React.FC<PlayerDocksProps> = ({
  players,
  onMovePlayer,
  onJumpPlayer,
  onToggleAuto,
  onFocusPlayer,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="absolute bottom-2 left-2 right-2 flex flex-col items-center pointer-events-none z-30 transition-all duration-300">
      {/* Collapse / Expand Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="pointer-events-auto bg-white/95 backdrop-blur-md px-3 py-1 rounded-t-xl border-t border-x border-slate-200 shadow-md text-xs font-bold text-slate-700 flex items-center gap-1 hover:bg-slate-100 transition mb-[-1px]"
      >
        {isCollapsed ? (
          <>
            <ChevronUp className="w-3.5 h-3.5 text-amber-500" /> Tampilkan Kontrol Pemain
          </>
        ) : (
          <>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> Sembunyikan Kontrol (Zen View)
          </>
        )}
      </button>

      {/* Dock Content */}
      {!isCollapsed && (
        <div className="w-full flex justify-between items-end gap-2 flex-wrap pointer-events-none">
          {/* Multi-Player Dock Cards */}
          <div className="flex items-center gap-2 pointer-events-auto flex-wrap max-w-full overflow-x-auto pb-1">
            {players.map((p, idx) => (
              <div
                key={p.id}
                className="bg-white/95 backdrop-blur-md p-2 rounded-2xl shadow-xl border-2 flex flex-col gap-1.5 text-xs min-w-[145px]"
                style={{ borderColor: p.colorHex }}
              >
                {/* Header: Player Name & Coins */}
                <div className="flex items-center justify-between gap-1 border-b border-slate-100 pb-1">
                  <span className="font-bold text-slate-800 flex items-center gap-1 truncate max-w-[85px]">
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0"
                      style={{ backgroundColor: p.colorHex }}
                    />
                    {p.name}
                  </span>
                  <span className="font-extrabold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md flex items-center gap-0.5 text-[11px]">
                    <Coins className="w-3 h-3 text-amber-500" />
                    {p.coins}
                  </span>
                </div>

                {/* Touch D-Pad */}
                <div className="grid grid-cols-3 gap-1 w-24 mx-auto text-center my-0.5">
                  <div />
                  <button
                    onPointerDown={() => onMovePlayer(idx, 0, -2)}
                    className="bg-slate-100 hover:bg-slate-200 active:bg-amber-200 p-1 rounded-lg font-bold flex items-center justify-center text-slate-700 shadow-sm"
                    title="Maju"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <div />

                  <button
                    onPointerDown={() => onMovePlayer(idx, -2, 0)}
                    className="bg-slate-100 hover:bg-slate-200 active:bg-amber-200 p-1 rounded-lg font-bold flex items-center justify-center text-slate-700 shadow-sm"
                    title="Kiri"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onJumpPlayer(idx)}
                    className="bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-white p-1 rounded-lg font-bold flex items-center justify-center shadow-sm text-xs"
                    title="Lompat"
                  >
                    🦘
                  </button>
                  <button
                    onPointerDown={() => onMovePlayer(idx, 2, 0)}
                    className="bg-slate-100 hover:bg-slate-200 active:bg-amber-200 p-1 rounded-lg font-bold flex items-center justify-center text-slate-700 shadow-sm"
                    title="Kanan"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <div />
                  <button
                    onPointerDown={() => onMovePlayer(idx, 0, 2)}
                    className="bg-slate-100 hover:bg-slate-200 active:bg-amber-200 p-1 rounded-lg font-bold flex items-center justify-center text-slate-700 shadow-sm"
                    title="Mundur"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <div />
                </div>

                {/* Quick actions: Auto-walk & Focus */}
                <div className="flex justify-between items-center text-[10px] pt-1 border-t border-slate-100">
                  <button
                    onClick={() => onToggleAuto(idx)}
                    className={`px-1.5 py-0.5 rounded font-bold transition flex items-center gap-0.5 ${
                      p.auto
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Play className="w-2.5 h-2.5" />
                    Auto: {p.auto ? 'ON' : 'OFF'}
                  </button>
                  <button
                    onClick={() => onFocusPlayer(idx)}
                    className="text-blue-600 font-bold hover:underline flex items-center gap-0.5"
                  >
                    <Eye className="w-2.5 h-2.5" /> Fokus
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Mini Keyboard Control Guide */}
          <div className="bg-slate-900/85 backdrop-blur-md text-white text-xs px-3 py-2 rounded-2xl pointer-events-auto border border-slate-700 max-w-xs shadow-xl hidden lg:block">
            <p className="font-bold text-amber-400 flex items-center gap-1.5">
              <Keyboard className="w-3.5 h-3.5" /> Kontrol Keyboard:
            </p>
            <p className="mt-0.5 text-slate-200 text-[11px] leading-tight">
              P1: <strong className="text-white">WASD + Space</strong> | P2: <strong className="text-white">Panah + Shift</strong>
            </p>
            <p className="text-slate-300 text-[11px] leading-tight">
              P3: <strong className="text-white">IJKL + O</strong> | P4: <strong className="text-white">TFGH + Y</strong>
            </p>
            <p className="text-[10px] text-amber-200/90 mt-1 italic">
              Dekati pintu Gedung A–D untuk memicu Kuis Serentak!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
