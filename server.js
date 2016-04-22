
import express from 'express';
import bodyParser from 'body-parser';
import leagueData from './main';
import cors from 'cors';
import NodeCache from 'node-cache';

let serverCache = new NodeCache();

let app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

let port = process.env.PORT || 9000;
var router = express.Router();

function _runLeagueScript (req, res, script, ...args) {
	return leagueData.runScript(script, args).then(function (data) {
		res.json(data);
		return data;
	});
}

router.get('/', function(req, res) {
    res.json({ message: 'i am real' });   
});

// DIVISION routes
// Division Names: ultima, argent
router.get('/division/:divisionName/rankings', function (req, res) {
	let divname = req.params.divisionName;
	let cachename = `${divname}.rankings`;
	let rankings = serverCache.get(cachename);
	if (rankings) {
		console.log('using cached rankings');
		res.json(rankings);
	}
	else {
		console.log('getting rankings');
		_runLeagueScript(req, res, 'getDivisionRankings', divname).then(function (data) {
			serverCache.set(cachename, data, 60);
		});
	}
});

// PLAYER routes
router.get('/players/:playerName', function (req, res) {
	_runLeagueScript(req, res, 'getPlayer', req.params.playerName);
});

router.get('/players/:playerName/matches', function (req, res) {
	_runLeagueScript(req, res, 'getPlayerMatches', [req.params.playerName]).then(function (data) {
		res.json(data);
	});
});

// LIST routes
router.get('/lists/:listId', function (req, res) {
	_runLeagueScript(req, res, 'getList', req.params.listId);
});

// DIVISION routes
router.get('/division/:division/matches/:week', function (req, res) {
	_runLeagueScript(req, res, 'getMatchesByWeek', req.params.division, req.params.week);
});



app.use('/api', router);
app.listen(port);
console.log('Server listening on port ' + port);