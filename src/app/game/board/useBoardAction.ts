"use client";
import { useRef, useState } from "react";

/** One in-flight mutation per board. Failed actions are never retried automatically. */
export function useBoardAction(synchronized: boolean) {
  const locked = useRef(false);
  const [pending, setPending] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    kind: "success" | "error";
    text: string;
  } | null>(null);
  async function run(
    label: string,
    action: () => Promise<void>,
    onSuccess?: () => void,
  ) {
    if (locked.current || !synchronized) return;
    locked.current = true;
    setPending(label);
    setFeedback(null);
    try {
      await action();
      setFeedback({
        kind: "success",
        text: `${label}: request confirmed. The synchronized board shows the result.`,
      });
      onSuccess?.();
    } catch {
      setFeedback({
        kind: "error",
        text: `${label} could not be completed. Your selection is kept. Check the board before trying again.`,
      });
    } finally {
      locked.current = false;
      setPending(null);
    }
  }
  return { run, pending, feedback, busy: pending !== null || !synchronized };
}
