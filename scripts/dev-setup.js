#!/usr/bin/env node
/**
 * Prepara o ambiente de desenvolvimento mobile antes de subir o Expo.
 *
 * Detecta o IP da máquina na rede local e grava em `mobile/.env` a variável
 * EXPO_PUBLIC_API_URL apontando para o backend na porta 3000. Assim o app
 * funciona tanto no emulador quanto em celular físico (Expo Go) sem ajuste
 * manual, desde que o aparelho esteja na mesma rede Wi-Fi.
 *
 * Respeita .env feito à mão: só sobrescreve arquivos gerados por este script
 * (identificados pelo cabeçalho AUTO_MARKER).
 */
const os = require('os');
const fs = require('fs');
const path = require('path');

const API_PORT = 3000;
const ENV_PATH = path.join(__dirname, '..', 'mobile', '.env');
const AUTO_MARKER = '# gerado automaticamente por scripts/dev-setup.js';

function detectLanIp() {
  const interfaces = os.networkInterfaces();
  const candidates = [];

  for (const addrs of Object.values(interfaces)) {
    if (!addrs) continue;
    for (const addr of addrs) {
      const family = typeof addr.family === 'string' ? addr.family : `IPv${addr.family}`;
      if (family !== 'IPv4' || addr.internal) continue;
      candidates.push(addr.address);
    }
  }

  // Prioriza faixas privadas comuns de rede doméstica/escritório.
  const preferred = candidates.find((ip) => /^(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(ip));
  return preferred || candidates[0] || null;
}

function main() {
  const ip = detectLanIp();

  if (!ip) {
    console.warn(
      '[dev-setup] Não foi possível detectar o IP da rede local.\n' +
      '            O app usará o padrão (http://10.0.2.2:3000), que só funciona no emulador Android.\n' +
      '            Para celular físico, edite mobile/.env manualmente com o IP do PC.'
    );
    return;
  }

  // Não sobrescreve um .env feito manualmente pelo usuário.
  if (fs.existsSync(ENV_PATH)) {
    const current = fs.readFileSync(ENV_PATH, 'utf8');
    if (!current.startsWith(AUTO_MARKER)) {
      console.log(`[dev-setup] mobile/.env já existe (configuração manual). Mantendo como está.`);
      return;
    }
  }

  const apiUrl = `http://${ip}:${API_PORT}`;
  const content = `${AUTO_MARKER}\nEXPO_PUBLIC_API_URL=${apiUrl}\n`;
  fs.writeFileSync(ENV_PATH, content);

  console.log(`[dev-setup] mobile/.env configurado: EXPO_PUBLIC_API_URL=${apiUrl}`);
  console.log('[dev-setup] Celular físico: garanta que o aparelho está na mesma rede Wi-Fi do PC.');
}

main();
