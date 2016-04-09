
/*jshint esnext: true */
import { readFileSync } from 'fs';
import leagueLogic from './leagueLogic';
import leagueDb from './db';
import dbModels from './dbModels';

let matches = JSON.parse(readFileSync('json/matches/ultima1.json'));

function validateAndScoreMatch (match) {
	
	match.match_id = `${match.division}-${match.week}-${match.game}`;
	let players = match.players;
	let points = leagueLogic.calculateLeaguePoints(players, match.played);
	players[0].lp = points[0].lp;
	players[1].lp = points[1].lp;
	players[0].mov = points[0].mov;
	players[1].mov = points[1].mov;
	match.played = (players[0].lp > 0);
	
	return match;

}

function _addListIds ({ players, week, match_id, division }) {

	let promises = [];
	players.forEach(function (player) {
		let name = player.name;
		promises.push(
			leagueDb.getOne('Player', { name: name }).then(function (savedPlayer) {
				if (!savedPlayer) {
					return Promise.reject(`No player with the name: ${name}`);
				}
				let weekIndex = week - 1;
				player.list_id = savedPlayer.lists[weekIndex];
				savedPlayer.matches[weekIndex] = match_id;
				return savedPlayer.update({
					division: division,
					matches: savedPlayer.matches
				});
			}, console.log));
	});

	return Promise.all(promises);
	
}

function uploadMatch (match=matches[1]) {
	match = validateAndScoreMatch(match);
	return _addListIds(match).then(function () {
		return leagueDb.upsertOne('Match', { match_id: match.match_id }, match).then(function () {
			console.log(`matched saved or updated in theory`);
			return;	
		});
	}, function (err) {
		console.log(match.match_id, err);
		return;
	});
}

function uploadMatches (matches) {
 	var promises = [];
 	for (let match of matches) {
 		promises.push(uploadMatch(match));
 	}
 	return Promise.all(promises);
}

function uploadMatchesFromFile(file) {
	return uploadMatches(JSON.parse(readFileSync(file)));
}

// leagueDb.connect().then(function () {
// 	let match = matches[1];
// 	addListIds(match.players, match.week).then(function () {
// 		uploadMatch(match).then(function () {
// 			console.log(`matched saved or updated in theory`);
// 			leagueDb.disconnect();
// 		});
// 	});
// });

export default { uploadMatch, uploadMatches, uploadMatchesFromFile };


