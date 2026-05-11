"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { nanoid } from "nanoid";
import confetti from "canvas-confetti";

export default function CreateBoardButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { x, y },
      colors: ["#ff6b6b", "#ffd93d", "#6bcb77", "#4d96ff", "#b388eb"],
    });

    const roomId = nanoid(10);
    startTransition(() => {
      router.push(`/board/${roomId}`);
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      className="wobble-border bg-coral px-8 py-4 font-[family-name:var(--font-display)] text-2xl text-paper disabled:opacity-60"
    >
      {pending ? "opening..." : "✦ create a board"}
    </button>
  );
}
