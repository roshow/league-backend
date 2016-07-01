
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

function _getDivisionMatches (division, season) {
	// eventually add season
	return leagueDb.find(constants.MATCH_STR, {
		division,
		season,
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


function getDivisionRankings (division, season) {
	return _getDivisionMatches(division, season).then(function (matches) {
		let scoredPlayers = {};
		for (let match of matches) {			
			// if (match.played) {
				console.log('match played');
				for (let player of match.players) {
					let scoredPlayer;
					if (!scoredPlayers[player.name]) {
						scoredPlayers[player.name] = {
							name: player.name,
							lp: 0,
							mov: 0,
							games_played: 0,
						};
					}
					scoredPlayer = scoredPlayers[player.name];
					scoredPlayer.lp = scoredPlayer.lp + player.lp;
					scoredPlayer.mov = scoredPlayer.mov + player.mov;
					scoredPlayer.games_played = scoredPlayer.games_played + (match.played? 1 : 0);
				}
			// }
		}
		let scoredPlayersArr = Object.keys(scoredPlayers).map((k) => scoredPlayers[k]).sort(_compareRankings);
		// let printArr = scoredPlayersArr;
		// printArr = scoredPlayersArr.map(p => ({ name: p.name, mov: p.mov }));
		// printArr = JSON.stringify(scoredPlayersArr);
		// console.log(printArr);
		// console.log('scoredPlayersArr: ', scoredPlayersArr);
		return scoredPlayersArr;
	}, console.log);
}
export default { getDivisionRankings };