const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';

exports.authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token tidak ditemukan.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded; // menyimpan email, id, dll di sini
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Token tidak valid.' });
  }
};
