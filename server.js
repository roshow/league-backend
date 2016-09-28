
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import NodeCache from 'node-cache';
import leagueScripts from './leagueScripts';
import leagueDb from './db';

let serverCache = new NodeCache();

let app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

let port = process.env.PORT || 3001;
var router = express.Router();

function _runLeagueScript (req, res, next, script, ...args) {
  return leagueScripts.justRunScript(script, args).then(function (data) {
    res.json(data);
    next();
    return data;
  });
}

router.get('/', function(req, res) {
    res.json({ message: 'i am real' });   
});

// RANKINGS routes
router.get('/rankings/:division/:season', function (req, res, next) {
  let division = req.params.division;
  let season = req.params.season;
  let cachename = `${division}.rankings`;
  let rankings;//= serverCache.get(cachename);
  if (rankings) {
    res.json(rankings);
    next();
  } 
  else {
    _runLeagueScript(req, res, next, 'getDivisionRankings', division, season).then(function (data) {
      serverCache.set(cachename, data, 60);
    });
  }
});

// PLAYER routes

// GET All Players
router.get('/players', function (req, res, next) {
  _runLeagueScript(req, res, next, 'getPlayer');
});

router.post('/updatematches', function (req, res, next) {
  _runLeagueScript(req, res, next, 'updateMatchesFromSS');
});

// GET Player by name (id)
router.get('/players/:playerName', function (req, res, next) {
  _runLeagueScript(req, res, next, 'getPlayer', req.params.playerName);
});

router.get('/players/:playerName/matches', function (req, res, next) {
  _runLeagueScript(req, res, next, 'getPlayerMatches', [req.params.playerName]).then(function (data) {
    res.json(data);
  });
});

// LIST routes
router.get('/lists/:listId', function (req, res, next) {
  _runLeagueScript(req, res, next, 'getList', req.params.listId);
});

// DIVISION routes
// router.get('/division/:division/season/:season/matches/:week', function (req, res, next) {
//  _runLeagueScript(req, res, next, 'getMatchesByWeek', req.params.division, req.param.season, req.params.week);
// });

/* MATCHES routes */
// GET Matches by Division, Season
router.get('/matches/:division/:season', function (req, res, next) {
  _runLeagueScript(req, res, next, 'getMatchesByDivision', req.params.division, req.params.season, req.params.week);
});
// GET Matches by Division, Season, Week
router.get('/matches/:division/:season/:week', function (req, res, next) {
  _runLeagueScript(req, res, next, 'getMatchesByDivision', req.params.division, req.params.season, req.params.week);
});



app.use('/api', router);
leagueDb.connect().then(function () {
  app.listen(port);
});
console.log('Server listening on port ' + port);