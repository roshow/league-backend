
import leagueLogic from './leagueLogic';
import leagueDb from './db';
import { Player } from './dbModels';
import constants from './constants';

function getPlayerMatches(playername) {
	return leagueDb
		.find(constants.MATCH_STR, {
			"players.name": playername
		}, {
			sort: {
				week: 1
			}
		})
		.then(function (matches) {
			return matches;
		}, console.log);
}

function getLists(playername) {
	return leagueDb
		.getOne(constants.PLAYER_STR, { name: playername })
		.then(function (player) {
			return leagueDb.find('List', {
				list_id: { $in: player.lists } 
			});
		}, console.log);
}

function upsertPlayersFromJson () {
	let players = JSON.parse(readFileSync('json/players/players.json'));
	let promises = [];

}

function uploadPlayer (player) {
	return leagueDb.upsertOne(constants.PLAYER_STR, { name: player.name }, player).then(function () {
		console.log(`player saved or updated in theory`);
		return;	
	});
}

function uploadPlayers (players) {
 	var promises = [];
 	for (let player of players) {
 		promises.push(uploadPlayer(player));
 	}
 	return Promise.all(promises);
}

export default  { getLists, getPlayerMatches, uploadPlayers };