

const debug = require('debug')('&:JWT:');
const jwt = require('jsonwebtoken');
const usersjwtsecret = 'secretooaosadjfjadsfojasdofiasd';

const _username = 'cc';
const _password = '2025'


async function login(req, res, next) {
  try {
    const { username, password } = req.body;
    // await services.checkPasswordUser(username, password);
    if (username !== _username || password !== _password) {
      res.status(401).redirect('/login');
      throw new Error('Invalid username or password');
    }
    const accessToken = jwt.sign({ username }, usersjwtsecret, { expiresIn: '3d' });

    res.clearCookie('access-token');
    if (process.env.NODE_ENV === 'production') {
      res.cookie('access-token', accessToken, { httpOnly: true, sameSite: 'strict', secure: true });
    } else {
      res.cookie('access-token', accessToken, { httpOnly: true, sameSite: 'lax', secure: false });
    }
    res.status(200).redirect('/inicio');
  } catch (error) {
    next(error);
  }
};

async function isUserAuthenticated(req, res, next) {
  try {
    const accessToken = req.cookies['access-token'];
    if (!accessToken) { throw new Error('You need to login'); }

    const { username } = jwt.verify(accessToken, usersjwtsecret);
    if (!username) { throw new Error('You need to login'); }
    next();
  } catch (error) {
    if (req.method === 'GET') {
      return res.redirect('/login');
    } else {
      res.clearCookie('access-token');
      return res.status(401).send('You need to login');
    }
  }
};


module.exports = {
  login,
  isUserAuthenticated
};
