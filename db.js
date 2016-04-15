
import mongoose from 'mongoose';
import dbModels from './dbModels';

function getOne (modelName, query) {
	return new Promise(function (resolve, reject) {
		mongoose.model(modelName).findOne(query, function (err, doc) {
			if (err) { reject(err); }
			else { resolve(new dbModels[modelName](doc)); }
		});
	});
}

function find (modelName, query, options={}) {
	return new Promise(function (resolve, reject) {
		mongoose.model(modelName).find(query, null, options, function (err, docs) {
			if (err) { reject(err); }
			else { resolve(docs); }
		});
	});
}

function upsertOne(modelName, query, newModel) {
	return new Promise(function (resolve, reject) {
		mongoose.model(modelName).findOneAndUpdate(query, newModel, { upsert: true }, function (err) {
			if (err) { reject(err); }
			else { resolve(); }
		});
	});
}

function remove(modelName, query) {
	return new Promise(function (resolve, reject) {
		mongoose.model(modelName).remove(query, function (err) {
			if (err) { reject(err); }
			else { resolve(); }
		});
	});
}

let mongoInstances = {
	production: `@ds011890.mlab.com:11890/nycxwing`,
	staging: `@ds011830.mlab.com:11830/xwingstaging`
};


function connect () {
	
	// let u = `cornholio`;
	// let p = `buttholesurfers`;

	let u = process.env.DB_U;
	let p = process.env.DB_P;

	let dbInfo = `mongodb://${u}:${p}${mongoInstances.staging}`;
	mongoose.connect(dbInfo);
	let db = mongoose.connection;
	return new Promise(function (resolve, reject) {
		db.once('open', function (err) {
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


export default { connect, disconnect, getOne, upsertOne, connectDoSomethingThenDisconnect, find, remove };
