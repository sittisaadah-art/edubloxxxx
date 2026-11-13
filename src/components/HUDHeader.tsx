import React from 'react';
import { BuildingData } from '../types/game';
import {
  RotateCcw,
  RotateCw,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  LayoutGrid,
  Brain,
  Utensils,
  Hammer,
  GraduationCap,
  FileSpreadsheet,
  Volume2,
  VolumeX,
  Settings,
  Eye,
} from 'lucide-react';

interface HUDHeaderProps {
  schoolName: string;
  arenaTitle: string;
  isSplitScreen: boolean;
  isAutoOrbit: boolean;
  isMuted: boolean;
  cameraFocusMode: 'ALL' | number;
  playerCount: number;
  onRotateCamera: (delta: number) => void;
  onZoomCamera: (delta: number) => void;
  onToggleAutoOrbit: () => void;
  onToggleSplitScreen: () => void;
  onToggleAudio: () => void;
  onSetCameraFocus: (mode: 'ALL' | number) => void;
  onOpenQuiz: (buildingCode?: string) => void;
  onOpenCanteen: () => void;
  onOpenBuilder: () => void;
  onOpenTeacher: () => void;
  onOpenRecap: () => void;
  onOpenMainMenu: () => void;
}

export const HUDHeader: React.FC<HUDHeaderProps> = ({
  schoolName,
  arenaTitle,
  isSplitScreen,
  isAutoOrbit,
  isMuted,
  cameraFocusMode,
  playerCount,
  onRotateCamera,
  onZoomCamera,
  onToggleAutoOrbit,
  onToggleSplitScreen,
  onToggleAudio,
  onSetCameraFocus,
  onOpenQuiz,
  onOpenCanteen,
  onOpenBuilder,
  onOpenTeacher,
  onOpenRecap,
  onOpenMainMenu,
}) => {
  return (
    <div className="absolute top-2 left-2 right-2 flex flex-col gap-2 pointer-events-none z-30">
      {/* Top Main Bar */}
      <div className="flex justify-between items-start gap-2 flex-wrap">
        {/* Left Branding Badge */}
        <div className="bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-xl border-2 border-amber-400 flex items-center gap-3 pointer-events-auto">
          <div className="w-10 h-10 bg-gradient-to-tr from-amber-400 to-yellow-300 rounded-xl flex items-center justify-center text-white shadow-inner font-heading text-xl">
            🧊
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-heading text-base font-bold text-slate-800 leading-none">
                Edublox City
              </h1>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-md">
                By Sitty
              </span>
            </div>
            <p className="text-[11px] font-bold text-slate-500 mt-0.5">
              {schoolName} • {arenaTitle}
            </p>
          </div>
        </div>

        {/* Right Action & Control Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap pointer-events-auto">
          {/* Camera Controls Group */}
          <div className="bg-white/90 backdrop-blur-md p-1 rounded-2xl shadow-lg border border-slate-200 flex items-center gap-1 text-slate-700">
            <button
              onClick={() => onRotateCamera(-0.2)}
              className="w-8 h-8 rounded-xl hover:bg-slate-100 flex items-center justify-center font-bold btn-blox bg-slate-50 text-xs"
              title="Putar Kiri (Q)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onRotateCamera(0.2)}
              className="w-8 h-8 rounded-xl hover:bg-slate-100 flex items-center justify-center font-bold btn-blox bg-slate-50 text-xs"
              title="Putar Kanan (E)"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onToggleAutoOrbit}
              className={`px-2.5 h-8 rounded-xl flex items-center gap-1 font-bold btn-blox text-xs transition ${
                isAutoOrbit ? 'bg-amber-300 text-amber-900 border-amber-500' : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
              }`}
              title="360° Auto Orbit"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isAutoOrbit ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">360°</span>
            </button>
            <button
              onClick={() => onZoomCamera(-6)}
              className="w-8 h-8 rounded-xl hover:bg-slate-100 flex items-center justify-center font-bold btn-blox bg-slate-50 text-xs"
              title="Perbesar Kamera"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onZoomCamera(6)}
              className="w-8 h-8 rounded-xl hover:bg-slate-100 flex items-center justify-center font-bold btn-blox bg-slate-50 text-xs"
              title="Perkecil Kamera"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Action Navigation Buttons */}
          <button
            onClick={onToggleSplitScreen}
            className={`btn-blox px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 shadow-md text-white transition ${
              isSplitScreen ? 'bg-purple-600 border-b-2 border-purple-800 ring-2 ring-purple-300' : 'btn-blox-purple'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Layar Bagi 4:</span> {isSplitScreen ? 'ON' : 'OFF'}
          </button>

          <button
            onClick={() => onOpenQuiz()}
            className="btn-blox btn-blox-yellow text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 shadow-md animate-bounce"
          >
            <Brain className="w-3.5 h-3.5" />
            <span>Kuis Serentak!</span>
          </button>

          <button
            onClick={onOpenCanteen}
            className="btn-blox btn-blox-pink text-white px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 shadow-md"
          >
            <Utensils className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Kantin Jajan</span>
          </button>

          <button
            onClick={onOpenBuilder}
            className="btn-blox btn-blox-green text-white px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 shadow-md"
          >
            <Hammer className="w-3.5 h-3.5" />
            <span className="hidden md:inline">+ Ornamen</span>
          </button>

          <button
            onClick={onOpenTeacher}
            className="btn-blox btn-blox-blue text-white px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 shadow-md"
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Custom & AI Soal</span>
          </button>

          <button
            onClick={onOpenRecap}
            className="btn-blox bg-amber-500 hover:bg-amber-600 border-b-2 border-amber-700 text-white px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 shadow-md"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Rekap Nilai</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleAudio}
            className="w-8 h-8 rounded-xl bg-white/95 backdrop-blur-md shadow-md border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center justify-center font-bold text-xs"
            title={isMuted ? 'Nyalakan Audio' : 'Bisukan Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
          </button>

          {/* Main Menu Button */}
          <button
            onClick={onOpenMainMenu}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-white shadow-md flex items-center justify-center font-bold text-xs"
            title="Menu & Pengaturan Skuad"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Camera Focus Selector Bar */}
      <div className="flex items-center gap-1 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-xl border border-slate-200 shadow-md text-xs self-start pointer-events-auto">
        <span className="font-bold text-slate-600 flex items-center gap-1 text-[11px] mr-1">
          <Eye className="w-3 h-3 text-slate-500" /> Fokus:
        </span>
        <button
          onClick={() => onSetCameraFocus('ALL')}
          className={`px-2 py-0.5 rounded-lg font-bold text-[11px] transition ${
            cameraFocusMode === 'ALL'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Semua
        </button>
        {Array.from({ length: playerCount }).map((_, idx) => (
          <button
            key={idx}
            onClick={() => onSetCameraFocus(idx)}
            className={`px-2 py-0.5 rounded-lg font-bold text-[11px] transition ${
              cameraFocusMode === idx
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            P{idx + 1}
          </button>
        ))}
      </div>
    </div>
  );
};
