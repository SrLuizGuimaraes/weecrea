import { afterEach, describe, expect, it, vi } from 'vitest';
import { cronAutorizado, negarSeNaoForCron } from './cron';

const req = (auth?: string) => new Request('http://x/api/cron/saude', auth ? { headers: { authorization: auth } } : {});

describe('cron', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('aceita só o segredo certo', () => {
    vi.stubEnv('CRON_SECRET', 'segredo-de-teste');
    expect(cronAutorizado(req('Bearer segredo-de-teste'))).toBe(true);
    expect(cronAutorizado(req('Bearer outro'))).toBe(false);
    expect(cronAutorizado(req())).toBe(false);
    expect(negarSeNaoForCron(req())?.status).toBe(401);
    expect(negarSeNaoForCron(req('Bearer segredo-de-teste'))).toBeUndefined();
  });

  it('recusa tudo quando CRON_SECRET não existe', () => {
    vi.stubEnv('CRON_SECRET', '');
    expect(cronAutorizado(req('Bearer '))).toBe(false);
  });
});
