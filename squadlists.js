/*jshint esnext: true */
import { readFileSync } from 'fs';
import mongoose from 'mongoose';
import schemas from './schemas';
import { normalizeAndValidateList } from './leagueLogic';
import leagueDb from './db';

function validateAndSaveList(list) {
	let ListModel = mongoose.model('List', schemas.list);
	let PlayerModel = mongoose.model('Player', schemas.player);
	let player = new PlayerModel();

	player.name = list.name.slice(0,list.name.length - 1);

	return leagueDb.getOne('Player', { name: player.name }).then(function (savedplayer) {

		let modelDBMethod = `save`;
		if (savedplayer) {
			modelDBMethod = `update`;
			player = savedplayer;
		}

		let normalData = normalizeAndValidateList(list, player);
		if (!normalData.error) {

			player.lists[list.name] = list.list_id;

			let playerPromise = leagueDb.upsertOne('Player', { _id: player._id}, player).then(function () {
				console.log(`${player.name} ${modelDBMethod}d?`);
				return;
			});

			let listPromise = leagueDb.upsertOne('List', { list_id: list.list_id}, list).then(function () {
					console.log(`list saved?`);
					return;
				});

			return Promise.all([playerPromise, listPromise]);
		
		}
		else {
			console.log('error with list: ');
			console.log(normalData.message);
			return normalData;
		}
	});

}


function uploadLFromFiles (lists) {

	var mongoDb = `mongodb://cornholio:buttholesurfers@ds011890.mlab.com:11890/nycxwing`;
	leagueDb.connect(mongoDb).then(function () {
		
		let promises = [];
		for (let i = lists.length; i--;) {
			let newList = JSON.parse(readFileSync(lists[i]));
			promises.push(validateAndSaveList(newList));
		}

		Promise.all(promises).then(leagueDb.disconnect);

	});
}

export default { uploadLFromFiles };





