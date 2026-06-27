export type TranscriptMessage = {
  author: string;
  role: "agent" | "member";
  avatar: string;
  time: string;
  content: string;
};

export type TranscriptRecord = {
  id: string;
  title: string;
  status: string;
  displayDate: string;
  createdAt: string;
  expiresAt: string;
  agent: string;
  duration: string;
  serverName: string;
  serverIcon: string;
  messages: TranscriptMessage[];
};

export const transcriptRetentionDays = 30;

export function formatDisplayDate(date: Date) {
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getExpiresAt(createdAt: Date | string) {
  const createdAtDate =
    typeof createdAt === "string" ? new Date(createdAt) : createdAt;

  return new Date(
    createdAtDate.getTime() + transcriptRetentionDays * 24 * 60 * 60 * 1000,
  );
}

export function isTranscriptExpired(
  transcript: Pick<TranscriptRecord, "expiresAt">,
  now = new Date(),
) {
  return now.getTime() >= new Date(transcript.expiresAt).getTime();
}

export function getRemainingTime(
  transcript: Pick<TranscriptRecord, "expiresAt">,
  now = new Date(),
) {
  const remainingMs = Math.max(
    0,
    new Date(transcript.expiresAt).getTime() - now.getTime(),
  );
  const totalMinutes = Math.floor(remainingMs / 60000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  return { days, hours, minutes, remainingMs };
}
