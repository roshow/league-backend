/*jshint esnext: true */
import mongoose from 'mongoose';

let Schema = mongoose.Schema;

let match_player = Schema({
	name: String,
	list_id: String,
	destroyed: {
		type: Number,
		default: 0
	},
	lp: {
		type: Number,
		default: 0
	},
	mov: {
		type: Number,
		default: 0
	}
});

let match = Schema({
	week: Number,
	game: Number,
	division: String,
	match_id: String,
	played: {
		type: Boolean,
		Default: false
	},
	players: [match_player]
});

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
	division: String,
	lists: {
		type: Schema.Types.Mixed,
		default: []
	},
	matches: {
		type: Schema.Types.Mixed,
		default: []
	},
	pilots_used: {
		type: Schema.Types.Mixed,
		default: {}
	}
});

let schemas = { player, list, match };

let List = mongoose.model('List', schemas.list);
let Player = mongoose.model('Player', schemas.player);
let Match = mongoose.model('Match', schemas.match);

export default { List, Player, Match };