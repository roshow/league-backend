/*jshint esnext: true */
import { Schema } from 'mongoose';

let pilot = Schema({
	name: String,
	ship: String,
	points: Number,
	upgrades: {
		type: Schema.Types.Mixed,
		default: {}
	}
});

let list = Schema({
	name: String,
	pilots: [ pilot ],
	points: Number,
	list_id: String,
	times_used: Number,
	faction: String,
	version: String,
	description: String
});

let player = Schema({
	name: String,
	time: Number,
	lists: {
		type: Schema.Types.Mixed,
		default: {}
	},
	pilots_used: {
		type: Schema.Types.Mixed,
		default: {}
	}
});

export default { player, list, pilot };