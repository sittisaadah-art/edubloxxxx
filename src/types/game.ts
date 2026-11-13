export interface Question {
  id: string;
  submateri: string;
  q: string;
  options: string[];
  key: string;
  explanation: string;
}

export interface BuildingData {
  code: string;
  title: string;
  icon: string;
  color: number;
  colorHex: string;
  pos: { x: number; z: number };
  questions: Question[];
}

export interface Player {
  id: number;
  name: string;
  color: number;
  colorHex: string;
  avatar: 'raja' | 'neko' | 'kapten' | 'kesatria' | 'penyihir' | 'noob';
  score: number;
  coins: number;
  pos: { x: number; z: number };
  rot: number;
  auto: boolean;
}

export interface AvatarOption {
  id: Player['avatar'];
  name: string;
  emoji: string;
}

export interface RecapItem {
  time: string;
  school: string;
  player: string;
  building: string;
  materi: string;
  question: string;
  userAns: string;
  key: string;
  status: 'BENAR' | 'SALAH';
  points: number;
}

export interface CanteenItem {
  id: string;
  name: string;
  price: number;
  xp: number;
  emoji: string;
  description: string;
}

export interface OrnamentItem {
  id: string;
  name: string;
  emoji: string;
  category: 'literasi' | 'flora' | 'kota' | 'dekorasi';
}

export interface PlacedOrnament {
  id: string;
  typeId: string;
  x: number;
  z: number;
  quote?: string;
}
