const co = require('co');
const {request, isEmpty} = require('../../../utils');
const lrcParser = require('lrc-parser');

function getSong(req, res, next) {
  const {name, id} = req.query;
  const songModel = require('../../../models/songModel');


  let uri = `https://mp3.zing.vn/bai-hat/${name}/${id}.html`;
  co(function*() {
    // let objSong = yield songModel.findOne({id});
    let objSong = null;
    if (typeof objSong === 'undefined' || null === objSong) {
      return yield crawlSongFromZing({name, id});
    } else {
      return objSong;
    }
  })
    .then(data => {
      res.json(data)
    })
    .catch(err => {
      console.log(err);
      next(err)
    });
};

function* crawlSongFromZing({name, id}) {
  // const {request} = require('../../../utils');

  let uri = `https://mp3.zing.vn/bai-hat/${name}/${id}.html`;
  console.log(uri);
  const html = yield request(uri);
  const regexAudio = /media\/get-source\?type=audio&key=.{33}/; // get the resouce url
  const regexVideo = /media\/get-source\?type=video&key=.{33}/; // get the resouce url
  let match = html.match(regexAudio);
  if (!match) {
    match = html.match(regexVideo);
  }

  if (!match) throw new Error("can't find the resource URL");

  const [matchUrl] = match;
  let xhrUrl = `https://mp3.zing.vn/xhr/${matchUrl}`;
  console.log(xhrUrl);
  const resource = yield request(xhrUrl);
  const data = JSON.parse(resource).data;
  // data.lyric now is a url
  if (!data.lyric.trim()) {
    data.lyric = []; // rewrite the {string} url to an array
  } else {
    const lrcFile = yield request(data.lyric);
    data.lyric = lrcParser(lrcFile).scripts;
  }
  yield save(data);
  return data;
}

function* save(data) {
  const songModel = require('../../../models/songModel');

  let {
    id,
    name,
    title,
    code,
    content_owner,
    is_offical,
    playlist_id,
    artists,
    artists_names,
    performer,
    type,
    link,
    lyric,
    thumbnail,
    duration,
    source,
    album,
    artist,
    ads,
    is_vip
  } = data;

  let existSong = false;
  songModel.findOne({id}, function (err, obj) {
    if (typeof obj === 'undefined' || null === obj) {
      existSong = false;
    } else {
      existSong = !isEmpty(obj);
    }
    console.log(existSong);
    if (!existSong) {
      const _song = new songModel({
        id,
        name,
        title,
        code,
        content_owner,
        is_offical,
        playlist_id,
        artists,
        artists_names,
        performer,
        type,
        link,
        lyric,
        thumbnail,
        duration,
        source,
        album,
        artist,
        ads,
        is_vip
      });
      _song.save();

      data['save'] = true;
      console.log('save success');
    } else {
      console.log('nothing save');
    }
  });
}

module.exports = {
  getSong,
};