import React, { useState } from 'react';
import { Player, PlacedOrnament } from '../types/game';
import { ORNAMENT_CATALOG } from '../data/initialData';
import { soundManager } from '../utils/audio';
import confetti from 'canvas-confetti';
import { X, Hammer, MapPin, Quote, Sparkles } from 'lucide-react';

interface BuilderModalProps {
  isOpen: boolean;
  players: Player[];
  selectedCoord: { x: number; z: number } | null;
  onClose: () => void;
  onPlaceOrnament: (ornament: PlacedOrnament) => void;
}

export const BuilderModal: React.FC<BuilderModalProps> = ({
  isOpen,
  players,
  selectedCoord,
  onClose,
  onPlaceOrnament,
}) => {
  const [placementMode, setPlacementMode] = useState<'CLICK' | 'ZONE' | 'COORD'>('CLICK');
  const [selectedZone, setSelectedZone] = useState('UTARA');
  const [customX, setCustomX] = useState<number>(selectedCoord?.x ?? 0);
  const [customZ, setCustomZ] = useState<number>(selectedCoord?.z ?? 0);
  const [literacyQuote, setLiteracyQuote] = useState(
    'Berpikir Komputasional & Algoritma adalah kunci memecahkan masalah masa depan!'
  );

  if (!isOpen) return null;

  const handlePlace = (typeId: string) => {
    let x = 0;
    let z = 0;

    if (placementMode === 'ZONE') {
      if (selectedZone === 'UTARA') {
        x = 0;
        z = -30;
      } else if (selectedZone === 'SELATAN') {
        x = 0;
        z = 30;
      } else if (selectedZone === 'TIMUR') {
        x = 30;
        z = 0;
      } else if (selectedZone === 'BARAT') {
        x = -30;
        z = 0;
      } else if (selectedZone === 'KARAKTER') {
        x = players[0]?.pos.x ? players[0].pos.x + 5 : 5;
        z = players[0]?.pos.z ?? 5;
      }
    } else if (placementMode === 'COORD') {
      x = Number(customX) || 0;
      z = Number(customZ) || 0;
    } else {
      // CLICK mode
      x = selectedCoord?.x ?? (players[0]?.pos.x ? players[0].pos.x + 6 : 10);
      z = selectedCoord?.z ?? (players[0]?.pos.z ? players[0].pos.z + 6 : 10);
    }

    const newOrnament: PlacedOrnament = {
      id: `orn_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      typeId,
      x,
      z,
      quote: literacyQuote,
    };

    onPlaceOrnament(newOrnament);
    soundManager.play('correct');
    confetti({
      particleCount: 35,
      spread: 50,
      origin: { y: 0.6 },
    });
    alert(`🌳 Berhasil memasang ornamen di koordinat (${x}, ${z})!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border-4 border-emerald-400 p-5 sm:p-6 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center text-xl font-bold shadow-inner">
              <Hammer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading text-lg sm:text-xl font-bold text-slate-800">
                Builder Ornamen & Gazebo Literasi 3D
              </h3>
              <p className="text-xs text-slate-500 font-semibold">
                Hiasi Kota Edublox dengan Gazebo Literasi, mading pesan komputasi, dan taman kota!
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

        {/* Placement Mode Selector */}
        <div className="bg-emerald-50/80 p-3.5 rounded-2xl border border-emerald-200 flex flex-col gap-2.5">
          <label className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-emerald-600" /> Metode & Posisi Penempatan:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <label className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-emerald-300 cursor-pointer font-bold shadow-sm">
              <input
                type="radio"
                name="build-mode"
                value="CLICK"
                checked={placementMode === 'CLICK'}
                onChange={() => setPlacementMode('CLICK')}
                className="text-emerald-600 focus:ring-emerald-500"
              />
              <span>Klik Arena 3D</span>
            </label>
            <label className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-emerald-300 cursor-pointer font-bold shadow-sm">
              <input
                type="radio"
                name="build-mode"
                value="ZONE"
                checked={placementMode === 'ZONE'}
                onChange={() => setPlacementMode('ZONE')}
                className="text-emerald-600 focus:ring-emerald-500"
              />
              <span>Zona Taman Kota</span>
            </label>
            <label className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-emerald-300 cursor-pointer font-bold shadow-sm">
              <input
                type="radio"
                name="build-mode"
                value="COORD"
                checked={placementMode === 'COORD'}
                onChange={() => setPlacementMode('COORD')}
                className="text-emerald-600 focus:ring-emerald-500"
              />
              <span>Input Koordinat (X, Z)</span>
            </label>
          </div>

          {placementMode === 'CLICK' && (
            <p className="text-[11px] text-emerald-800 bg-emerald-100/60 p-2 rounded-xl">
              📍 Posisi klik ground saat ini:{' '}
              <strong>
                X: {selectedCoord?.x ?? 0}, Z: {selectedCoord?.z ?? 0}
              </strong>
              . (Anda juga dapat mengklik langsung di arena 3D kapan saja).
            </p>
          )}

          {placementMode === 'ZONE' && (
            <div className="mt-1">
              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="w-full text-xs font-bold p-2.5 bg-white border border-emerald-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                <option value="UTARA">Taman Utara Kota (Dekat Monumen Tengah)</option>
                <option value="SELATAN">Taman Selatan Kota</option>
                <option value="TIMUR">Taman Timur Kota</option>
                <option value="BARAT">Taman Barat Kota</option>
                <option value="KARAKTER">Tepat Di Samping Karakter Pemain 1</option>
              </select>
            </div>
          )}

          {placementMode === 'COORD' && (
            <div className="grid grid-cols-2 gap-2 mt-1">
              <div>
                <label className="text-[10px] font-bold text-slate-500 block">Koordinat X (-120 s/d 120):</label>
                <input
                  type="number"
                  value={customX}
                  onChange={(e) => setCustomX(Number(e.target.value))}
                  className="w-full text-xs font-bold p-2 bg-white border border-emerald-300 rounded-xl"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 block">Koordinat Z (-120 s/d 120):</label>
                <input
                  type="number"
                  value={customZ}
                  onChange={(e) => setCustomZ(Number(e.target.value))}
                  className="w-full text-xs font-bold p-2 bg-white border border-emerald-300 rounded-xl"
                  placeholder="0"
                />
              </div>
            </div>
          )}
        </div>

        {/* Literacy Quote Input */}
        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1">
            <Quote className="w-3.5 h-3.5 text-amber-500" /> Pesan Literasi & Kata Bijak Komputasi (Papan 3D):
          </label>
          <input
            type="text"
            value={literacyQuote}
            onChange={(e) => setLiteracyQuote(e.target.value)}
            className="w-full text-xs font-bold p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
            placeholder="Ketik quote literasi untuk ditampilkan di atas Gazebo / Mading..."
          />
        </div>

        {/* Ornaments Catalog Grid */}
        <div>
          <h4 className="text-xs font-bold text-slate-600 mb-2 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Katalog Ornamen 3D:
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {ORNAMENT_CATALOG.map((item) => (
              <div
                key={item.id}
                className="bg-emerald-50/60 hover:bg-emerald-50 p-3 rounded-2xl border border-emerald-200 flex flex-col items-center text-center gap-1 transition shadow-sm"
              >
                <span className="text-3xl my-0.5">{item.emoji}</span>
                <h5 className="font-bold text-xs text-slate-800 leading-tight">{item.name}</h5>
                <button
                  onClick={() => handlePlace(item.id)}
                  className="btn-blox btn-blox-green text-white text-[11px] px-2.5 py-1.5 rounded-xl font-bold mt-1.5 w-full"
                >
                  Pasang
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
