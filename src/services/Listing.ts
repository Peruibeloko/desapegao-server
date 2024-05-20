import { FTPClient } from 'ftp';
import { decodeBase64 } from 'std/encoding/base64.ts';
import { Listing } from '@/models/Listing.ts';
import { createPix } from '@/clients/Payment.ts';
import { isInCooldown, nq } from '@/clients/Q.ts';

interface FTPConnection {
  url: string;
  port: number;
  user: string;
  pass: string;
}

export async function uploadFTP({ url, port, user, pass }: FTPConnection, listing: Listing, reqId: string) {
  using ftp = new FTPClient(url, {
    user,
    pass,
    port,
    mode: 'passive'
  });

  const [fileType, b64WithHeader] = listing.listingImage.split(';');
  const [, b64ImageData] = b64WithHeader.split(',');
  const [, extension] = fileType.split('/');

  const sellerNameFile = listing.sellerName.toLowerCase();
  const sellerPhoneFile = listing.sellerPhone.replaceAll(/^\D$/g, '');

  const fileName = `${sellerPhoneFile}_${sellerNameFile}.${extension}`;
  const imageData = decodeBase64(b64ImageData);

  console.log(`[${reqId}]`, `Connecting to ${user}@${url}:${port}`);
  await ftp.connect();

  console.log(`[${reqId}]`, 'Uploading', fileName);
  await ftp.upload(fileName, imageData);
}

export async function createListing(listing: Listing, conn: Deno.Kv, reqId: string) {
  console.log(`[${reqId}]`, `Checking cooldown`);
  const isAllowed = isInCooldown(listing.sellerPhone, conn);
  if (!isAllowed) throw new Error('Sender in cooldown, please wait 24h', { cause: 'cooldown' });

  console.log(`[${reqId}]`, `Creating payment`);
  await createPix(5, listing.sellerName, listing.sellerPhone);

  console.log(`[${reqId}]`, `Adding listing to the queue`);
  await nq(listing, conn);
}
