const express = require('express');
const songActions = require('./song');
const getSuggestedSongs = require('./suggested_songs');
const getTop100 = require('./top100');
const search = require('./search');
const getDefaultAlbums = require('./default_albums');
const getAlbums = require('./albums');
const albumActions = require('./albums');
// const getDefaultArtists = require('./default_artists');
const artistActions = require('./genreArtists');
const getArtist = require('./artist');
const getChart = require('./chart');
// const cached = require('middlewares/cached');

const router = express.Router();

router.get('/song', songActions.getSong);

router.get('/suggested-song', getSuggestedSongs);

router.get('/top100/:type', getTop100);

router.get('/search', search);

router.get('/album/default', getDefaultAlbums);

router.get('/albums', albumActions.getAlbums);

router.get('/album_playlist', albumActions.getAlbumPlaylist);

// router.get('/artist/default', getDefaultArtists);

router.get('/artist/:name/:type', getArtist);

router.get('/genre-artists', artistActions.getGenreArtist);
router.get('/genre-artists-save', artistActions.saveGenreArtist);

router.get('/genre-artists/:name/:type', artistActions.getGenreArtist);

router.get('/chart/:id', getChart);

module.exports = router;
