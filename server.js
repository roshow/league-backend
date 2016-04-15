
import express from 'express';
import bodyParser from 'body-parser';
import leagueData from './main';

let app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

let port = process.env.PORT || 9000;
var router = express.Router();

router.get('/', function(req, res) {
    res.json({ message: 'wrong' });   
});
router.get('/division/:divisionId', function (req, res) {
	let division = req.params.divisionId || `ultima`;
	leagueData.runScript('getDivisionRankings', [division]).then(function (data) {
		res.json(data);
	});
});

app.use('/api', router);
app.listen(port);
console.log('Server listening on port ' + port);