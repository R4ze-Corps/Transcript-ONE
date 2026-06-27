import type { NextApiRequest, NextApiResponse } from "next";
import { findTranscriptById } from "@/lib/transcript-store";

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse,
) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ error: "Metodo nao permitido." });
  }

  const id = typeof request.query.id === "string" ? request.query.id : "";

  if (!id.trim()) {
    return response.status(400).json({ error: "Codigo invalido." });
  }

  try {
    const transcript = await findTranscriptById(id);

    if (!transcript) {
      return response.status(404).json({
        error: "Transcript nao encontrado ou expirado.",
      });
    }

    return response.status(200).json({ transcript });
  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: "Erro ao buscar transcript." });
  }
}
