/*jshint esnext: true */
import leagueDb from './db';
import squadLists from './squadLists';
import players from './players';
import matches from './matches';
import rankings from './getRankings';

let script = process.argv[2] || `nothingToDo`;
let args = process.argv.slice(3);

function nothingToDo () {
	return new Promise(function (resolve) {
		console.log('do something will ya?');
		resolve();
	});
}

function uploadLists () {
	return squadLists.uploadFromFiles(args || `json/rolandogarcia1.json`);
}

function uploadMatchesFile () {
	return matches.uploadMatchesFromFile(args[0] || `json/matches/ultima1.json`);
}

function getPlayerMatches () {
	return players.getPlayerMatches(args[0] || `rolandogarcia`).then(function (matches) {
		for (let match of matches) {
			console.log(match.toJSON());
		}
		return matches;
	});
}

function getDivisionRankings () {
	return rankings.getDivisionRankings(args[0] || `ultima`);
}

let fUNctions = { nothingToDo, uploadLists, getPlayerMatches, uploadMatchesFile,  getDivisionRankings };


leagueDb.connect().then(function () {
	var promise;

	promise = fUNctions[script]();

	// switch (process.argv[2]) {

	// 	case "uploadLists":
	// 		promise = squadLists.uploadFromFiles(args || 'json/rolandogarcia1.json');
	// 		break;

	// 	case "getPlayerLists":
	// 		promise = players.getLists(args[0] || "rolandogarcia").then(function (lists) {
	// 			console.log(lists);
	// 			return lists;
	// 		});
	// 		break;

	// 	case "getPlayer"

	// 	case "uploadMatches":
	// 		promise = matches.uploadMatchesFromFile(args[0] || 'json/matches/ultima1.json');
	// 		break;

	// 	default:
	// 		promise = new Promise(function (resolve) {
	// 			console.log('do something will ya?');
	// 			resolve();
	// 		});
	// 		break;
	// }

	promise.then(leagueDb.disconnect);


}, console.log);