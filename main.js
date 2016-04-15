/*jshint esnext: true */
import leagueDb from './db';
import squadLists from './squadLists';
import players from './players';
import matches from './matches';
import rankings from './getRankings';

function nothingToDo () {
	return new Promise(function (resolve) {
		console.log('do something will ya?');
		resolve();
	});
}

function uploadLists () {
	return squadLists.uploadFromFiles(Array.from(arguments));
}

function uploadMatchesFile (filename=`json/matches/ultima1.json`) {
	return matches.uploadMatchesFromFile(filename);
}

function getPlayerMatches (playername=`rolandogarcia`) {
	return players.getPlayerMatches(playername).then(function (matches) {
		for (let match of matches) {
			console.log(match.toJSON());
		}
		return matches;
	});
}

function getDivisionRankings (division=`ultima`) {
	return rankings.getDivisionRankings(division);
}

let fUNctions = { nothingToDo, uploadLists, getPlayerMatches, uploadMatchesFile,  getDivisionRankings };


function runScript (script=`nothingToDo`, args=[]) {
	return leagueDb.connect().then(function () {
		return fUNctions[script](...args).then(function (response) {
			leagueDb.disconnect();
			return response;
		});
	}, console.log);
}


// let script = process.argv[2] || `nothingToDo`;
// let args = process.argv.slice(3);

runScript(process.argv[2], process.argv.slice(3)).then(function (res) {
	console.log(`printing script results: \n`, res);
});

export default fUNctions;