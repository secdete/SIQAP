import * as XLSX from "xlsx";
import { LeaderboardEntry } from "@siqap/shared";

interface SessionExportData {
  pin: string;
  quizTitle?: string;
  podium: LeaderboardEntry[];
  totalPlayers: number;
}

export function exportSessionToExcel(data: SessionExportData) {
  const wb = XLSX.utils.book_new();

  // 1. Sheet Peringkat Akhir
  const leaderboardRows = data.podium.map((p) => ({
    "Peringkat": `#${p.rank}`,
    "Nama Pemain": p.nickname,
    "Total Skor": p.score,
    "Status": p.rank === 1 ? "Juara 1 (Emas)" : p.rank === 2 ? "Juara 2 (Perak)" : p.rank === 3 ? "Juara 3 (Perunggu)" : "Peserta",
  }));

  const wsLeaderboard = XLSX.utils.json_to_sheet(leaderboardRows);
  XLSX.utils.book_append_sheet(wb, wsLeaderboard, "Peringkat Akhir");

  // 2. Sheet Ringkasan Sesi
  const summaryRows = [
    { "Parameter": "Game PIN", "Nilai": data.pin },
    { "Parameter": "Judul Kuis", "Nilai": data.quizTitle || "Kuis SIQAP" },
    { "Parameter": "Total Peserta", "Nilai": data.totalPlayers },
    { "Parameter": "Waktu Selesai", "Nilai": new Date().toLocaleString("id-ID") },
    { "Parameter": "Pemenang Utama", "Nilai": data.podium[0]?.nickname || "-" },
    { "Parameter": "Skor Tertinggi", "Nilai": data.podium[0]?.score || 0 },
  ];

  const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
  XLSX.utils.book_append_sheet(wb, wsSummary, "Ringkasan Sesi");

  // Generate file and trigger download in browser
  const filename = `Laporan_Kuis_SIQAP_PIN_${data.pin}_${Date.now()}.xlsx`;
  XLSX.writeFile(wb, filename);
}
