/*jshint esnext: true */
import mongoose from 'mongoose';
import schemas from './schemas';
import dbModels from './dbModels';

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

let mongoInstances = {
	production: `@ds011890.mlab.com:11890/nycxwing`,
	staging: `@ds011830.mlab.com:11830/xwingstaging`
};

function connect () {
	let dbInfo = `mongodb://cornholio:buttholesurfers${mongoInstances.staging}`;
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
