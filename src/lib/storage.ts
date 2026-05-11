"use client";

import { nanoid } from "nanoid";

/* ─────────── recent boards ─────────── */

const RECENT_KEY = "brainboard:recent";
const RECENT_LIMIT = 8;

export type RecentBoard = {
  id: string;
  name: string;
  template?: string;
  visitedAt: number;
};

export function getRecentBoards(): RecentBoard[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RecentBoard[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function recordVisit(input: {
  id: string;
  name?: string;
  template?: string;
}): RecentBoard {
  const list = getRecentBoards().filter((b) => b.id !== input.id);
  const board: RecentBoard = {
    id: input.id,
    name: input.name?.trim() || `board-${input.id.slice(0, 4)}`,
    template: input.template,
    visitedAt: Date.now(),
  };
  list.unshift(board);
  const trimmed = list.slice(0, RECENT_LIMIT);
  window.localStorage.setItem(RECENT_KEY, JSON.stringify(trimmed));
  window.dispatchEvent(new Event("brainboard:recent-changed"));
  return board;
}

export function renameBoard(id: string, name: string): void {
  const list = getRecentBoards().map((b) =>
    b.id === id ? { ...b, name: name.trim() || b.name } : b,
  );
  window.localStorage.setItem(RECENT_KEY, JSON.stringify(list));
  window.dispatchEvent(new Event("brainboard:recent-changed"));
}

export function removeBoard(id: string): void {
  const list = getRecentBoards().filter((b) => b.id !== id);
  window.localStorage.setItem(RECENT_KEY, JSON.stringify(list));
  window.dispatchEvent(new Event("brainboard:recent-changed"));
}

/* ─────────── room id helpers ─────────── */

export function makeRoomId(): string {
  return nanoid(10);
}

const ROOM_ID_RE = /^[A-Za-z0-9_-]{6,40}$/;

export function parseRoomInput(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  // accept full URL with /board/<id>
  const match = trimmed.match(/board\/([A-Za-z0-9_-]+)/);
  if (match) return match[1];
  return ROOM_ID_RE.test(trimmed) ? trimmed : null;
}
