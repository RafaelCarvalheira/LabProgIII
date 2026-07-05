const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'rcp-dev-secret-2026';

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ erro: 'Token ausente ou inválido' });
  }
  const token = authHeader.split(' ')[1];
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(403).json({ erro: 'Token expirado ou inválido' });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.papel !== 'admin') {
    return res.status(403).json({ erro: 'Acesso restrito ao administrador' });
  }
  next();
}

module.exports = { requireAuth, requireAdmin, JWT_SECRET };
