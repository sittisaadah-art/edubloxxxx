import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ThreeWorld } from './utils/threeWorld';
import { BuildingData, Player, PlacedOrnament, RecapItem, Question } from './types/game';
import { INITIAL_BUILDINGS } from './data/initialData';
import { soundManager } from './utils/audio';
import { HUDHeader } from './components/HUDHeader';
import { PlayerDocks } from './components/PlayerDocks';
import { MainMenuModal } from './components/MainMenuModal';
import { QuizModal } from './components/QuizModal';
import { CanteenModal } from './components/CanteenModal';
import { BuilderModal } from './components/BuilderModal';
import { TeacherModal } from './components/TeacherModal';
import { RecapModal } from './components/RecapModal';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const worldRef = useRef<ThreeWorld | null>(null);

  // App & Game State
  const [schoolName, setSchoolName] = useState<string>('Informatika Kelas VIII');
  const [arenaTitle, setArenaTitle] = useState<string>('Kota Algoritma Edublox');
  const [buildings, setBuildings] = useState<Record<string, BuildingData>>(INITIAL_BUILDINGS);
  const [players, setPlayers] = useState<Player[]>([
    {
      id: 0,
      name: 'Pemain 1',
      color: 0xef4444,
      colorHex: '#ef4444',
      avatar: 'raja',
      score: 0,
      coins: 50,
      pos: { x: 0, z: 12 },
      rot: 0,
      auto: false,
    },
  ]);
  const [placedOrnaments, setPlacedOrnaments] = useState<PlacedOrnament[]>([]);
  const [recapData, setRecapData] = useState<RecapItem[]>([]);
  const [selectedGroundCoord, setSelectedGroundCoord] = useState<{ x: number; z: number } | null>(null);

  // View & Camera State
  const [isSplitScreen, setIsSplitScreen] = useState(false);
  const [isAutoOrbit, setIsAutoOrbit] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [cameraFocusMode, setCameraFocusMode] = useState<'ALL' | number>('ALL');
  const [projectedTags, setProjectedTags] = useState<
    Array<{ id: number; name: string; color: string; x: number; y: number; visible: boolean; emoji: string }>
  >([]);

  // Modals Visibility
  const [isMainMenuOpen, setIsMainMenuOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [quizBuildingCode, setQuizBuildingCode] = useState<string>('A');
  const [isCanteenOpen, setIsCanteenOpen] = useState(false);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [isTeacherOpen, setIsTeacherOpen] = useState(false);
  const [isRecapOpen, setIsRecapOpen] = useState(false);

  // Initialize Three.js Engine
  useEffect(() => {
    if (!canvasRef.current) return;

    const world = new ThreeWorld(canvasRef.current, {
      onBuildingEnter: (buildingCode) => {
        setQuizBuildingCode(buildingCode);
        setIsQuizOpen(true);
      },
      onGroundClick: (coords) => {
        setSelectedGroundCoord(coords);
      },
      onProjectedPositions: (tags) => {
        setProjectedTags(tags);
      },
    });

    worldRef.current = world;
    world.updateBuildings(buildings);
    world.updatePlayers(players);
    world.updateOrnaments(placedOrnaments);

    return () => {
      world.dispose();
      worldRef.current = null;
    };
  }, []);

  // Sync buildings to ThreeWorld
  useEffect(() => {
    if (worldRef.current) {
      worldRef.current.updateBuildings(buildings);
    }
  }, [buildings]);

  // Sync players to ThreeWorld
  useEffect(() => {
    if (worldRef.current) {
      worldRef.current.updatePlayers(players);
    }
  }, [players]);

  // Sync ornaments to ThreeWorld
  useEffect(() => {
    if (worldRef.current) {
      worldRef.current.updateOrnaments(placedOrnaments);
    }
  }, [placedOrnaments]);

  // Keyboard Movement Event Listeners
  useEffect(() => {
    const keysDown: Record<string, boolean> = {};

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept inputs inside text fields
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      keysDown[e.key] = true;

      if (e.key === ' ' || e.key.startsWith('Arrow')) {
        e.preventDefault();
      }

      // Quick Camera Rotate
      if (e.key === 'q' || e.key === 'Q') {
        worldRef.current?.rotateCamera(-0.1);
      }
      if (e.key === 'e' || e.key === 'E') {
        worldRef.current?.rotateCamera(0.1);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysDown[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Continuous keyboard loop
    const keyInterval = setInterval(() => {
      if (!worldRef.current) return;

      const speed = 1.2;

      // P1: WASD + Space
      if (players[0]) {
        let dx = 0;
        let dz = 0;
        if (keysDown['w'] || keysDown['W']) dz -= speed;
        if (keysDown['s'] || keysDown['S']) dz += speed;
        if (keysDown['a'] || keysDown['A']) dx -= speed;
        if (keysDown['d'] || keysDown['D']) dx += speed;
        if (dx !== 0 || dz !== 0) {
          worldRef.current.movePlayer(0, dx, dz);
        }
      }

      // P2: Arrow keys
      if (players[1]) {
        let dx = 0;
        let dz = 0;
        if (keysDown['ArrowUp']) dz -= speed;
        if (keysDown['ArrowDown']) dz += speed;
        if (keysDown['ArrowLeft']) dx -= speed;
        if (keysDown['ArrowRight']) dx += speed;
        if (dx !== 0 || dz !== 0) {
          worldRef.current.movePlayer(1, dx, dz);
        }
      }

      // P3: IJKL
      if (players[2]) {
        let dx = 0;
        let dz = 0;
        if (keysDown['i'] || keysDown['I']) dz -= speed;
        if (keysDown['k'] || keysDown['K']) dz += speed;
        if (keysDown['j'] || keysDown['J']) dx -= speed;
        if (keysDown['l'] || keysDown['L']) dx += speed;
        if (dx !== 0 || dz !== 0) {
          worldRef.current.movePlayer(2, dx, dz);
        }
      }

      // P4: TFGH
      if (players[3]) {
        let dx = 0;
        let dz = 0;
        if (keysDown['t'] || keysDown['T']) dz -= speed;
        if (keysDown['g'] || keysDown['G']) dz += speed;
        if (keysDown['f'] || keysDown['F']) dx -= speed;
        if (keysDown['h'] || keysDown['H']) dx += speed;
        if (dx !== 0 || dz !== 0) {
          worldRef.current.movePlayer(3, dx, dz);
        }
      }
    }, 25);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      clearInterval(keyInterval);
    };
  }, [players]);

  // Handlers
  const handleRotateCamera = (delta: number) => {
    worldRef.current?.rotateCamera(delta);
  };

  const handleZoomCamera = (delta: number) => {
    worldRef.current?.zoomCamera(delta);
  };

  const handleToggleAutoOrbit = () => {
    if (worldRef.current) {
      const active = worldRef.current.toggleAutoOrbit();
      setIsAutoOrbit(active);
    }
  };

  const handleToggleSplitScreen = () => {
    setIsSplitScreen((prev) => !prev);
    soundManager.play('click');
  };

  const handleToggleAudio = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  const handleSetCameraFocus = (mode: 'ALL' | number) => {
    setCameraFocusMode(mode);
    worldRef.current?.setCameraFocus(mode);
    soundManager.play('click');
  };

  const handleMovePlayer = (playerIdx: number, dx: number, dz: number) => {
    worldRef.current?.movePlayer(playerIdx, dx, dz);
  };

  const handleJumpPlayer = (playerIdx: number) => {
    soundManager.play('jump');
  };

  const handleTogglePlayerAuto = (playerIdx: number) => {
    setPlayers((prev) =>
      prev.map((p, i) => (i === playerIdx ? { ...p, auto: !p.auto } : p))
    );
    soundManager.play('click');
  };

  const handleUpdatePlayer = (index: number, updates: Partial<Player>) => {
    setPlayers((prev) =>
      prev.map((p, i) => (i === index ? { ...p, ...updates } : p))
    );
  };

  const handleAddPlayer = () => {
    if (players.length >= 4) return;
    const newIdx = players.length;
    const colors = [0xef4444, 0x3b82f6, 0x10b981, 0xf59e0b];
    const hexColors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b'];
    const avatars: Player['avatar'][] = ['neko', 'kapten', 'kesatria', 'penyihir'];

    setPlayers((prev) => [
      ...prev,
      {
        id: newIdx,
        name: `Pemain ${newIdx + 1}`,
        color: colors[newIdx] || 0x8b5cf6,
        colorHex: hexColors[newIdx] || '#8b5cf6',
        avatar: avatars[newIdx] || 'noob',
        score: 0,
        coins: 50,
        pos: { x: (Math.random() - 0.5) * 30, z: (Math.random() - 0.5) * 30 },
        rot: 0,
        auto: false,
      },
    ]);
    soundManager.play('correct');
  };

  const handleAwardCoinsAndScore = (playerIndex: number, coins: number, score: number) => {
    setPlayers((prev) =>
      prev.map((p, i) =>
        i === playerIndex
          ? { ...p, coins: p.coins + coins, score: p.score + score }
          : p
      )
    );
  };

  const handleDeductCoins = (playerIndex: number, amount: number) => {
    setPlayers((prev) =>
      prev.map((p, i) =>
        i === playerIndex ? { ...p, coins: Math.max(0, p.coins - amount) } : p
      )
    );
  };

  const handleAddRecapItem = (item: RecapItem) => {
    setRecapData((prev) => [item, ...prev]);

    // Google Apps Script webhook auto sync
    const webhook = localStorage.getItem('edublox_webhook_url');
    if (webhook) {
      fetch(webhook, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      }).catch((e) => console.log('Webhook background sync error:', e));
    }
  };

  const handleUpdateBuilding = (code: string, updates: Partial<BuildingData>) => {
    setBuildings((prev) => ({
      ...prev,
      [code]: { ...prev[code], ...updates },
    }));
  };

  const handleAddBuilding = () => {
    const letters = 'EFGHIJKLMNOPQRSTUVWXYZ';
    const nextCode =
      letters
        .split('')
        .find((l) => !buildings[l]) || `B${Object.keys(buildings).length + 1}`;

    const newBuilding: BuildingData = {
      code: nextCode,
      title: `Topik Informatika ${nextCode}`,
      icon: '💻',
      color: 0x06b6d4,
      colorHex: '#06b6d4',
      pos: {
        x: Math.round((Math.random() - 0.5) * 150),
        z: Math.round((Math.random() - 0.5) * 150),
      },
      questions: [
        {
          id: `${nextCode}_init`,
          submateri: 'Topik Tambahan',
          q: 'Bagaimanakah cara kerja algoritma pemecahan masalah dalam berpikir komputasional?',
          options: [
            'A. Membagi masalah kompleks menjadi sub-masalah yang lebih sederhana',
            'B. Menghapus data acak tanpa evaluasi',
            'C. Mengulang proses tanpa batas',
            'D. Mengabaikan pola masalah',
          ],
          key: 'A',
          explanation:
            'Dekomposisi adalah teknik memecah masalah besar menjadi masalah yang lebih kecil dan mudah dikelola.',
        },
      ],
    };

    setBuildings((prev) => ({
      ...prev,
      [nextCode]: newBuilding,
    }));
    soundManager.play('correct');
    alert(`🏢 Gedung ${nextCode} baru berhasil dibangun di kota 3D!`);
  };

  const handleSetBuildingQuestions = (
    code: string,
    questions: Question[],
    mode: 'replace' | 'append'
  ) => {
    setBuildings((prev) => {
      const b = prev[code];
      if (!b) return prev;
      return {
        ...prev,
        [code]: {
          ...b,
          questions: mode === 'replace' ? questions : [...b.questions, ...questions],
        },
      };
    });
  };

  const handlePlaceOrnament = (ornament: PlacedOrnament) => {
    setPlacedOrnaments((prev) => [...prev, ornament]);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-900 select-none">
      {/* Three.js Canvas Container */}
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* 2D Overhead HTML Name Tags Aligned in 3D Space */}
      <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
        {projectedTags.map(
          (t) =>
            t.visible && (
              <div
                key={t.id}
                className="overhead-tag flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold text-white shadow-lg border-2 border-white pointer-events-none"
                style={{
                  left: `${t.x}px`,
                  top: `${t.y}px`,
                  backgroundColor: t.color,
                }}
              >
                <span>{t.emoji}</span>
                <span>{t.name}</span>
              </div>
            )
        )}
      </div>

      {/* 4-Way Split Screen Grid Overlay (if toggled) */}
      {isSplitScreen && (
        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 pointer-events-none z-10">
          <div className="border border-white/30 relative">
            <span className="absolute top-2 left-2 bg-red-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow">
              P1 View
            </span>
          </div>
          <div className="border border-white/30 relative">
            <span className="absolute top-2 left-2 bg-blue-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow">
              P2 View
            </span>
          </div>
          <div className="border border-white/30 relative">
            <span className="absolute top-2 left-2 bg-emerald-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow">
              P3 View
            </span>
          </div>
          <div className="border border-white/30 relative">
            <span className="absolute top-2 left-2 bg-amber-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow">
              P4 View
            </span>
          </div>
        </div>
      )}

      {/* Top HUD Header */}
      <HUDHeader
        schoolName={schoolName}
        arenaTitle={arenaTitle}
        isSplitScreen={isSplitScreen}
        isAutoOrbit={isAutoOrbit}
        isMuted={isMuted}
        cameraFocusMode={cameraFocusMode}
        playerCount={players.length}
        onRotateCamera={handleRotateCamera}
        onZoomCamera={handleZoomCamera}
        onToggleAutoOrbit={handleToggleAutoOrbit}
        onToggleSplitScreen={handleToggleSplitScreen}
        onToggleAudio={handleToggleAudio}
        onSetCameraFocus={handleSetCameraFocus}
        onOpenQuiz={(code) => {
          if (code) setQuizBuildingCode(code);
          setIsQuizOpen(true);
        }}
        onOpenCanteen={() => setIsCanteenOpen(true)}
        onOpenBuilder={() => setIsBuilderOpen(true)}
        onOpenTeacher={() => setIsTeacherOpen(true)}
        onOpenRecap={() => setIsRecapOpen(true)}
        onOpenMainMenu={() => setIsMainMenuOpen(true)}
      />

      {/* Bottom Player Docks with Touch D-Pads and Keyboard Guide */}
      <PlayerDocks
        players={players}
        onMovePlayer={handleMovePlayer}
        onJumpPlayer={handleJumpPlayer}
        onToggleAuto={handleTogglePlayerAuto}
        onFocusPlayer={handleSetCameraFocus}
      />

      {/* MODALS */}
      <MainMenuModal
        isOpen={isMainMenuOpen}
        schoolName={schoolName}
        arenaTitle={arenaTitle}
        players={players}
        onUpdateSchoolName={setSchoolName}
        onUpdateArenaTitle={setArenaTitle}
        onUpdatePlayer={handleUpdatePlayer}
        onAddPlayer={handleAddPlayer}
        onClose={() => setIsMainMenuOpen(false)}
      />

      <QuizModal
        isOpen={isQuizOpen}
        buildingCode={quizBuildingCode}
        buildings={buildings}
        players={players}
        schoolName={schoolName}
        onClose={() => setIsQuizOpen(false)}
        onAwardCoinsAndScore={handleAwardCoinsAndScore}
        onAddRecapItem={handleAddRecapItem}
      />

      <CanteenModal
        isOpen={isCanteenOpen}
        players={players}
        onClose={() => setIsCanteenOpen(false)}
        onDeductCoins={handleDeductCoins}
      />

      <BuilderModal
        isOpen={isBuilderOpen}
        players={players}
        selectedCoord={selectedGroundCoord}
        onClose={() => setIsBuilderOpen(false)}
        onPlaceOrnament={handlePlaceOrnament}
      />

      <TeacherModal
        isOpen={isTeacherOpen}
        buildings={buildings}
        onClose={() => setIsTeacherOpen(false)}
        onUpdateBuilding={handleUpdateBuilding}
        onAddBuilding={handleAddBuilding}
        onSetBuildingQuestions={handleSetBuildingQuestions}
      />

      <RecapModal
        isOpen={isRecapOpen}
        recapData={recapData}
        playerCount={players.length}
        onClose={() => setIsRecapOpen(false)}
      />
    </div>
  );
}
