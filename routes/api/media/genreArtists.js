/**
 * Created by hautruong on 7/8/18.
 */
const PageScraper = require('../../../lib/PageScraper');
const request = require('request-promise');

function getGenreArtist(req, res, next) {
  console.log(req.param);
  const {genre, id, page} = req.query;
  let uri = 'https://mp3.zing.vn/the-loai-nghe-si';
  let parseType = 'default';
  if (typeof id !== 'undefined' && typeof genre !== 'undefined') {
    parseType = 'type-detail';
    uri = `https://mp3.zing.vn/the-loai-nghe-si/${genre}/${id}.html?&page=${page}`;
  }
  console.log(uri);
  let options = {
    uri: uri,
    headers: {
      'User-Agent': 'Request-Promise'
    },
    gzip: true,
  };

  request(options)
    .then(html => {
      let result = {};
      if (parseType === 'default') {
        result = parseDefaultArtists(html);
      }
      else if (parseType === 'type-detail') {
        result = parseGenreArtistByType(html, id);
      }

      res.json(result);
    })
    .catch(err => next(err));
};

function parseGenreArtistByType(html, id) {
  const parser = new PageScraper(html);
  const result =
    parser
      .list('.zcontent')
      .setKey('origin')
      .extractAttrs(['text'], '.title-section', ['title'])
      .get();

  result.origins = result.origins.map((origin, index) => {
    const innerParser = new PageScraper(html);
    innerParser
      .list('.pone-of-five .item')
      .setKey('artist')
      .extractAttr('src', 'img', 'thumb')
      .extractAttr('text', 'a.txt-primary', 'name')
      .paginate();

    return Object.assign(origin, {id: id}, innerParser.get());
  });

  return Object.assign({result: true}, result);
}

function parseDefaultArtists(html) {
  const parser = new PageScraper(html);
  const result =
    parser
      .list('.zcontent .title-section')
      .setKey('origin')
      .extractAttrs(['text', 'href'], 'a', ['title', 'id'])
      .get();

  html = parser.$('.zcontent');
  result.origins = result.origins.map((origin, index) => {
    const innerParser = new PageScraper(html);
    // rewrite the parser elements
    innerParser.elements = parser.list('.row.fn-list').elements.eq(index).find('.artist-item');
    innerParser
      .setKey('artist') // the key will be artists
      .extractAttr('src', 'img', 'thumb')
      .extractAttrs(['href', 'text'], 'a.txt-primary', ['link', 'name']);

    return Object.assign(origin, innerParser.get());
  });

  return Object.assign({result: true}, result);
};

function saveGenreArtist(req, res, next) {
  const {genre, id, page} = req.query;
  let uri = 'https://mp3.zing.vn/the-loai-nghe-si';
  let parseType = 'default';
  if (typeof id !== 'undefined' && typeof genre !== 'undefined') {
    parseType = 'type-detail';
    uri = `https://mp3.zing.vn/the-loai-nghe-si/${genre}/${id}.html?&page=${page}`;
  }
  console.log(uri);
  let options = {
    uri: uri,
    headers: {
      'User-Agent': 'Request-Promise'
    },
    gzip: true,
  };

  request(options)
    .then(html => {
      let result = {};
      if (parseType === 'default') {
        result = parseDefaultArtists(html);

        let origins = result['origins'] || null;
        const artistModel = require('../../../models/artistModel');
        if (Array.isArray(origins)) {
          origins.forEach(genre => {
            let {artists, id, title} = genre;

            if(Array.isArray(artists)) {
              artists.forEach(artist => {
                let {link, name, thumb} = artist || {};
                let _artist = new artistModel({name, link, thumb, genre_id: id, genre_text: title, id: link});
                _artist.save();
              })
            }
          })
        }
      }
      else if (parseType === 'type-detail') {
        result = parseGenreArtistByType(html, id);
      }

      res.json(result);
    })
    .catch(err => next(err));
};

module.exports = {
  getGenreArtist,
  saveGenreArtist
};
