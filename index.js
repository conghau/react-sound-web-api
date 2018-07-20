/**
 * Created by hautruong on 7/5/18.
 */

const http = require('http');
const debug = require('debug');
const info = debug('server:app:info');
const error = debug('server:app:error');
const database = require('./lib/Database');
const express = require('express');

const App = require('./app');

App.disable('x-powered-by');

database
  .init()
  .then(() => console.log('connected to database1'))
  .catch(err => {
    console.log('connect fail');
    error(err)
  });

let port = 3000;
// let port = (process.env.NODE_ENV === 'production') ? 3000 : 5000;
port = (App.get('env') === 'development' ) ? 5000 : 3000;
App.listen(port, () => {
  console.log('Example app listening on port: ' + port)
});
