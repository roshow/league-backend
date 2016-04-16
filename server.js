
import express from 'express';
import bodyParser from 'body-parser';
import leagueData from './main';
import cors from 'cors';

let app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

let port = process.env.PORT || 9000;
var router = express.Router();

function _runLeagueScript (req, res, script, ...args) {
	return leagueData.runScript(script, args).then(function (data) {
		res.json(data);
	});
}

router.get('/', function(req, res) {
    res.json({ message: 'wrong' });   
});

// DIVISION routes
router.get('/division/:divisionName/rankings', function (req, res) {
	_runLeagueScript(req, res, 'getDivisionRankings', req.params.divisionName);
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



app.use('/api', router);
app.listen(port);
console.log('Server listening on port ' + port);