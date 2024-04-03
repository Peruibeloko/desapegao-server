import { Pix } from '@/models/Pix.ts';

type PixKeyType = 'cpf' | 'cnpj' | 'email' | 'telefone' | 'aleatorio';

export async function createPix(ammount: number, pixKey: string, pixKeyType: PixKeyType) {
  const txid = crypto.randomUUID();

  const params = new URLSearchParams();
  params.append('tipo', pixKeyType);
  params.append('chave', pixKey);
  params.append('valor', formatCurrency(ammount));
  params.append('info', 'Dezapegão');
  params.append('txid', txid);

  const pixData = await fetch('https://pix.ae/', {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params,
    method: 'POST'
  }).then(res => res.json() as Promise<Pix>);

  return {
    ...pixData,
    txid
  };
}

export async function checkStatus(txid: string) {
  // TODO vai precisar de api mesmo
}

function formatCurrency(ammount: number) {
  return `R$ ${ammount.toFixed(2).replace('.', ',')}`;
}
