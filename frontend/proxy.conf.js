const estoqueHost = process.env.ESTOQUE_HOST || 'estoque';
const estoquePort = process.env.ESTOQUE_PORT || '5002';
const faturamentoHost = process.env.FATURAMENTO_HOST || 'faturamento';
const faturamentoPort = process.env.FATURAMENTO_PORT || '5001';

module.exports = {
  '/estoque-api': {
    target: `http://${estoqueHost}:${estoquePort}`,
    secure: false,
    changeOrigin: true,
    logLevel: 'debug',
  },
  '/faturamento-api': {
    target: `http://${faturamentoHost}:${faturamentoPort}`,
    secure: false,
    changeOrigin: true,
    logLevel: 'debug',
  },
};