const jwt = require('jsonwebtoken');

const { JWT_KEY, NODE_ENV } = process.env;


const createToken = (user) => {
  const jwtPayload = { sub: user.id };
  const jwtOptions = { expiresIn: '2d' };
  return jwt.sign(jwtPayload, JWT_KEY, jwtOptions);
};

const configCookie = maxAge => ({
  httpOnly: true,
  secure: NODE_ENV === 'production',
  maxAge,
});

const sendTokenCookie = (user, res) => {
  const token = createToken(user);
  const twoDaysMs = 1000 * 60 * 60 * 24 * 2;
  res.cookie('token', token, configCookie(twoDaysMs));
};

const clearTokenCookie = res => res.clearCookie('token', configCookie(0));

module.exports = { sendTokenCookie, clearTokenCookie };
