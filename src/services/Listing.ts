import { FTPClient } from 'ftp';
import { decodeBase64 } from 'std/encoding/base64.ts';
import { Listing } from '@/models/Listing.ts';
import { createPix } from '@/clients/Payment.ts';
import { isInCooldown } from '@/clients/Q.ts';
import { paymentCreated } from '@/clients/Pending.ts';
import { Err, Ok } from '@fp-utils/result';

interface FTPConnection {
  url: string;
  port: number;
  user: string;
  pass: string;
}

interface PixCodes {
  qrCodeImage: string;
  pixCode: string;
}

export async function uploadFTP({ url, port, user, pass }: FTPConnection, listing: Listing, reqId: string) {
  const ftp = new FTPClient(url, {
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
  const connectResult = await ftp
    .connect()
    .then(() => Ok())
    .catch((e: Error) => Err(e.message));

  if (connectResult.isErr()) return connectResult;

  console.log(`[${reqId}]`, 'Uploading', fileName);
  const uploadResult = await ftp
    .upload(fileName, imageData)
    .then(() => Ok())
    .catch((e: Error) => Err(e.message));

  if (uploadResult.isErr()) return uploadResult;

  await ftp.close();
  return Ok();
}

export async function createListing(listing: Listing, reqId: string) {
  console.log(`[${reqId}]`, `Checking cooldown`);
  const isAllowed = isInCooldown(listing.sellerPhone);
  if (!isAllowed) return Err('Sender in cooldown, please wait 24h');

  console.log(`[${reqId}]`, `Creating payment`);
  const paymentResult = await createPix(5, listing.sellerName, listing.sellerPhone);

  if (paymentResult.isErr()) {
    const [err, data] = paymentResult.unwrapErr();
    console.error(`[${reqId}]`, data);
    return Err(err);
  }

  const payment = paymentResult.unwrap();

  const paymentId = payment.id;
  const qrCodeImage = payment.point_of_interaction.transaction_data.qr_code_base64;
  const pixCode = payment.point_of_interaction.transaction_data.qr_code;

  console.log(`[${reqId}]`, `Payment ${paymentId} created, waiting for notification`);
  paymentCreated(paymentId, listing);

  return Ok({ qrCodeImage, pixCode });
}
