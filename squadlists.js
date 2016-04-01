/*jshint esnext: true */
import { readFileSync } from 'fs';
import mongoose from 'mongoose';
import schemas from './schemas';
import { normalizeAndValidateList } from './leagueLogic.js';

function validateAndSaveList(list) {
	let ListModel = mongoose.model('List', schemas.list);
	let PlayerModel = mongoose.model('Player', schemas.player);
	let player = new PlayerModel();

	player.name = list.name.slice(0,list.name.length - 1);

	return new Promise(function (resolve, reject) {
		PlayerModel
			.findOne({
				name: player.name
			}, function (err, savedplayer) {
				let modelDBMethod = `save`;
				if (!err && savedplayer) {
					modelDBMethod = `update`;
					player = savedplayer;
				}

				let normalData = normalizeAndValidateList(list, player);
				if (!normalData.error) {

					player.lists[list.name] = list.list_id;
					let playerPromise = new Promise(function(resolve, reject) { 
						PlayerModel.findOneAndUpdate({ _id: player._id}, player, { upsert: true }, function (err) {
							console.log(`${player.name} ${modelDBMethod}d?`);
							resolve();
						});
					});

					let listPromise = new Promise(function (resolve, reject) {
						let listModel = new ListModel(list);
						listModel.name = list.list_id;
						ListModel.findOneAndUpdate({ list_id: listModel.list_id}, listModel, { upsert: true }, function (err) {
							console.log(`list saved?`);
							resolve();
						});
					});

					resolve(Promise.all([playerPromise, listPromise]));
				
				}
				else {
					console.log('error with list: ');
					console.log(normalData.message);
					resolve(normalData);
				}
			});
	});


}

function connectAndUploadOne (list) {
	mongoose.connect(`mongodb://cornholio:buttholesurfers@ds011890.mlab.com:11890/nycxwing`);
	let db = mongoose.connection;
	db.once('open', function () {

		console.log('connected');
		
		validateAndSaveList(list).then(function () {
			console.log('disconnecting');
			mongoose.disconnect();
		});

	});

}

let newList = JSON.parse(readFileSync(process.argv[2] || `json/rolandogarcia1.json`, 'utf8'));
connectAndUploadOne(newList);





