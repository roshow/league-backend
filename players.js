
/*jshint esnext: true */
import leagueLogic from './leagueLogic';
import leagueDb from './db';
import { Player } from './dbModels';

let PLAYER_STR = 'Player';

// function setPilotScores  (player) {
// 	leagueDb.find('List', {
// 		list_id: { $in: player.lists } 
// 	}).then(function () {

// 	});
// }

function getLists(playername) {
	return leagueDb
		.getOne(PLAYER_STR, { name: playername })
		.then(function (player) {
			return leagueDb.find('List', {
				list_id: { $in: player.lists } 
			});
		}, console.log);
}

export default  { getLists };