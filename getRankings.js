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

function _compareRankings(a,b) {
  if (a.lp > b.lp)
    return -1;
  else if (a.lp < b.lp)
    return 1;
  else if (a.mov > b.mov)
    return -1;
  else if (a.mov < b.mov)
    return 1;
  else 
    return 0;
}


function getDivisionRankings (division) {
	var promises = [];
	promises.push(_getDivisionPlayers(division));
	promises.push(_getDivisionMatches(division));
	// promises.push(leagueDb.remove(SCOREDPLAYER_STR, {}));
	return Promise.all(promises).then(function ([scoredPlayers, matches]) {
		// console.log(scoredPlayers, matches);
		for (let match of matches) {
			for (let player of match.players) {
				let scoredPlayer = scoredPlayers[player.name];
				scoredPlayer.lp = scoredPlayer.lp + player.lp;
				scoredPlayer.mov = scoredPlayer.mov + player.mov;
				scoredPlayer.games_played = scoredPlayer.games_played + 1;
			}
		}
		let scoredPlayersArr = Object.keys(scoredPlayers).map((k) => scoredPlayers[k]).sort(_compareRankings);
		console.log(scoredPlayersArr.map(p => ({ name: p.name, mov: p.mov })));
		return scoredPlayersArr;
	}, console.log);
}
export default { getDivisionRankings };