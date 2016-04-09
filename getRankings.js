/*jshint esnext: true */
import constants from './constants';
import leagueDb from './db';
import dbModels from './dbModels';

function _getDivisionPlayers (division) {
	return leagueDb.find(constants.PLAYER_STR, {
		division: division
	}).then(function (players) {
		let scoredPlayers = {};
		for (let player of players) {
			scoredPlayers[player.name] = new dbModels.ScoredPlayer(player);
		}
		return scoredPlayers;
	}, console.log);
}

function _getDivisionMatches (division) {
	return leagueDb.find(constants.MATCH_STR, {
		division: division
	});
}

function getDivisionRankings (division) {
	var promises = [];
	promises.push(_getDivisionPlayers(division));
	promises.push(_getDivisionMatches(division));
	return Promise.all(promises).then(function ([players, matches]) {
		console.log(players, matches);
		return;
	}, console.log);
}
export default { getDivisionRankings };