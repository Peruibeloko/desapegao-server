import { Err, Ok } from '@fp-utils/result';

interface PaymentResponse {
  id: number;
  date_created: string;
  date_approved: string;
  date_last_updated: string;
  point_of_interaction: {
    transaction_data: {
      qr_code_base64: string;
      qr_code: string;
    };
  };
}

export async function createPix(ammount: number, email: string, cpf: string) {
  const authKey = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');

  const response = await fetch('https://api.mercadopago.com/v1/payments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Idempotency-Key': crypto.randomUUID(),
      Authorization: `Bearer ${authKey}`
    },
    body: JSON.stringify({
      description: 'Anúncio Desapegão',
      installments: 1,
      payment_method_id: 'Pix',
      notification_url: 'https://desapegao.deno.dev/callback',
      payer: {
        entity_type: 'individual',
        type: 'guest',
        email,
        identification: {
          type: 'CPF',
          number: cpf
        }
      },
      transaction_amount: ammount
    })
  });

  const data = await response.json();
  if (response.status !== 200) return Err(['MercadoPago error', data] as [string, unknown]);
  return Ok(data as PaymentResponse);
}
