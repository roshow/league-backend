/*jshint esnext: true */
import leagueDb from './db';
import squadLists from './squadLists';
import players from './players';
import matches from './matches';

let args = process.argv.slice(3);



leagueDb.connect().then(function () {
	var promise;
	switch (process.argv[2]) {

		case "uploadLists":
			promise = squadLists.uploadFromFiles(args || 'json/rolandogarcia1.json');
			break;

		case "getPlayerLists":
			promise = players.getLists(args[0] || "rolandogarcia").then(function (lists) {
				console.log(lists);
				return lists;
			});
			break;

		case "uploadMatches":
			promise = matches.uploadMatchesFromFile(args[0] || 'json/matches/ultima1.json');
			break;

		default:
			promise = new Promise(function (resolve) {
				console.log('do something will ya?');
				resolve();
			});
			break;
	}

	promise.then(leagueDb.disconnect);


}, console.log);