/**
 * Created by hautruong on 7/16/18.
 */
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const albumSchema = new Schema({
  id: { type: String, unique: true },
  name: String,
  link: String,
  title: String,
  is_offical: Boolean,
  artists_names: String,
  thumbnail: String,
  thumbnail_medium: String,
});

module.exports = mongoose.model('albumSchema', albumSchema);