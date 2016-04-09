
/*jshint esnext: true */
import leagueLogic from './leagueLogic';
import leagueDb from './db';
import { Player } from './dbModels';

let PLAYER_STR = 'Player',
		LIST_STR = 'List',
		MATCH_STR = 'Match';

// function setPilotScores  (player) {
// 	leagueDb.find('List', {
// 		list_id: { $in: player.lists } 
// 	}).then(function () {

// 	});
// }

function getPlayerMatches(playername) {
	return leagueDb
		.find(MATCH_STR, {
			"players.name": playername
		})
		.then(function (matches) {
			console.log(matches);
			return matches;
		}, console.log);
}

function getLists(playername) {
	return leagueDb
		.getOne(PLAYER_STR, { name: playername })
		.then(function (player) {
			return leagueDb.find('List', {
				list_id: { $in: player.lists } 
			});
		}, console.log);
}

export default  { getLists, getPlayerMatches };