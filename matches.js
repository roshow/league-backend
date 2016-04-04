
/*jshint esnext: true */
import { readFileSync } from 'fs';
import schemas from './schemas';
import leagueLogic from './leagueLogic';
import leagueDb from './db';
import dbModels from './dbModels';

let matches = JSON.parse(readFileSync('json/matches/ultima1.json'));

function validateAndScoreMatch (match) {
	
	match.match_id = `${match.division}-${match.week}-${match.game}`;
	let players = match.players;
	let points = leagueLogic.calculateLeaguePoints(players, match.played);
	players[0].lp = points[0];
	players[1].lp = points[1];
	match.played = (players[0].lp > 0);
	
	return match;
}

function addListIds (players, week) {

	let promises = [];
	players.forEach(function (player) {
		let name = player.name;
		promises.push(
			leagueDb.getOne('Player', { name: name }).then(function (savedPlayer) {
				player.list_id =  savedPlayer.lists[`${name}${week}`];
				console.log(player.list_id);
				return player;
			})
		);
	});

	return Promise.all(promises);
	
}

function uploadMatch (match) {
	match = validateAndScoreMatch(match);
	return leagueDb.upsertOne('Match', { match_id: match.match_id }, match);
}

leagueDb.connect().then(function () {
	let match = matches[1];
	addListIds(match.players, match.week).then(function () {
		uploadMatch(match).then(function () {
			console.log(`matched saved or updated in theory`);
			leagueDb.disconnect();
		});
	});
});

