/**
 * Created by hautruong on 7/16/18.
 */
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const artistSchema = new Schema({
  id: { type: String, unique: true },
  name: String,
  avatar: String,
  cover: String,
  link: String,
  thumb: String,
  genre_id: String,
  genre_text: String,
});

module.exports = mongoose.model('artistModel', artistSchema);