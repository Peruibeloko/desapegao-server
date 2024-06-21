import * as jwt from '@cross/jwt';
import * as otp from '@hectorm/otpauth';

function unthrow<A, R>(fn: (fnArgs: A) => R) {
  type Success = { ok: true; data: ReturnType<typeof fn> };
  type Failiure = { ok: false; error: Error };

  return (...args: Parameters<typeof fn>): Success | Failiure => {
    try {
      const result = fn(...args);
      return { ok: true, data: result };
    } catch (e) {
      return { ok: false, error: e };
    }
  };
}

export function parseAuthHeader(header: string) {
  const [_, contents] = header.split(' ');

  const payload = unthrow(jwt.unsafeParseJWT)(contents);

  if (!payload.ok) return null;

  return payload.data;
}

export async function issueJWT(email: string, secret: string) {
  const ONE_DAY = 3600 * 24;
  return await jwt.createJWT(
    {
      aud: email,
      exp: Math.trunc(Date.now() / 1000) + ONE_DAY,
      iat: Math.trunc(Date.now() / 1000)
    },
    secret
  );
}

export async function login(email: string, code: string) {
  const kv = new Deno.Kv();
  const { value: secret } = await kv.get<string>(['auth', email]);
  kv.close();

  if (!secret) return null;

  const isValid =
    otp.TOTP.validate({
      digits: 6,
      token: code,
      secret: otp.Secret.fromUTF8(secret)
    }) !== null;

  if (!isValid) null;

  return await issueJWT(email, secret);
}
