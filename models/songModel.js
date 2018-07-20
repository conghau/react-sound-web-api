/**
 * Created by hautruong on 7/16/18.
 */
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const songSchema = new Schema({
  id: { type: String, unique: true },
  name: String,
  title: String,
  code: String,
  content_owner: String,
  is_offical: Boolean,
  playlist_id: String,
  artists: Object,
  artists_names: String,
  performer: String,
  type: String,
  link: String,
  lyric: Object,
  thumbnail: String,
  duration: String,
  source: Object,
  album: Object,
  artist: Object,
  ads: Boolean,
  is_vip: Boolean,

});

module.exports = mongoose.model('songModel', songSchema);