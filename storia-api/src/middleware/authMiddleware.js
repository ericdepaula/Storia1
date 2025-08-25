import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  // O formato esperado é "Bearer TOKEN". Nós pegamos apenas a parte do TOKEN.
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    // 401 Unauthorized - O cliente não se identificou.
    return res.status(401).json({ message: 'Acesso negado. Token não fornecido.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      // 403 Forbidden - O cliente se identificou, mas o crachá é inválido/vencido.
      return res.status(403).json({ message: 'Token inválido ou expirado.' });
    }

    req.user = user;
    
    next();
  });
};