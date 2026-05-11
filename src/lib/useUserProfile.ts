"use client";

import { useEffect, useState } from "react";
import { getUserPreferences, setUserPreferences } from "tldraw";

export const PROFILE_COLORS = [
  "#ff6b6b",
  "#ffd93d",
  "#6bcb77",
  "#4d96ff",
  "#b388eb",
  "#ffb4a2",
  "#3a86ff",
  "#fb8500",
] as const;

const ADJECTIVES = [
  "happy",
  "lucky",
  "swift",
  "brave",
  "calm",
  "neon",
  "silent",
  "sunny",
];
const ANIMALS = [
  "panda",
  "fox",
  "otter",
  "bear",
  "owl",
  "lion",
  "tiger",
  "whale",
];

function makeRandomName(): string {
  const a = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const b = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  return `${a}-${b}`;
}

function makeRandomColor(): string {
  return PROFILE_COLORS[Math.floor(Math.random() * PROFILE_COLORS.length)];
}

export type UserProfile = {
  id: string;
  name: string;
  color: string;
};

const PROFILE_EVENT = "brainboard:profile-changed";

function readProfile(): UserProfile {
  const prefs = getUserPreferences();
  let name = prefs.name?.trim() || "";
  let color = prefs.color || "";

  if (!name) name = makeRandomName();
  if (!color) color = makeRandomColor();

  if (!prefs.name || !prefs.color) {
    setUserPreferences({ ...prefs, name, color });
  }
  return { id: prefs.id, name, color };
}

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    setProfile(readProfile());
    function onChange() {
      setProfile(readProfile());
    }
    window.addEventListener(PROFILE_EVENT, onChange);
    return () => window.removeEventListener(PROFILE_EVENT, onChange);
  }, []);

  function update(patch: Partial<Pick<UserProfile, "name" | "color">>) {
    const current = getUserPreferences();
    const next = { ...current, ...patch };
    setUserPreferences(next);
    window.dispatchEvent(new Event(PROFILE_EVENT));
  }

  return { profile, update };
}
