import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock do cliente Supabase server-side antes de importar o endpoint
let insertResult: { error: Error | null } = { error: null };
const insert = vi.fn(async () => insertResult);

vi.mock('../../lib/supabase', () => ({
  supabaseServer: vi.fn(() => ({
    from: () => ({ insert }),
  })),
}));

import { POST } from './pergunta';

const perguntaValida = {
  nome: 'Maria',
  email: 'maria@teste.com',
  cidade: 'Fortaleza',
  pergunta: 'Como faço para melhorar o SEO do meu site?',
};

function makeRequest(body: unknown): Request {
  return new Request('http://localhost/api/pergunta', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/pergunta', () => {
  beforeEach(() => {
    insert.mockClear();
    insertResult = { error: null };
  });

  it('grava pergunta válida e retorna { ok: true }', async () => {
    const res = await POST({ request: makeRequest(perguntaValida) } as any);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual({ ok: true });
    expect(insert).toHaveBeenCalledTimes(1);
    expect(insert).toHaveBeenCalledWith(perguntaValida);
  });

  it('permite o mesmo email enviar mais de uma pergunta (insert puro, sem upsert)', async () => {
    await POST({ request: makeRequest(perguntaValida) } as any);
    const res = await POST({ request: makeRequest(perguntaValida) } as any);

    expect(res.status).toBe(200);
    expect(insert).toHaveBeenCalledTimes(2);
  });

  it('rejeita campos vazios com 400', async () => {
    const res = await POST({ request: makeRequest({ ...perguntaValida, cidade: '' }) } as any);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.ok).toBe(false);
    expect(insert).not.toHaveBeenCalled();
  });

  it('rejeita email inválido com 400', async () => {
    const res = await POST({ request: makeRequest({ ...perguntaValida, email: 'nao-e-email' }) } as any);

    expect(res.status).toBe(400);
    expect(insert).not.toHaveBeenCalled();
  });

  it('rejeita pergunta muito curta com 400', async () => {
    const res = await POST({ request: makeRequest({ ...perguntaValida, pergunta: 'oi?' }) } as any);

    expect(res.status).toBe(400);
    expect(insert).not.toHaveBeenCalled();
  });

  it('rejeita pergunta acima de 1000 chars com 400', async () => {
    const res = await POST({
      request: makeRequest({ ...perguntaValida, pergunta: 'x'.repeat(1001) }),
    } as any);

    expect(res.status).toBe(400);
    expect(insert).not.toHaveBeenCalled();
  });

  it('retorna 500 quando o Supabase falha (sem vazar detalhe)', async () => {
    insertResult = { error: new Error('connection refused') };

    const res = await POST({ request: makeRequest(perguntaValida) } as any);
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json.ok).toBe(false);
    expect(json.erro).not.toContain('connection refused');
  });
});
