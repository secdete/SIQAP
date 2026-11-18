import { create } from "zustand";
import {
  GamePhase,
  PlayerPublic,
  QuestionShow,
  QuestionReveal,
  PlayerResult,
  LeaderboardEntry,
  PlayerFinal,
} from "@siqap/shared";

interface PlayerState {
  pin: string;
  nickname: string;
  playerId: string | null;
  rejoinToken: string | null;
  phase: GamePhase;
  question: QuestionShow | null;
  remainingMs: number;
  selectedOption: number | null;
  hasAnswered: boolean;
  reveal: QuestionReveal | null;
  result: PlayerResult | null;
  finalStats: PlayerFinal | null;
  playerCount: number;

  setJoinInfo: (pin: string, nickname: string, playerId: string, rejoinToken: string) => void;
  setPhase: (phase: GamePhase) => void;
  setQuestion: (q: QuestionShow | null) => void;
  setRemainingMs: (ms: number) => void;
  setSelectedOption: (opt: number | null) => void;
  setHasAnswered: (val: boolean) => void;
  setReveal: (reveal: QuestionReveal | null) => void;
  setResult: (res: PlayerResult | null) => void;
  setFinalStats: (stats: PlayerFinal | null) => void;
  setPlayerCount: (count: number) => void;
  reset: () => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  pin: "",
  nickname: "",
  playerId: null,
  rejoinToken: null,
  phase: "LOBBY",
  question: null,
  remainingMs: 0,
  selectedOption: null,
  hasAnswered: false,
  reveal: null,
  result: null,
  finalStats: null,
  playerCount: 1,

  setJoinInfo: (pin, nickname, playerId, rejoinToken) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(`siqap_${pin}_player`, JSON.stringify({ playerId, rejoinToken, nickname }));
    }
    set({ pin, nickname, playerId, rejoinToken });
  },

  setPhase: (phase) =>
    set((state) => ({
      phase,
      // reset answers when moving to new active question
      ...(phase === "QUESTION_ACTIVE" ? { selectedOption: null, hasAnswered: false, result: null, reveal: null } : {}),
    })),

  setQuestion: (question) => set({ question }),
  setRemainingMs: (remainingMs) => set({ remainingMs }),
  setSelectedOption: (selectedOption) => set({ selectedOption, hasAnswered: true }),
  setHasAnswered: (hasAnswered) => set({ hasAnswered }),
  setReveal: (reveal) => set({ reveal }),
  setResult: (result) => set({ result }),
  setFinalStats: (finalStats) => set({ finalStats }),
  setPlayerCount: (playerCount) => set({ playerCount }),

  reset: () =>
    set({
      pin: "",
      nickname: "",
      playerId: null,
      rejoinToken: null,
      phase: "LOBBY",
      question: null,
      remainingMs: 0,
      selectedOption: null,
      hasAnswered: false,
      reveal: null,
      result: null,
      finalStats: null,
      playerCount: 1,
    }),
}));

interface HostState {
  pin: string;
  hostToken: string | null;
  phase: GamePhase;
  players: PlayerPublic[];
  playerCount: number;
  question: QuestionShow | null;
  remainingMs: number;
  answeredCount: number;
  reveal: QuestionReveal | null;
  leaderboard: LeaderboardEntry[];
  podium: LeaderboardEntry[];
  isPaused: boolean;

  setHostInfo: (pin: string, hostToken: string) => void;
  setPhase: (phase: GamePhase) => void;
  setLobby: (players: PlayerPublic[], count: number) => void;
  setQuestion: (q: QuestionShow | null) => void;
  setTick: (remainingMs: number, answeredCount: number) => void;
  setReveal: (reveal: QuestionReveal | null) => void;
  setLeaderboard: (top: LeaderboardEntry[]) => void;
  setPodium: (podium: LeaderboardEntry[]) => void;
  setIsPaused: (isPaused: boolean) => void;
  reset: () => void;
}

export const useHostStore = create<HostState>((set) => ({
  pin: "",
  hostToken: null,
  phase: "LOBBY",
  players: [],
  playerCount: 0,
  question: null,
  remainingMs: 0,
  answeredCount: 0,
  reveal: null,
  leaderboard: [],
  podium: [],
  isPaused: false,

  setHostInfo: (pin, hostToken) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(`siqap_${pin}_host`, JSON.stringify({ hostToken }));
    }
    set({ pin, hostToken });
  },

  setPhase: (phase) =>
    set({
      phase,
      ...(phase === "QUESTION_ACTIVE" ? { reveal: null } : {}),
    }),

  setLobby: (players, playerCount) => set({ players, playerCount }),
  setQuestion: (question) => set({ question }),
  setTick: (remainingMs, answeredCount) => set({ remainingMs, answeredCount }),
  setReveal: (reveal) => set({ reveal }),
  setLeaderboard: (leaderboard) => set({ leaderboard }),
  setPodium: (podium) => set({ podium }),
  setIsPaused: (isPaused) => set({ isPaused }),

  reset: () =>
    set({
      pin: "",
      hostToken: null,
      phase: "LOBBY",
      players: [],
      playerCount: 0,
      question: null,
      remainingMs: 0,
      answeredCount: 0,
      reveal: null,
      leaderboard: [],
      podium: [],
      isPaused: false,
    }),
}));
