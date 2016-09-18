
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
    players[i] = Object.assign({}, players[i], points[i], {
      list_link: players[i].list_link === 'null' ? '' : players[i].list_link  // "null" is used in spreadsheet for matches where some lists have been submitted but others have not; it should be an empty string, tho
    });
		// players[i].lp = points[i].lp;
		// players[i].mov = points[i].mov;
  //   players[i].win = points[i].win;
		// players[i].list_link = players[i].list_link === 'null' ? '' : players[i].list_link;  // "null" is used in spreadsheet for matches where some lists have been submitted but others have not; it should be an empty string, tho
	}
	if (players[0].mov > players[1].mov) {
		match.winner = players[0].name;
	}
	else if (players[0].mov < players[1].mov) {
		match.winner = players[1].name;
	}
	return match;
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

function getMatchesByDivision (division, season, week) {
	const query = {
		division,
		season,
	};
	if (week) {
		query.week = week;
	}
	return leagueDb.find(constants.MATCH_STR, query, {
		sort: {
			week: 1,
			game: 1,
		}
	}).then( matches => ({
    division,
    week,
    season,
    matches,
    matchListId: `${division}${season}${week || ''}`
  }));
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


