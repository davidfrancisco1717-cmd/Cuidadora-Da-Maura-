import { Message, MauraProfile, HealthLog } from "../types";

export async function getChatResponse(
  message: string,
  history: Message[],
  profile: MauraProfile,
  logs: HealthLog[]
): Promise<string> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history, profile, logs }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data.response;
}

export async function generateHealthSummary(logs: HealthLog[], profile: MauraProfile): Promise<string> {
  const res = await fetch("/api/summary", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ logs, profile }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data.summary;
}
