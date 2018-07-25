const {request} = require('../../../utils');
const Scraper = require('../../../lib/PageScraper');
const co = require('co');

function getAlbums(req, res, next) {
  const {genre, id, page} = req.query;
  let uri = 'http://mp3.zing.vn/the-loai-album.html';
  let parseType = 'default';
  if (typeof id !== 'undefined' && typeof genre !== 'undefined') {
    parseType = 'type-detail';
    uri = `http://mp3.zing.vn/the-loai-album/${genre}/${id}.html?&page=${page}`;
  }

  request(uri)
    .then(html => {
      let result = {};
      if (parseType === 'default') {
        result = parserDefaultAlbums(html);
      }
      else if (parseType === 'type-detail') {
        result = parserAlbumsDetail(html, id);
      }

      res.json(result);
    })
    .catch(err => next(err));
}

function parserDefaultAlbums(html) {
  const parser = new Scraper(html);
  const result =
    parser
      .list('.zcontent .title-section')
      .setKey('origin')
      .extractAttrs(['text', 'href'], 'a', ['title', 'id'])
      .get();
  // result.origins is now available
  // minimize html
  html = parser.$('.zcontent').html();

  result.origins = result.origins.map((origin, index) => {
    const innerParser = new Scraper(html);
    // rewrite the parser elements
    innerParser.elements = parser.list('.row.fn-list').elements.eq(index).find('.album-item.fn-item');
    innerParser
      .setKey('album') // the key will be albums
      .extractAttr('src', 'img', 'cover')
      .extractAttrs(['text', 'href', 'href'], '.title-item a', ['title', 'id', 'alias'])
      .artist('.fn-artist a');

    return Object.assign(origin, innerParser.get());
  });

  return (Object.assign({result: true}, result));
}

function parserAlbumsDetail(html, id) {
  const parser = new Scraper(html);
  parser
    .list('.row.fn-list .album-item')
    .setKey('album')
    .extractAttr('src', 'img', 'cover')
    .extractAttrs(['text', 'href', 'href'], '.fn-name.fn-link', ['title', 'id', 'alias'])
    .artist('.txt-info.fn-artist a')
    .paginate();

  let _parserResult = parser.get();
  let result = {
    result: true,
    origins: [_parserResult],
  }
  // return (Object.assign({result: true}, result));
  return (result);
};

function getAlbumPlaylist(req, res, next) {
  const {title, id} = req.query;
  console.log(req.query);
  co(function*() {
    console.log(`http://mp3.zing.vn/album/${title}/${id}.html`);
    const html = yield request(`http://mp3.zing.vn/album/${title}/${id}.html`);
    const regex = /media\/get-source\?type=album&key=.{33}/; // get the resouce url
    const match = html.match(regex);
    if (!match) throw new Error("can't find the resource URL");
    const [playlistUrl] = match;
    const parser = new Scraper(html);

    return yield Promise.all([
      request(`https://mp3.zing.vn/xhr/${playlistUrl}`),
      promiseParsing(parser),
    ]);
  })
    .then(([playlistRawText, result]) => {
      result.songs = JSON.parse(playlistRawText).data.items;
      res.json(result);
    })
    .catch(err => next(err));
};

const promiseParsing = (parser) => {
  return new Promise(resolve => {
    parser
      .extract('src', '.info-top-play img', 'album_playlist_thumb')
      .extract('text', '.ctn-inside > h1', 'album_title')
      .extract('text', '.info-song-top .inline', 'release_year')
      .extract('text', '.info-artist > h2 > a', 'artist')
      .extract('src', '.box-artist img', 'artist_thumb')
      .extract('text', '.artist-info-text > p', 'artist_info')
      .list('.playlist .fn-song')
      .setKey('song')
      .extractAttrs(['href', 'href', 'text'], '.item-song h3 .fn-name', ['id', 'alias', 'title'])
      .artist('.item-song .fn-artist a');
    const result = parser.get();
    result.genres = [];
    parser
      .$('.info-song-top').find('a')
    // prepend album artist to the result
      .each((index, a) => result.genres.push(parser.$(a).text()));
    resolve(result);
  });
};

module.exports = {
  getAlbums,
  getAlbumPlaylist
};

