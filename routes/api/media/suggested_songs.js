const request = require('request-promise');

module.exports = function getSuggestedSongs(req, res, next) {
  const {songId, artistId} = req.query;

  let options = {
    uri: `https://mp3.zing.vn/xhr/recommend?target=%23block-recommend&count=20&start=0&artistid=${artistId}&type=audio&id=${songId}`,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36'
    },
    gzip: true,
  };

  request(options)
    .then(body => {
      const data = JSON.parse(body);
      res.json(data);
    })
    .catch(err => next(err));
};
