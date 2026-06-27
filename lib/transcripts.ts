export type TranscriptMessage = {
  author: string;
  role: "agent" | "member";
  avatar: string;
  time: string;
  content: string;
};

export type Transcript = {
  id: string;
  title: string;
  status: string;
  displayDate: string;
  createdAt: string;
  agent: string;
  duration: string;
  serverName: string;
  serverIcon: string;
  messages: TranscriptMessage[];
};

export const transcriptRetentionDays = 30;

export const transcripts: Transcript[] = [
  {
    id: "38OGACM",
    title: "Atendimento localizado",
    status: "Transcript disponivel para consulta.",
    displayDate: "Hoje, 20:42",
    createdAt: "2026-06-27T20:42:00-03:00",
    agent: "Megan",
    duration: "18 min",
    serverName: "RAZE Support",
    serverIcon: "https://cdn.discordapp.com/embed/avatars/0.png",
    messages: [
      {
        author: "Cliente",
        role: "member",
        avatar: "https://cdn.discordapp.com/embed/avatars/1.png",
        time: "20:24",
        content: "Ola, preciso revisar o transcript do meu suporte anterior.",
      },
      {
        author: "Megan",
        role: "agent",
        avatar: "https://cdn.discordapp.com/embed/avatars/0.png",
        time: "20:27",
        content: "Claro. Vou localizar o atendimento pelo ID do ticket.",
      },
      {
        author: "Cliente",
        role: "member",
        avatar: "https://cdn.discordapp.com/embed/avatars/1.png",
        time: "20:36",
        content: "Perfeito, fico no aguardo.",
      },
      {
        author: "Megan",
        role: "agent",
        avatar: "https://cdn.discordapp.com/embed/avatars/0.png",
        time: "20:42",
        content: "Localizei o atendimento e deixei o registro disponivel.",
      },
    ],
  },
  {
    id: "91KQ2BR",
    title: "Suporte finalizado",
    status: "Duvida sobre acesso resolvida com sucesso.",
    displayDate: "Hoje, 18:15",
    createdAt: "2026-06-27T18:15:00-03:00",
    agent: "Megan",
    duration: "11 min",
    serverName: "RAZE Support",
    serverIcon: "https://cdn.discordapp.com/embed/avatars/2.png",
    messages: [
      {
        author: "Cliente",
        role: "member",
        avatar: "https://cdn.discordapp.com/embed/avatars/3.png",
        time: "18:04",
        content: "Nao consigo acessar minha entrega.",
      },
      {
        author: "Megan",
        role: "agent",
        avatar: "https://cdn.discordapp.com/embed/avatars/2.png",
        time: "18:15",
        content: "Acesso validado e suporte finalizado com sucesso.",
      },
    ],
  },
  {
    id: "74L0PXC",
    title: "Revisao de entrega",
    status: "Registro salvo apos confirmacao do atendimento.",
    displayDate: "Ontem, 22:08",
    createdAt: "2026-06-26T22:08:00-03:00",
    agent: "Megan",
    duration: "24 min",
    serverName: "RAZE Support",
    serverIcon: "https://cdn.discordapp.com/embed/avatars/4.png",
    messages: [
      {
        author: "Cliente",
        role: "member",
        avatar: "https://cdn.discordapp.com/embed/avatars/5.png",
        time: "21:44",
        content: "Pode revisar a entrega antes de finalizar?",
      },
      {
        author: "Megan",
        role: "agent",
        avatar: "https://cdn.discordapp.com/embed/avatars/4.png",
        time: "22:08",
        content: "Entrega revisada e confirmada no historico.",
      },
    ],
  },
  {
    id: "52VR9AD",
    title: "Solicitacao arquivada",
    status: "Transcript protegido e disponivel no historico.",
    displayDate: "Ontem, 16:37",
    createdAt: "2026-06-26T16:37:00-03:00",
    agent: "Megan",
    duration: "9 min",
    serverName: "RAZE Support",
    serverIcon: "https://cdn.discordapp.com/embed/avatars/0.png",
    messages: [
      {
        author: "Cliente",
        role: "member",
        avatar: "https://cdn.discordapp.com/embed/avatars/1.png",
        time: "16:28",
        content: "Pode arquivar essa solicitacao?",
      },
      {
        author: "Megan",
        role: "agent",
        avatar: "https://cdn.discordapp.com/embed/avatars/0.png",
        time: "16:37",
        content: "Solicitacao registrada e arquivada no historico.",
      },
    ],
  },
];

export function getTranscriptById(id: string) {
  return transcripts.find(
    (transcript) => transcript.id.toUpperCase() === id.toUpperCase(),
  );
}

export function getExpiresAt(transcript: Transcript) {
  const createdAt = new Date(transcript.createdAt);
  return new Date(
    createdAt.getTime() + transcriptRetentionDays * 24 * 60 * 60 * 1000,
  );
}

export function isTranscriptExpired(transcript: Transcript, now = new Date()) {
  return now.getTime() >= getExpiresAt(transcript).getTime();
}

export function getActiveTranscripts(now = new Date()) {
  return transcripts.filter((transcript) => !isTranscriptExpired(transcript, now));
}

export function getRemainingTime(transcript: Transcript, now = new Date()) {
  const remainingMs = Math.max(0, getExpiresAt(transcript).getTime() - now.getTime());
  const totalMinutes = Math.floor(remainingMs / 60000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  return { days, hours, minutes, remainingMs };
}
