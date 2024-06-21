import * as jwt from '@cross/jwt';
import * as otp from '@hectorm/otpauth';

export function parseAuthHeader(header: string) {
  const [_, contents] = header.split(' ');

  try {
    const { aud } = jwt.unsafeParseJWT(contents);
    return { token: contents, email: aud as string };
  } catch {
    return null;
  }
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
