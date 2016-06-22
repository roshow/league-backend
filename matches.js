
import { readFileSync } from 'fs';
import leagueLogic from './leagueLogic';
import leagueDb from './db';
import dbModels from './dbModels';
import constants from './constants';

// let matches = JSON.parse(readFileSync('json/matches/ultima1.json'));

function validateAndScoreMatch (match) {
	match.match_id = `${match.division}-${match.season}-${match.week}-${match.game}`;
	let players = match.players;
	let points = leagueLogic.calculateLeaguePoints(players, match.gamePlayed);
	for (let i = 2; i--;) {
		players[i].lp = points[i].lp;
		players[i].mov = points[i].mov;
	}
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

function getMatchesByPlayer (name) {
	leagueDb.find(constants.MATCH_STR, {
		"players.name": name
	}, {
		sort: {
			week: 1
		}
	});
}

function getMatchesByDivision (division,  week, season=2) {
	let query = {
		division: division,
		season: season,
	};
	if (week) {
		query.week = week;
	}
	return leagueDb.find(constants.MATCH_STR, query, {
		sort: {
			week: 1,
			game: 1,
		}
	});
}

function uploadMatch (match) {
	match = validateAndScoreMatch(match);
	return leagueDb.upsertOne('Match', { match_id: match.match_id }, match).then(function () {
		// console.log(`matched saved or updated in theory`);
		return {
			match: match.match_id,
			update: true
		};
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


export default { 
	uploadMatch,
	uploadMatches,
	uploadMatchesFromFile,
	getMatchesByPlayer,
	getMatchesByDivision,
};


