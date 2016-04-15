/*jshint esnext: true */
import { readFileSync } from 'fs';
import { normalizeAndValidateList } from './leagueLogic';
import leagueDb from './db';
import { Player } from './dbModels';
import crypto from 'crypto';

function makeListId (list) {
		let listIdString = '';
		for (let pilot of list.pilots) {
			listIdString += pilot.name;
			listIdString += Object.keys(pilot.upgrades || {}).reduce(
				(upgradenames, key) => upgradenames.concat(pilot.upgrades[key]), []).sort().join('');
		}
		return crypto.createHash('sha1').update(listIdString, 'utf8').digest('hex');
}

function _validateAndSaveList(list) {
	let player = new Player();
	let listName = list.name.toLowerCase();

	let listRegexMatch = /([a-z]+)([0-9]+)/.exec(listName);
	let weekIndex = parseInt(listRegexMatch[2], 10) - 1;
	list.name = listRegexMatch[0];
	player.name = listRegexMatch[1];

	return leagueDb.getOne('Player', { name: player.name }).then(function (savedplayer) {

		if (savedplayer) {
			player = savedplayer;
		}

		let normalData = normalizeAndValidateList(list, player, weekIndex);
		if (!normalData.error) {

			player.lists[weekIndex] = list.list_id;
			list.name = list.list_id;

			let playerPromise = leagueDb.upsertOne('Player', { _id: player._id}, player).then(function () {
				console.log(`${player.name} upserted?`);
				return;
			});

			let listPromise = leagueDb.upsertOne('List', { list_id: list.list_id}, list).then(function () {
					console.log(`list upserted?`);
					return;
				});

			return Promise.all([playerPromise, listPromise]);
			// return listPromise;
		
		}
		else {
			console.log('error with list: ');
			console.log(normalData.message);
			return normalData;
		}
	}, console.log);

}

function uploadFromFiles (lists=[`json/rolandogarcia1.json`]) {
	let promises = [];
	for (let i = lists.length; i--;) {
		let newList = JSON.parse(readFileSync(lists[i]));
		promises.push(_validateAndSaveList(newList));
	}

	return Promise.all(promises);
}

// function uploadFromFiles (lists) {

// 	leagueDb.connect().then(function () {
		
// 		let promises = [];
// 		for (let i = lists.length; i--;) {
// 			let newList = JSON.parse(readFileSync(lists[i]));
// 			promises.push(_validateAndSaveList(newList));
// 		}

// 		Promise.all(promises).then(leagueDb.disconnect);

// 	}, console.log);
// }


export default { uploadFromFiles };





