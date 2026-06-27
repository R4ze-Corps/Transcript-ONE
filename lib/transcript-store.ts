import type { Collection } from "mongodb";
import client from "@/lib/mongodb";
import {
  formatDisplayDate,
  getExpiresAt,
  transcriptRetentionDays,
  type TranscriptMessage,
  type TranscriptRecord,
} from "@/lib/transcripts";

type TranscriptDocument = Omit<
  TranscriptRecord,
  "createdAt" | "expiresAt" | "displayDate"
> & {
  createdAt: Date;
  expiresAt: Date;
};

type SaveTranscriptInput = {
  title?: string;
  status?: string;
  agent?: string;
  duration?: string;
  serverName: string;
  serverIcon?: string;
  messages: TranscriptMessage[];
};

const databaseName = process.env.MONGODB_DB || "ticket-transcripts";
const collectionName = "transcripts";

let indexesReady = false;

function generateTranscriptCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 7 }, () =>
    alphabet[Math.floor(Math.random() * alphabet.length)],
  ).join("");
}

function serializeTranscript(document: TranscriptDocument): TranscriptRecord {
  return {
    ...document,
    displayDate: formatDisplayDate(document.createdAt),
    createdAt: document.createdAt.toISOString(),
    expiresAt: document.expiresAt.toISOString(),
  };
}

async function getCollection(): Promise<Collection<TranscriptDocument>> {
  if (!process.env.MONGODB_URI) {
    throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
  }

  await client.connect();
  const collection = client
    .db(databaseName)
    .collection<TranscriptDocument>(collectionName);

  if (!indexesReady) {
    await collection.createIndex({ id: 1 }, { unique: true });
    await collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
    await collection.createIndex({ createdAt: -1 });
    indexesReady = true;
  }

  return collection;
}

export async function saveTranscript(input: SaveTranscriptInput) {
  const collection = await getCollection();
  const createdAt = new Date();
  const expiresAt = getExpiresAt(createdAt);

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const id = generateTranscriptCode();
    const document: TranscriptDocument = {
      id,
      title: input.title || "Atendimento localizado",
      status: input.status || "Transcript disponivel para consulta.",
      agent: input.agent || "Megan",
      duration: input.duration || "0 min",
      serverName: input.serverName,
      serverIcon:
        input.serverIcon || "https://cdn.discordapp.com/embed/avatars/0.png",
      messages: input.messages,
      createdAt,
      expiresAt,
    };

    try {
      await collection.insertOne(document);
      return serializeTranscript(document);
    } catch (error) {
      const mongoError = error as { code?: number };
      if (mongoError.code !== 11000 || attempt === 4) {
        throw error;
      }
    }
  }

  throw new Error("Nao foi possivel gerar um codigo unico para o transcript.");
}

export async function findTranscriptById(id: string) {
  const collection = await getCollection();
  const document = await collection.findOne({
    id: id.toUpperCase(),
    expiresAt: { $gt: new Date() },
  });

  return document ? serializeTranscript(document) : null;
}

export async function listRecentTranscripts(limit = 10) {
  const collection = await getCollection();
  const documents = await collection
    .find({ expiresAt: { $gt: new Date() } })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();

  return documents.map(serializeTranscript);
}

export { transcriptRetentionDays };
