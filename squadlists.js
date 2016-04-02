/*jshint esnext: true */
import { readFileSync } from 'fs';
import mongoose from 'mongoose';
import schemas from './schemas';
import { normalizeAndValidateList } from './leagueLogic';
import leagueDb from './db';
let PlayerModel = mongoose.model('Player', schemas.player);

function validateAndSaveList(list) {
	let ListModel = mongoose.model('List', schemas.list);
	let PlayerModel = mongoose.model('Player', schemas.player);
	let player = new PlayerModel();

	player.name = list.name.slice(0,list.name.length - 1);

	// return new Promise(function (resolve, reject) {
	// 	PlayerModel
	// 		.findOne({
	// 			name: player.name
	// 		}, function (err, savedplayer) {

	return leagueDb.getOne('Player', { name: player.name }).then(function (savedplayer) {

		let modelDBMethod = `save`;
		if (savedplayer) {
			modelDBMethod = `update`;
			player = savedplayer;
		}

		let normalData = normalizeAndValidateList(list, player);
		if (!normalData.error) {

			player.lists[list.name] = list.list_id;
			// let playerPromise = new Promise(function(resolve, reject) { 
			// 	PlayerModel.findOneAndUpdate({ _id: player._id}, player, { upsert: true }, function (err) {
			// 		console.log(`${player.name} ${modelDBMethod}d?`);
			// 		resolve();
			// 	});
			// });

			let playerPromise = leagueDb.upsertOne('Player', { _id: player._id}, player).then(function () {
				console.log(`${player.name} ${modelDBMethod}d?`);
				return;
			});

			// let listPromise = new Promise(function (resolve, reject) {
			// 	let listModel = new ListModel(list);
			// 	listModel.name = list.list_id;
			// 	ListModel.findOneAndUpdate({ list_id: listModel.list_id}, listModel, { upsert: true }, function (err) {
			// 		console.log(`list saved?`);
			// 		resolve();
			// 	});
			// });

			let listModel = new ListModel(list);
			listModel.name = list.list_id;
			let listPromise = leagueDb.upsertOne('List', { list_id: listModel.list_id}, listModel).then(function () {
					console.log(`list saved?`);
					return;
				});

			let allPromises = Promise.all([playerPromise, listPromise]);
			
			// resolve(allPromises);
			return allPromises;
		
		}
		else {
			console.log('error with list: ');
			console.log(normalData.message);
			// resolve(normalData);
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

// let newList = JSON.parse(readFileSync(process.argv[2] || `json/rolandogarcia1.json`, 'utf8'));
// connectAndUploadOne(newList);

export default { uploadLFromFiles };





