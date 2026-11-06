import {
  GamePhase,
  GameSettings,
  QuestionInput,
} from "@siqap/shared";

export interface StoredPlayer {
  playerId: string;
  nickname: string;
  score: number;
  streak: number;
  totalResponseMs: number;
  joinedAt: number;
  rejoinToken: string;
  connected: boolean;
  socketId?: string;
}

export interface StoredAnswer {
  playerId: string;
  optionIndexes: number[];
  receivedAt: number;
  responseMs: number;
}

export interface StoredSession {
  pin: string;
  quizId: string;
  hostToken: string;
  hostSocketId?: string;
  hostDisconnectedAt?: number;
  phase: GamePhase;
  questionIndex: number;
  startedAt: number;
  endsAt: number;
  paused: boolean;
  remainingMsWhenPaused: number;
  settings: GameSettings;
  questions: QuestionInput[];
}

export interface SessionStore {
  createSession(session: StoredSession): Promise<void>;
  getSession(pin: string): Promise<StoredSession | null>;
  updateSession(pin: string, patch: Partial<StoredSession>): Promise<void>;
  deleteSession(pin: string): Promise<void>;

  addPlayer(pin: string, player: StoredPlayer): Promise<void>;
  getPlayer(pin: string, playerId: string): Promise<StoredPlayer | null>;
  getPlayerByRejoinToken(pin: string, token: string): Promise<StoredPlayer | null>;
  getPlayers(pin: string): Promise<StoredPlayer[]>;
  updatePlayer(pin: string, playerId: string, patch: Partial<StoredPlayer>): Promise<void>;
  removePlayer(pin: string, playerId: string): Promise<void>;

  addNickname(pin: string, nickname: string): Promise<boolean>;
  removeNickname(pin: string, nickname: string): Promise<void>;
  isNicknameTaken(pin: string, nickname: string): Promise<boolean>;

  recordAnswer(pin: string, questionIndex: number, answer: StoredAnswer): Promise<boolean>;
  getAnswers(pin: string, questionIndex: number): Promise<StoredAnswer[]>;
  getAllAnswers(pin: string): Promise<Record<number, StoredAnswer[]>>;

  generateUniquePin(): Promise<string>;
  isPinActive(pin: string): Promise<boolean>;
}
