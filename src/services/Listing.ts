import { FTPClient } from 'ftp';
import { decodeBase64 } from 'std/encoding/base64.ts';
import { Listing } from '@/models/Listing.ts';

interface FTPConnection {
  url: string;
  port: number;
  user: string;
  pass: string;
}

export async function uploadFTP({url, port, user, pass}: FTPConnection , listing: Listing) {
    using ftp = new FTPClient(url, {
      user,
      pass,
      port,
      mode: 'passive'
    });
    
    const [fileType, b64WithHeader] = listing.listingImage.split(';');
    const [, b64ImageData] = b64WithHeader.split(',');
    const [, extension] = fileType.split('/');
    
    const sellerNameFile = listing.sellerName.toLowerCase()
    const sellerPhoneFile = listing.sellerPhone.replaceAll(/^\D$/g, '')
    
    const fileName = `${sellerPhoneFile}_${sellerNameFile}.${extension}`;
    const imageData = decodeBase64(b64ImageData);
    
    console.info(`Connecting to ${user}@${url}:${port}`);
    await ftp.connect();
    
    console.info('Uploading', fileName);
    await ftp.upload(fileName, imageData);
}

  