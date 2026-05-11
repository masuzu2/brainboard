"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { parseRoomInput } from "@/lib/storage";
import { useToast } from "./Toast";

export default function JoinRoomInput() {
  const router = useRouter();
  const toast = useToast();
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const id = parseRoomInput(value);
    if (!id) {
      toast.show("Hmm, that doesn't look like a valid room id or link.", "error");
      return;
    }
    setLoading(true);
    router.push(`/board/${id}`);
  }

  return (
    <form onSubmit={submit} className="flex w-full max-w-md items-center gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="paste room id or link to join..."
        className="wobble-border flex-1 bg-paper px-3 py-2 font-[family-name:var(--font-hand)] text-base focus:outline-none"
        aria-label="Room id or link"
      />
      <button
        type="submit"
        disabled={loading || !value.trim()}
        className="wobble-border bg-sky px-4 py-2 font-[family-name:var(--font-display)] text-xl text-paper disabled:opacity-60"
      >
        {loading ? "..." : "join →"}
      </button>
    </form>
  );
}
