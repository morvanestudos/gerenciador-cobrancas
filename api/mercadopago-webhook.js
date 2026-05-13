import { createClient } from '@supabase/supabase-js'

const URL_BASE_PAGAMENTOS = 'https://api.mercadopago.com/v1/payments'

function responderOk(res, body = {}) {
  return res.status(200).json(body)
}

function normalizarValor(valor) {
  if (Array.isArray(valor)) {
    return normalizarValor(valor[0])
  }

  if (valor === null || valor === undefined) {
    return ''
  }

  return String(valor).trim()
}

function normalizarBody(body) {
  if (!body) {
    return {}
  }

  if (typeof body === 'object') {
    return body
  }

  if (typeof body !== 'string') {
    return {}
  }

  const bodyLimpo = body.trim()

  if (!bodyLimpo) {
    return {}
  }

  try {
    return JSON.parse(bodyLimpo)
  } catch {
    return Object.fromEntries(new URLSearchParams(bodyLimpo))
  }
}

function extrairPaymentId(body, query) {
  return (
    normalizarValor(body?.data?.id) ||
    normalizarValor(body?.id) ||
    normalizarValor(body?.['data.id']) ||
    normalizarValor(query?.['data.id']) ||
    normalizarValor(query?.id)
  )
}

function criarSupabaseAdmin() {
  const supabaseUrl = process.env.SUPABASE_URL?.trim()
  const supabaseServiceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return null
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export default async function handler(req, res) {
  console.log('Mercado Pago webhook recebido.', {
    method: req.method,
    query: req.query,
    body: req.body,
  })

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({
      message: 'Método não permitido.',
    })
  }

  const body = normalizarBody(req.body)
  const paymentId = extrairPaymentId(body, req.query)

  console.log('paymentId extraído do webhook.', {
    paymentId,
  })

  if (!paymentId) {
    return responderOk(res, {
      message: 'sem payment id',
    })
  }

  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN?.trim()

  if (!accessToken) {
    console.log('MERCADO_PAGO_ACCESS_TOKEN não configurado.')

    return responderOk(res, {
      message: 'token ausente',
    })
  }

  let payment

  try {
    const respostaPagamento = await fetch(
      `${URL_BASE_PAGAMENTOS}/${encodeURIComponent(paymentId)}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    )

    const dadosPagamento = await respostaPagamento.json().catch(() => null)

    console.log('Resposta da consulta de pagamento.', {
      paymentId,
      httpStatus: respostaPagamento.status,
      paymentStatus: dadosPagamento?.status ?? null,
      externalReference: dadosPagamento?.external_reference ?? null,
      metadataUserId: dadosPagamento?.metadata?.user_id ?? null,
    })

    if (!respostaPagamento.ok || !dadosPagamento) {
      console.log('Não foi possível consultar o pagamento no Mercado Pago.', {
        paymentId,
        httpStatus: respostaPagamento.status,
        response: dadosPagamento,
      })

      return responderOk(res, {
        message: 'falha ao consultar pagamento',
      })
    }

    payment = dadosPagamento
  } catch (error) {
    console.log('Erro inesperado ao consultar pagamento no Mercado Pago.', {
      paymentId,
      error,
    })

    return responderOk(res, {
      message: 'erro ao consultar pagamento',
    })
  }

  const statusPagamento = normalizarValor(payment?.status)

  console.log('Status do pagamento processado.', {
    paymentId,
    status: statusPagamento,
  })

  if (statusPagamento !== 'approved') {
    return responderOk(res, {
      message: 'pagamento não aprovado',
      status: statusPagamento || 'desconhecido',
    })
  }

  const userId =
    normalizarValor(payment?.external_reference) ||
    normalizarValor(payment?.metadata?.user_id)

  console.log('user_id identificado no pagamento.', {
    paymentId,
    user_id: userId,
  })

  if (!userId) {
    console.log('Webhook sem user_id.', {
      paymentId,
      external_reference: payment?.external_reference ?? null,
      metadata: payment?.metadata ?? null,
    })

    return responderOk(res, {
      message: 'sem user_id',
    })
  }

  const supabase = criarSupabaseAdmin()

  if (!supabase) {
    console.log('SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não configurados.')

    return responderOk(res, {
      message: 'supabase não configurado',
    })
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        plano: 'pro',
      })
      .eq('id', userId)
      .select('id, plano')
      .maybeSingle()

    console.log('Resultado do update no Supabase.', {
      paymentId,
      status: statusPagamento,
      user_id: userId,
      data,
      error,
    })
  } catch (error) {
    console.log('Erro inesperado ao atualizar profiles.plano.', {
      paymentId,
      status: statusPagamento,
      user_id: userId,
      error,
    })
  }

  return responderOk(res, {
    message: 'ok',
  })
}
