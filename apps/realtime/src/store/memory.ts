import { SessionStore, StoredAnswer, StoredPlayer, StoredSession } from "./types.js";

export class MemorySessionStore implements SessionStore {
  private sessions = new Map<string, StoredSession>();
  private players = new Map<string, Map<string, StoredPlayer>>(); // pin -> (playerId -> StoredPlayer)
  private nicknames = new Map<string, Set<string>>(); // pin -> Set<lowercase nickname>
  private answers = new Map<string, Map<number, Map<string, StoredAnswer>>>(); // pin -> (questionIndex -> (playerId -> StoredAnswer))
  private activePins = new Set<string>();

  async generateUniquePin(): Promise<string> {
    for (let i = 0; i < 1000; i++) {
      const pin = Math.floor(100000 + Math.random() * 900000).toString();
      if (!this.activePins.has(pin)) {
        this.activePins.add(pin);
        return pin;
      }
    }
    throw new Error("Unable to generate unique PIN");
  }

  async isPinActive(pin: string): Promise<boolean> {
    return this.activePins.has(pin);
  }

  async createSession(session: StoredSession): Promise<void> {
    this.sessions.set(session.pin, session);
    this.players.set(session.pin, new Map());
    this.nicknames.set(session.pin, new Set());
    this.answers.set(session.pin, new Map());
    this.activePins.add(session.pin);
  }

  async getSession(pin: string): Promise<StoredSession | null> {
    return this.sessions.get(pin) || null;
  }

  async updateSession(pin: string, patch: Partial<StoredSession>): Promise<void> {
    const existing = this.sessions.get(pin);
    if (!existing) return;
    this.sessions.set(pin, { ...existing, ...patch });
  }

  async deleteSession(pin: string): Promise<void> {
    this.sessions.delete(pin);
    this.players.delete(pin);
    this.nicknames.delete(pin);
    this.answers.delete(pin);
    this.activePins.delete(pin);
  }

  async addPlayer(pin: string, player: StoredPlayer): Promise<void> {
    let pinPlayers = this.players.get(pin);
    if (!pinPlayers) {
      pinPlayers = new Map();
      this.players.set(pin, pinPlayers);
    }
    pinPlayers.set(player.playerId, player);
  }

  async getPlayer(pin: string, playerId: string): Promise<StoredPlayer | null> {
    return this.players.get(pin)?.get(playerId) || null;
  }

  async getPlayerByRejoinToken(pin: string, token: string): Promise<StoredPlayer | null> {
    const pinPlayers = this.players.get(pin);
    if (!pinPlayers) return null;
    for (const player of pinPlayers.values()) {
      if (player.rejoinToken === token) {
        return player;
      }
    }
    return null;
  }

  async getPlayers(pin: string): Promise<StoredPlayer[]> {
    const pinPlayers = this.players.get(pin);
    if (!pinPlayers) return [];
    return Array.from(pinPlayers.values());
  }

  async updatePlayer(pin: string, playerId: string, patch: Partial<StoredPlayer>): Promise<void> {
    const player = this.players.get(pin)?.get(playerId);
    if (!player) return;
    this.players.get(pin)!.set(playerId, { ...player, ...patch });
  }

  async removePlayer(pin: string, playerId: string): Promise<void> {
    const player = this.players.get(pin)?.get(playerId);
    if (player) {
      this.removeNickname(pin, player.nickname);
      this.players.get(pin)?.delete(playerId);
    }
  }

  async addNickname(pin: string, nickname: string): Promise<boolean> {
    let pinNicknames = this.nicknames.get(pin);
    if (!pinNicknames) {
      pinNicknames = new Set();
      this.nicknames.set(pin, pinNicknames);
    }
    const lower = nickname.toLowerCase();
    if (pinNicknames.has(lower)) {
      return false;
    }
    pinNicknames.add(lower);
    return true;
  }

  async removeNickname(pin: string, nickname: string): Promise<void> {
    this.nicknames.get(pin)?.delete(nickname.toLowerCase());
  }

  async isNicknameTaken(pin: string, nickname: string): Promise<boolean> {
    return Boolean(this.nicknames.get(pin)?.has(nickname.toLowerCase()));
  }

  async recordAnswer(pin: string, questionIndex: number, answer: StoredAnswer): Promise<boolean> {
    let pinAnswers = this.answers.get(pin);
    if (!pinAnswers) {
      pinAnswers = new Map();
      this.answers.set(pin, pinAnswers);
    }
    let qAnswers = pinAnswers.get(questionIndex);
    if (!qAnswers) {
      qAnswers = new Map();
      pinAnswers.set(questionIndex, qAnswers);
    }
    if (qAnswers.has(answer.playerId)) {
      return false; // already answered
    }
    qAnswers.set(answer.playerId, answer);
    return true;
  }

  async getAnswers(pin: string, questionIndex: number): Promise<StoredAnswer[]> {
    const qAnswers = this.answers.get(pin)?.get(questionIndex);
    if (!qAnswers) return [];
    return Array.from(qAnswers.values());
  }

  async getAllAnswers(pin: string): Promise<Record<number, StoredAnswer[]>> {
    const result: Record<number, StoredAnswer[]> = {};
    const pinAnswers = this.answers.get(pin);
    if (!pinAnswers) return result;
    for (const [qIndex, qMap] of pinAnswers.entries()) {
      result[qIndex] = Array.from(qMap.values());
    }
    return result;
  }
}
