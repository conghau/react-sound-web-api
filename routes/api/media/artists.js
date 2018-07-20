const request = require('request-promise');
const {pageQuery} = require('utils');
const Scraper = require('../../../lib/PageScraper');

module.exports = function getAlbums(req, res, next) {
  const {genre, id, page} = req.query;
  let options = {
    uri: `http://mp3.zing.vn/the-loai-nghe-si/${genre}/${id}.html?&page=${page}`,
    headers: {
      'User-Agent': 'Request-Promise'
    },
    gzip: true,
  };

  request(options)
    .then(html => {
      const parser = new Scraper(html);

      parser
        .list('.pone-of-five .item')
        .setKey('artist')
        .extractAttr('src', 'img', 'thumb')
        .extractAttr('text', 'a.txt-primary', 'name')
        .paginate();

      res.json(parser.get());
    })
    .catch(err => next(err));
};

