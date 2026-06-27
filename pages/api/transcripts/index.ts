import type { NextApiRequest, NextApiResponse } from "next";
import {
  listRecentTranscripts,
  saveTranscript,
  transcriptRetentionDays,
} from "@/lib/transcript-store";
import type { TranscriptMessage } from "@/lib/transcripts";

type ErrorResponse = {
  error: string;
};

function isAuthorized(request: NextApiRequest) {
  const expectedSecret = process.env.BOT_API_SECRET;

  if (!expectedSecret) {
    return true;
  }

  const authorization = request.headers.authorization;
  return authorization === `Bearer ${expectedSecret}`;
}

function normalizeMessages(messages: unknown): TranscriptMessage[] {
  if (!Array.isArray(messages)) {
    return [];
  }

  return messages
    .map((message) => {
      if (!message || typeof message !== "object") {
        return null;
      }

      const rawMessage = message as Record<string, unknown>;
      const author =
        typeof rawMessage.author === "string" ? rawMessage.author : "Usuario";
      const content =
        typeof rawMessage.content === "string" ? rawMessage.content : "";
      const avatar =
        typeof rawMessage.avatar === "string"
          ? rawMessage.avatar
          : "https://cdn.discordapp.com/embed/avatars/1.png";
      const time =
        typeof rawMessage.time === "string"
          ? rawMessage.time
          : new Date().toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            });
      const role = rawMessage.role === "agent" ? "agent" : "member";

      if (!content.trim()) {
        return null;
      }

      return { author, avatar, content, role, time };
    })
    .filter((message): message is TranscriptMessage => Boolean(message));
}

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse,
) {
  try {
    if (request.method === "GET") {
      const transcripts = await listRecentTranscripts(10);
      return response.status(200).json({ transcripts });
    }

    if (request.method === "POST") {
      if (!isAuthorized(request)) {
        return response
          .status(401)
          .json({ error: "Token do bot invalido." } satisfies ErrorResponse);
      }

      const body = request.body as Record<string, unknown>;
      const messages = normalizeMessages(body.messages);
      const serverName =
        typeof body.serverName === "string" ? body.serverName : "";

      if (!serverName.trim()) {
        return response
          .status(400)
          .json({ error: "serverName e obrigatorio." } satisfies ErrorResponse);
      }

      if (messages.length === 0) {
        return response
          .status(400)
          .json({ error: "Envie ao menos uma mensagem." } satisfies ErrorResponse);
      }

      const transcript = await saveTranscript({
        title: typeof body.title === "string" ? body.title : undefined,
        status: typeof body.status === "string" ? body.status : undefined,
        agent: typeof body.agent === "string" ? body.agent : undefined,
        duration: typeof body.duration === "string" ? body.duration : undefined,
        serverName,
        serverIcon:
          typeof body.serverIcon === "string" ? body.serverIcon : undefined,
        messages,
      });

      return response.status(201).json({
        code: transcript.id,
        transcript,
        expiresInDays: transcriptRetentionDays,
        url: `/transcript/${transcript.id}`,
      });
    }

    response.setHeader("Allow", "GET, POST");
    return response
      .status(405)
      .json({ error: "Metodo nao permitido." } satisfies ErrorResponse);
  } catch (error) {
    console.error(error);
    return response
      .status(500)
      .json({ error: "Erro interno ao processar transcript." });
  }
}
