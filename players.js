
import leagueLogic from './leagueLogic';
import leagueDb from './db';
import { Player } from './dbModels';
import constants from './constants';

function getPlayer(playername) {
	return leagueDb
		.getOne(constants.PLAYER_STR, { name: playername })
		.then( player => {
			const seasons = Object.keys(player.seasons).sort();
			let promises = [];
			for (let i = seasons.length; i--;) {
				let season = seasons[i];
				promises.push( leagueDb.find( constants.MATCH_STR, {
					"players.name": playername,
					"season": season,
				}, {
					sort: {
						week: 1
					}
				}).then( matches => {
					player.seasons[season].matches = matches;
					return player;
				}));
			}
			return Promise.all(promises).then( () =>  player);
		}, console.log);
}

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

export default  { 
	getPlayer,
	getLists,
	getPlayerMatches,
	uploadPlayers
};