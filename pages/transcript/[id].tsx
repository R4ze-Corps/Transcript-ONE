import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import {
  getExpiresAt,
  getRemainingTime,
  getTranscriptById,
  isTranscriptExpired,
  transcriptRetentionDays,
} from "@/lib/transcripts";

function TicketIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 9a3 3 0 0 0 0 6v3a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-3a3 3 0 0 0 0-6V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
      <path d="M9 9h6" />
      <path d="M9 15h6" />
      <path d="M7 4v3" />
      <path d="M7 17v3" />
      <path d="M17 4v3" />
      <path d="M17 17v3" />
    </svg>
  );
}

function FileErrorIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="m10 12 4 4" />
      <path d="m14 12-4 4" />
    </svg>
  );
}

export default function TranscriptPage() {
  const router = useRouter();
  const id = typeof router.query.id === "string" ? router.query.id : "";
  const transcript = useMemo(() => (id ? getTranscriptById(id) : undefined), [id]);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60000);
    return () => window.clearInterval(timer);
  }, []);

  const expired = transcript ? isTranscriptExpired(transcript, now) : false;
  const remaining = transcript ? getRemainingTime(transcript, now) : undefined;
  const expiresAt = transcript ? getExpiresAt(transcript) : undefined;

  if (!router.isReady) {
    return null;
  }

  if (!transcript || expired) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#050608] px-5 text-white">
        <section className="w-full max-w-xl rounded-xl border border-[#252a31] bg-[#111316] px-6 py-10 text-center">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-[#331017] text-[#ff1744]">
            <FileErrorIcon className="h-11 w-11" />
          </div>
          <h1 className="mt-7 text-2xl font-extrabold">
            Transcript removido
          </h1>
          <p className="mt-5 text-base leading-7 text-[#a0a4ad]">
            Esse transcript nao existe ou ja passou do limite de{" "}
            {transcriptRetentionDays} dias.
          </p>
          <Link
            className="mt-6 inline-flex rounded-lg border border-[#2b3038] bg-[#050608] px-4 py-2 text-sm font-bold text-white transition hover:border-[#349bf3]"
            href="/"
          >
            Voltar ao inicio
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050608] text-white">
      <header className="sticky top-0 z-10 border-b border-[#152233] bg-[#0b0f15]/95 px-5 py-4 backdrop-blur sm:px-8">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <img
              alt={`Foto do servidor ${transcript.serverName}`}
              className="h-12 w-12 rounded-full border border-[#28313c] bg-[#050608]"
              src={transcript.serverIcon}
            />
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-xs font-bold uppercase text-[#349bf3]">
                <TicketIcon className="h-4 w-4" />
                {transcript.id}
              </p>
              <h1 className="truncate text-xl font-extrabold">
                {transcript.serverName}
              </h1>
            </div>
          </div>

          <div className="rounded-xl border border-[#28313c] bg-[#050608] px-4 py-3 text-sm font-bold text-[#d4d4d8]">
            Expira em {remaining?.days}d {remaining?.hours}h{" "}
            {remaining?.minutes}m
          </div>
        </div>
      </header>

      <section className="mx-auto flex min-h-[calc(100vh-81px)] max-w-5xl flex-col px-5 py-8 sm:px-8">
        <div className="mb-8 rounded-xl border border-[#173452] bg-[#0d1117] px-5 py-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold">{transcript.title}</h2>
              <p className="mt-2 text-sm leading-6 text-[#8d8f96]">
                {transcript.status}
              </p>
            </div>
            <div className="text-right text-xs font-bold text-[#777a82]">
              <p>{transcript.displayDate}</p>
              <p>
                Remove em{" "}
                {expiresAt?.toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-6">
          {transcript.messages.map((message, index) => (
            <article
              className={`flex items-end gap-3 ${
                message.role === "agent" ? "justify-end" : "justify-start"
              }`}
              key={`${message.author}-${message.time}-${index}`}
            >
              {message.role === "member" ? (
                <img
                  alt={`Foto do Discord de ${message.author}`}
                  className="h-11 w-11 rounded-full bg-[#050608]"
                  src={message.avatar}
                />
              ) : null}

              <div
                className={`flex max-w-[78%] flex-col ${
                  message.role === "agent" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`mb-1 flex flex-wrap items-baseline gap-2 ${
                    message.role === "agent" ? "justify-end" : "justify-start"
                  }`}
                >
                  <span
                    className={`font-bold ${
                      message.role === "agent" ? "text-[#349bf3]" : "text-white"
                    }`}
                  >
                    {message.author}
                  </span>
                  <span className="text-xs font-bold text-[#777a82]">
                    {message.time}
                  </span>
                </div>
                <p
                  className={`rounded-2xl px-4 py-3 text-sm leading-6 shadow-[0_10px_24px_rgba(0,0,0,0.18)] ${
                    message.role === "agent"
                      ? "rounded-br-sm bg-[#349bf3] text-white"
                      : "rounded-bl-sm bg-[#252a31] text-[#f3f4f6]"
                  }`}
                >
                  {message.content}
                </p>
              </div>

              {message.role === "agent" ? (
                <img
                  alt={`Foto do Discord de ${message.author}`}
                  className="h-11 w-11 rounded-full bg-[#050608]"
                  src={message.avatar}
                />
              ) : null}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
