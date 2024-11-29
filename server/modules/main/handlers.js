const debug = require('debug')('&:MAIN: handlers')
const { get } = require('http');
const path = require('path');




const getReader = async (req, res, next) => {
  try {
    const file = 'inicio.html';
    res.sendFile(file, { root: path.resolve('../client/inicio') }, function (err) {
      if (err) {
        console.log(err);
      }
    });
  } catch (err) {
    console.log(err, 'error');
  }
};

const getLogin = async (req, res, next) => {
  try {
    const file = 'login.html';
    res.sendFile(file, { root: path.resolve('../client/inicio') }, function (err) {
      if (err) {
        console.log(err);
      }
    });
  } catch (err) {
    console.log(err, 'error');
  }
}

module.exports = {
  getReader,
  getLogin,
}