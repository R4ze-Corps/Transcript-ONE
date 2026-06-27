import Link from "next/link";
import { FormEvent, ReactNode, useEffect, useState } from "react";
import { getRemainingTime, type TranscriptRecord } from "@/lib/transcripts";

function TabButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      className={`flex h-8 items-center gap-2 rounded-md px-3 text-sm font-bold transition ${
        active
          ? "bg-[#349bf3] text-white"
          : "text-[#d4d4d8] hover:bg-[#10141b] hover:text-white"
      }`}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

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

function SearchIcon({ className = "" }: { className?: string }) {
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
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
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

function ShieldIcon({ className = "" }: { className?: string }) {
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
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1Z" />
    </svg>
  );
}

function ClockIcon({ className = "" }: { className?: string }) {
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
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

function ExternalIcon({ className = "" }: { className?: string }) {
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
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </svg>
  );
}

export default function Home() {
  const [ticketId, setTicketId] = useState("");
  const [searchedId, setSearchedId] = useState("");
  const [transcript, setTranscript] = useState<TranscriptRecord | null>(null);
  const [recentTranscripts, setRecentTranscripts] = useState<
    TranscriptRecord[]
  >([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchAttempted, setSearchAttempted] = useState(false);
  const [activeTab, setActiveTab] = useState<"transcript" | "history">(
    "transcript",
  );

  const normalizedTicketId = ticketId.trim().toUpperCase();
  const hasSearch = searchedId.length > 0;
  const notFound =
    activeTab === "transcript" &&
    searchAttempted &&
    hasSearch &&
    !searchLoading &&
    !transcript;

  useEffect(() => {
    async function loadRecentTranscripts() {
      setHistoryLoading(true);
      try {
        const response = await fetch("/api/transcripts");
        if (!response.ok) {
          setRecentTranscripts([]);
          return;
        }

        const data = (await response.json()) as {
          transcripts?: TranscriptRecord[];
        };
        setRecentTranscripts(data.transcripts || []);
      } finally {
        setHistoryLoading(false);
      }
    }

    loadRecentTranscripts();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (normalizedTicketId.length > 0) {
      setSearchedId(normalizedTicketId);
      setActiveTab("transcript");
      setSearchAttempted(true);
      setSearchLoading(true);
      setTranscript(null);

      try {
        const response = await fetch(`/api/transcripts/${normalizedTicketId}`);
        if (!response.ok) {
          setTranscript(null);
          return;
        }

        const data = (await response.json()) as {
          transcript?: TranscriptRecord;
        };
        setTranscript(data.transcript || null);
      } finally {
        setSearchLoading(false);
      }
    }
  }

  function resetSearch() {
    setTicketId("");
    setSearchedId("");
    setTranscript(null);
    setSearchAttempted(false);
    setSearchLoading(false);
    setActiveTab("transcript");
  }

  function openTranscript(id: string) {
    setTicketId(id);
    setSearchedId(id);
    setTranscript(null);
    setSearchAttempted(false);
    setActiveTab("transcript");
  }

  return (
    <main className="min-h-screen bg-[#050608] px-5 py-8 text-white sm:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-[760px] flex-col items-center justify-center gap-8">
        {!notFound ? (
          <>
            <section className="flex w-full flex-col items-center text-center">
              <div className="mb-5 grid h-20 w-20 place-items-center rounded-full border border-[#153657] bg-[#0d2033] text-[#46a6ff] shadow-[0_0_24px_rgba(46,146,244,0.16)]">
                <TicketIcon className="h-11 w-11" />
              </div>

              <h1 className="text-[42px] font-extrabold leading-none tracking-normal sm:text-5xl">
                Ticket <span className="text-[#349bf3]">Transcript</span>
              </h1>
              <p className="mt-4 max-w-[540px] text-lg leading-8 text-[#8d8f96]">
                Acesse o historico detalhado de atendimentos atraves do ID unico
                do ticket.
              </p>

              <div className="mt-8 flex items-center gap-2 rounded-lg border border-[#28313c] bg-[#07090c] p-1">
                <TabButton
                  active={activeTab === "transcript"}
                  onClick={() => setActiveTab("transcript")}
                >
                  <TicketIcon className="h-4 w-4" />
                  Transcript
                </TabButton>
                <TabButton
                  active={activeTab === "history"}
                  onClick={() => setActiveTab("history")}
                >
                  <ClockIcon className="h-4 w-4" />
                  Historico
                </TabButton>
              </div>
            </section>

            {activeTab === "transcript" ? (
              <>
                <section className="w-full overflow-hidden rounded-xl border border-[#173452] bg-[#07090c] shadow-[0_0_32px_rgba(18,85,143,0.12)]">
                  <div className="border-b border-[#152233] bg-[#10141b] px-6 py-6">
                    <div className="flex items-center gap-3">
                      <SearchIcon className="h-6 w-6 text-[#349bf3]" />
                      <h2 className="text-xl font-bold">
                        Localizar Atendimento
                      </h2>
                    </div>
                    <p className="mt-3 text-sm text-[#8d8f96]">
                      Insira o ID de 7 caracteres do ticket (ex: 38OGACM)
                    </p>
                  </div>

                  <form
                    className="grid gap-3 px-6 py-12 sm:grid-cols-[1fr_112px]"
                    onSubmit={handleSubmit}
                  >
                    <label className="sr-only" htmlFor="ticket-id">
                      ID do ticket
                    </label>
                    <div className="flex h-12 items-center gap-3 rounded-lg border border-[#173452] bg-[#050608] px-4 text-[#8d8f96]">
                      <TicketIcon className="h-5 w-5 shrink-0" />
                      <input
                        id="ticket-id"
                        value={ticketId}
                        maxLength={7}
                        onChange={(event) => setTicketId(event.target.value)}
                        className="h-full min-w-0 flex-1 bg-transparent font-mono text-sm uppercase tracking-[0.22em] text-white outline-none placeholder:text-[#8d8f96]"
                        placeholder="DIGITE O ID DO TICKET..."
                      />
                    </div>
                    <button
                      className="h-12 rounded-lg bg-[#2b6294] px-5 text-sm font-bold text-white transition hover:bg-[#349bf3] disabled:cursor-not-allowed disabled:opacity-55"
                      disabled={normalizedTicketId.length === 0}
                      type="submit"
                    >
                      Buscar
                    </button>
                  </form>
                </section>

                {transcript ? (
                  <Link
                    className="block w-full rounded-xl border border-[#173452] bg-[#0d1117] px-6 py-5 text-left transition hover:border-[#349bf3] hover:bg-[#101722]"
                    href={`/transcript/${transcript.id}`}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-[#349bf3]">
                          {searchedId}
                        </p>
                        <h2 className="mt-1 text-xl font-bold">
                          {transcript.title}
                        </h2>
                      </div>
                      <span className="rounded-full border border-[#28313c] bg-[#050608] px-3 py-1 text-xs font-bold text-[#8d8f96]">
                        {transcript.displayDate}
                      </span>
                    </div>
                    <p className="mt-4 text-sm text-[#8d8f96]">
                      {transcript.status}
                    </p>
                    <p className="mt-4 text-xs font-bold text-[#349bf3]">
                      Abrir conversa em nova aba
                    </p>
                  </Link>
                ) : null}
              </>
            ) : (
              <section className="w-full overflow-hidden rounded-xl border border-[#173452] bg-[#07090c] shadow-[0_0_32px_rgba(18,85,143,0.12)]">
                <div className="border-b border-[#152233] bg-[#10141b] px-6 py-6">
                  <div className="flex items-center gap-3">
                    <ClockIcon className="h-6 w-6 text-[#349bf3]" />
                    <h2 className="text-xl font-bold">
                      Transcripts recentes
                    </h2>
                  </div>
                  <p className="mt-3 text-sm text-[#8d8f96]">
                    Ultimos atendimentos salvos no historico.
                  </p>
                </div>

                <div className="divide-y divide-[#141e2b]">
                  {historyLoading ? (
                    <div className="px-6 py-8 text-sm font-bold text-[#8d8f96]">
                      Carregando historico...
                    </div>
                  ) : null}

                  {!historyLoading && recentTranscripts.length === 0 ? (
                    <div className="px-6 py-8 text-sm font-bold text-[#8d8f96]">
                      Nenhum transcript salvo no banco ainda.
                    </div>
                  ) : null}

                  {recentTranscripts.map((item) => {
                    const remaining = getRemainingTime(item);

                    return (
                      <article
                        className="grid gap-4 px-6 py-5 transition hover:bg-[#0b1017] sm:grid-cols-[1fr_auto]"
                        key={item.id}
                      >
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-sm font-bold text-[#349bf3]">
                              {item.id}
                            </span>
                            <span className="rounded-full bg-[#10141b] px-2 py-1 text-[11px] font-bold text-[#8d8f96]">
                              {item.displayDate}
                            </span>
                          </div>
                          <h3 className="mt-2 text-base font-extrabold">
                            {item.title}
                          </h3>
                          <p className="mt-2 text-sm leading-6 text-[#8d8f96]">
                            {item.status}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-[#777a82]">
                            <span>Responsavel: {item.agent}</span>
                            <span>Duracao: {item.duration}</span>
                            <span>
                              Expira em: {remaining.days}d {remaining.hours}h
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            className="h-10 rounded-lg border border-[#28313c] bg-[#050608] px-4 text-sm font-bold text-white transition hover:border-[#349bf3] hover:text-[#349bf3]"
                            onClick={() => openTranscript(item.id)}
                            type="button"
                          >
                            Ver ID
                          </button>
                          <Link
                            className="inline-flex h-10 items-center rounded-lg bg-[#2b6294] px-4 text-sm font-bold text-white transition hover:bg-[#349bf3]"
                            href={`/transcript/${item.id}`}
                            rel="noopener noreferrer"
                            target="_blank"
                          >
                            Abrir
                          </Link>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            )}

            <section className="grid w-full gap-4 sm:grid-cols-3">
              {[
                {
                  icon: <ShieldIcon className="h-6 w-6" />,
                  title: "Seguranca",
                  text: "Logs protegidos e armazenados em nuvem.",
                },
                {
                  icon: <ClockIcon className="h-6 w-6" />,
                  title: "30 Dias",
                  text: "Arquivos removidos automaticamente apos 30 dias.",
                },
                {
                  icon: <ExternalIcon className="h-6 w-6" />,
                  title: "Integrado",
                  text: "Sincronizacao instantanea com o Discord.",
                },
              ].map((item) => (
                <article
                  className="flex min-h-[126px] flex-col items-center justify-center rounded-xl border border-[#252a31] bg-[#080a0d] px-5 text-center"
                  key={item.title}
                >
                  <div className="text-[#349bf3]">{item.icon}</div>
                  <h3 className="mt-3 text-sm font-extrabold">{item.title}</h3>
                  <p className="mt-3 text-xs leading-5 text-[#777a82]">
                    {item.text}
                  </p>
                </article>
              ))}
            </section>
          </>
        ) : (
          <section className="w-full rounded-xl border border-[#252a31] bg-[#111316] px-6 py-10 text-center sm:px-16">
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-[#331017] text-[#ff1744]">
              <FileErrorIcon className="h-11 w-11" />
            </div>
            <h1 className="mt-7 text-2xl font-extrabold">
              Transcript nao encontrado
            </h1>
            <p className="mt-10 text-base text-[#a0a4ad]">
              O transcript que voce esta procurando nao existe, foi removido ou
              expirou apos 30 dias.
            </p>
            <button
              className="mt-5 rounded-lg border border-[#2b3038] bg-[#050608] px-4 py-2 text-sm font-bold text-white transition hover:border-[#349bf3]"
              onClick={resetSearch}
              type="button"
            >
              Voltar ao inicio
            </button>
          </section>
        )}

        <div className="rounded-full bg-[#17191d] px-4 py-2 font-mono text-xs font-bold text-[#84868c]">
          Powered by Megan
        </div>
      </div>
    </main>
  );
}
