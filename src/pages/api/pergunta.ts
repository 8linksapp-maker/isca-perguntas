import type { APIRoute } from 'astro';
import { z } from 'zod';
import { supabaseServer } from '../../lib/supabase';

const payloadSchema = z.object({
  nome: z.string().trim().min(1, 'Nome obrigatório').max(120),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Email inválido')
    .max(254),
  cidade: z.string().trim().min(1, 'Cidade obrigatória').max(120),
  pergunta: z.string().trim().min(5, 'Pergunta muito curta').max(1000),
});

/**
 * POST /api/pergunta
 * Body: { nome, email, cidade, pergunta }
 * Resposta sucesso: { ok: true } (200)
 * Erro: { ok: false, erro: string } (400 | 500)
 *
 * Perguntas NÃO são únicas — mesmo email pode enviar várias.
 * Sem email automático nesta isca (só gravação).
 */
export const POST: APIRoute = async ({ request }) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { ok: false, erro: 'Corpo da requisição inválido.' },
      { status: 400 },
    );
  }

  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { ok: false, erro: 'Dados inválidos. Confira nome, email, cidade e pergunta.' },
      { status: 400 },
    );
  }

  const { nome, email, cidade, pergunta } = parsed.data;

  try {
    const { error } = await supabaseServer()
      .from('questions')
      .insert({ nome, email, cidade, pergunta });

    if (error) throw error;

    return Response.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error('[pergunta] erro interno:', err instanceof Error ? err.message : err);
    return Response.json(
      { ok: false, erro: 'Erro interno. Tente novamente em instantes.' },
      { status: 500 },
    );
  }
};
