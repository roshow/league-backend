/*jshint esnext: true */
import mongoose from 'mongoose';
import schemas from './schemas';

let List = mongoose.model('List', schemas.list);
let Player = mongoose.model('Player', schemas.player);
let Match = mongoose.model('Match', schemas.match);

export default { List, Player, Match };