import React, { useState } from 'react';
import { RecapItem } from '../types/game';
import { soundManager } from '../utils/audio';
import {
  X,
  FileSpreadsheet,
  Download,
  Copy,
  Link,
  Code,
  Check,
  TrendingUp,
  Target,
  Users,
  Award,
} from 'lucide-react';

interface RecapModalProps {
  isOpen: boolean;
  recapData: RecapItem[];
  playerCount: number;
  onClose: () => void;
}

export const RecapModal: React.FC<RecapModalProps> = ({
  isOpen,
  recapData,
  playerCount,
  onClose,
}) => {
  const [webhookUrl, setWebhookUrl] = useState(
    localStorage.getItem('edublox_webhook_url') || ''
  );
  const [showScriptModal, setShowScriptModal] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const total = recapData.length;
  const correct = recapData.filter((r) => r.status === 'BENAR').length;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

  const handleExportCSV = () => {
    if (recapData.length === 0) {
      alert('Belum ada data aktivitas murid untuk diekspor!');
      return;
    }

    soundManager.play('click');
    let csvContent =
      '\uFEFFWaktu,Kelas,Pemain,Gedung,Materi,Pertanyaan,JawabanMurid,Kunci,Status,Poin\n';
    recapData.forEach((r) => {
      csvContent += `"${r.time}","${r.school}","${r.player}","${r.building}","${r.materi}","${r.question.replace(
        /"/g,
        '""'
      )}","${r.userAns}","${r.key}","${r.status}","${r.points}"\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Rekap_Edublox_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyTSV = () => {
    if (recapData.length === 0) {
      alert('Belum ada data aktivitas murid untuk disalin!');
      return;
    }

    let tsv = 'Waktu\tKelas\tPemain\tGedung\tMateri\tStatus\tPoin\tJawaban\n';
    recapData.forEach((r) => {
      tsv += `${r.time}\t${r.school}\t${r.player}\t${r.building}\t${r.materi}\t${r.status}\t${r.points}\t${r.userAns} (Kunci: ${r.key})\n`;
    });

    navigator.clipboard.writeText(tsv).then(() => {
      soundManager.play('correct');
      setCopyFeedback('Data TSV disalin ke clipboard! Buka Google Sheets dan tekan Ctrl+V.');
      setTimeout(() => setCopyFeedback(null), 3500);
    });
  };

  const handleSaveWebhook = () => {
    localStorage.setItem('edublox_webhook_url', webhookUrl);
    soundManager.play('correct');
    alert('URL Webhook Google Apps Script disimpan!');
  };

  const appsScriptCode = `function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);
  sheet.appendRow([
    new Date(),
    data.school,
    data.player,
    data.building,
    data.materi,
    data.question,
    data.userAns,
    data.key,
    data.status,
    data.points
  ]);
  return ContentService.createTextOutput("Success");
}`;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border-4 border-amber-400 p-5 sm:p-6 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center text-xl font-bold shadow-inner">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-heading text-lg sm:text-xl font-bold text-slate-800">
                Rekap Nilai Murid & Ekspor Spreadsheet
              </h3>
              <p className="text-xs text-slate-500 font-semibold">
                Pantau kemajuan pemahaman konsep Informatika siswa secara real-time!
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

        {/* Stats Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-blue-50/80 p-3 rounded-2xl border border-blue-200 text-center shadow-sm">
            <span className="text-[10px] font-bold text-blue-600 uppercase flex items-center justify-center gap-1">
              <TrendingUp className="w-3 h-3" /> Total Aktivitas
            </span>
            <p className="font-heading text-2xl font-bold text-blue-900 mt-0.5">{total}</p>
          </div>
          <div className="bg-emerald-50/80 p-3 rounded-2xl border border-emerald-200 text-center shadow-sm">
            <span className="text-[10px] font-bold text-emerald-600 uppercase flex items-center justify-center gap-1">
              <Award className="w-3 h-3" /> Jawaban Benar
            </span>
            <p className="font-heading text-2xl font-bold text-emerald-900 mt-0.5">{correct}</p>
          </div>
          <div className="bg-amber-50/80 p-3 rounded-2xl border border-amber-200 text-center shadow-sm">
            <span className="text-[10px] font-bold text-amber-700 uppercase flex items-center justify-center gap-1">
              <Target className="w-3 h-3" /> Rata-Rata Akurasi
            </span>
            <p className="font-heading text-2xl font-bold text-amber-900 mt-0.5">{accuracy}%</p>
          </div>
          <div className="bg-purple-50/80 p-3 rounded-2xl border border-purple-200 text-center shadow-sm">
            <span className="text-[10px] font-bold text-purple-600 uppercase flex items-center justify-center gap-1">
              <Users className="w-3 h-3" /> Skuad Pemain
            </span>
            <p className="font-heading text-2xl font-bold text-purple-900 mt-0.5">{playerCount}</p>
          </div>
        </div>

        {/* Actions & Google Sheets Integration */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="btn-blox btn-blox-green text-xs px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" /> Download Excel / CSV
            </button>
            <button
              onClick={handleCopyTSV}
              className="btn-blox btn-blox-blue text-xs px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 shadow-sm"
            >
              <Copy className="w-3.5 h-3.5" /> Salin Tabel (TSV)
            </button>
          </div>

          {/* Webhook Input */}
          <div className="flex items-center gap-2 max-w-md w-full">
            <input
              type="text"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="URL Google Apps Script (doPost)"
              className="text-xs p-2 bg-white border border-slate-300 rounded-xl font-semibold flex-1 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
            <button
              onClick={handleSaveWebhook}
              className="btn-blox btn-blox-purple text-xs px-3 py-2 rounded-xl font-bold whitespace-nowrap shadow-sm"
            >
              Simpan
            </button>
            <button
              onClick={() => setShowScriptModal(true)}
              className="text-xs text-blue-600 hover:text-blue-800 font-bold underline whitespace-nowrap"
            >
              Kode Script
            </button>
          </div>
        </div>

        {copyFeedback && (
          <div className="bg-emerald-100 text-emerald-800 text-xs font-bold p-2.5 rounded-xl border border-emerald-300 flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600" /> {copyFeedback}
          </div>
        )}

        {/* Grades Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-2xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase border-b border-slate-200">
              <tr>
                <th className="p-2.5">Waktu</th>
                <th className="p-2.5">Pemain</th>
                <th className="p-2.5">Gedung & Materi</th>
                <th className="p-2.5">Status</th>
                <th className="p-2.5">Poin</th>
                <th className="p-2.5">Jawaban Murid</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {recapData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-400 italic">
                    Belum ada rekaman jawaban kuis. Dekati pintu gedung untuk memulai kuis bersama skuad!
                  </td>
                </tr>
              ) : (
                recapData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition">
                    <td className="p-2.5 font-bold text-slate-500">{row.time}</td>
                    <td className="p-2.5 font-bold text-slate-800">{row.player}</td>
                    <td className="p-2.5 text-slate-700">
                      {row.building} - {row.materi}
                    </td>
                    <td className="p-2.5 font-extrabold">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[11px] ${
                          row.status === 'BENAR'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="p-2.5 font-bold text-amber-600">+{row.points}</td>
                    <td className="p-2.5 text-slate-500 max-w-xs truncate">
                      Pilihan {row.userAns} (Kunci: {row.key})
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Script Modal Helper */}
        {showScriptModal && (
          <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white p-5 rounded-2xl max-w-lg w-full flex flex-col gap-3 shadow-2xl border-2 border-slate-300">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                  <Code className="w-4 h-4 text-blue-600" /> Kode Google Apps Script (doPost)
                </h4>
                <button
                  onClick={() => setShowScriptModal(false)}
                  className="text-slate-400 hover:text-slate-600 text-lg font-bold"
                >
                  &times;
                </button>
              </div>
              <p className="text-xs text-slate-500">
                Buka Google Sheets baru, klik <strong>Extensions &gt; Apps Script</strong>, tempel kode di bawah,
                lalu Deploy sebagai <strong>Web App (Access: Anyone)</strong>:
              </p>
              <pre className="p-3 bg-slate-900 text-emerald-400 text-[11px] rounded-xl overflow-x-auto font-mono">
                {appsScriptCode}
              </pre>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(appsScriptCode);
                  soundManager.play('correct');
                  alert('Kode script disalin ke clipboard!');
                }}
                className="btn-blox btn-blox-blue text-white text-xs px-4 py-2 rounded-xl font-bold self-end"
              >
                Salin Kode Script
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
