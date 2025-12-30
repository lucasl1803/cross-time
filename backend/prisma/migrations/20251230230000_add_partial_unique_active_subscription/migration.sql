CREATE UNIQUE INDEX IF NOT EXISTS uq_assinatura_ativa
ON assinaturas(usuario_id)
WHERE status = 'ATIVA';
