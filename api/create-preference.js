const TITULO_PLANO_PRO = 'Plano Pro - Gerenciador de Clientes'
const PRECO_PLANO_PRO = 14.99
const URL_CRIAR_PREFERENCIA =
  'https://api.mercadopago.com/checkout/preferences'

function obterBodyJson(req) {
  if (!req.body) {
    return {}
  }

  if (typeof req.body === 'string') {
    return JSON.parse(req.body)
  }

  return req.body
}

function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function montarUrlApp(appUrl, caminho) {
  return new URL(caminho, appUrl).toString()
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({
      error: 'Método não permitido.',
    })
  }

  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN?.trim()
  const appUrl = process.env.APP_URL?.trim()

  if (!accessToken || !appUrl) {
    return res.status(500).json({
      error: 'A integração de pagamento não está configurada corretamente.',
    })
  }

  let body

  try {
    body = obterBodyJson(req)
  } catch {
    return res.status(400).json({
      error: 'Corpo da requisição inválido.',
    })
  }

  const userId = String(body?.user_id ?? '').trim()
  const email = String(body?.email ?? '').trim().toLowerCase()

  if (!userId || !email) {
    return res.status(400).json({
      error: 'user_id e email são obrigatórios.',
    })
  }

  if (!validarEmail(email)) {
    return res.status(400).json({
      error: 'O email informado é inválido.',
    })
  }

  let backUrlBase

  try {
    backUrlBase = new URL(appUrl).toString()
  } catch {
    return res.status(500).json({
      error: 'A URL base da aplicação está inválida.',
    })
  }

  const preferencePayload = {
    items: [
      {
        title: TITULO_PLANO_PRO,
        unit_price: PRECO_PLANO_PRO,
        quantity: 1,
        currency_id: 'BRL',
      },
    ],
    payer: {
      email,
    },
    external_reference: userId,
    metadata: {
      user_id: userId,
      email,
    },
    back_urls: {
      success: montarUrlApp(backUrlBase, '/'),
      failure: montarUrlApp(backUrlBase, '/'),
      pending: montarUrlApp(backUrlBase, '/'),
    },
    notification_url: montarUrlApp(
      backUrlBase,
      '/api/mercadopago-webhook',
    ),
  }

  try {
    const respostaMercadoPago = await fetch(URL_CRIAR_PREFERENCIA, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(preferencePayload),
    })

    const dadosMercadoPago = await respostaMercadoPago
      .json()
      .catch(() => null)

    if (!respostaMercadoPago.ok) {
      console.error(
        'Erro ao criar preferência no Mercado Pago.',
        dadosMercadoPago,
      )

      return res.status(502).json({
        error: 'Não foi possível iniciar o checkout no momento.',
      })
    }

    if (!dadosMercadoPago?.init_point) {
      console.error(
        'Resposta do Mercado Pago sem init_point.',
        dadosMercadoPago,
      )

      return res.status(502).json({
        error: 'Não foi possível gerar o link de pagamento.',
      })
    }

    return res.status(200).json({
      init_point: dadosMercadoPago.init_point,
    })
  } catch (error) {
    console.error('Falha inesperada ao criar preferência.', error)

    return res.status(500).json({
      error: 'Não foi possível iniciar o checkout no momento.',
    })
  }
}
