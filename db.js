/*jshint esnext: true */
import mongoose from 'mongoose';
import schemas from './schemas';

let List = mongoose.model('List', schemas.list);
let Player = mongoose.model('Player', schemas.player);


function getOne (modelName, query) {
	return new Promise(function (resolve, reject) {
		mongoose.model(modelName).findOne(query, function (err, doc) {
			if (err) {
				reject(err);
			}
			else {
				resolve(doc);
			}
		});
	});
}

function upsertOne(modelName, query, newModel) {
	return new Promise(function (resolve, reject) {
		mongoose.model(modelName).findOneAndUpdate(query, newModel, { upsert: true }, function (err) {
			if (err) {
				reject(err);
			}
			else {
				resolve();
			}
		});
	});
}

function connect (dbInfo) {
	mongoose.connect(dbInfo);
	let db = mongoose.connection;
	return new Promise(function (resolve, reject) {
		db.once('open', function () {
			console.log('connected');
			resolve();
		});
	});
}

function disconnect () {
	console.log('disconnecting');
	mongoose.disconnect();
}

function connectDoSomethingThenDisconnect (dbInfo, func) {
	connect(dbInfo).then(func).then(disconnect);
}


export default { connect, disconnect, getOne, upsertOne, connectDoSomethingThenDisconnect };
