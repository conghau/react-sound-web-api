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

App.listen(5000, () => {
  console.log('Example app listening on port 5000!')
});
