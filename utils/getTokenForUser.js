const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = function (user) {
  return jwt.sign({data: user}, process.env.JWT_SECRET, {
    expiresIn: 604800 // 1 week
  });
};