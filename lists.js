
/*jshint esnext: true */
import leagueDb from './db';
import { List } from './dbModels';

function getLists (lists=[]) {
	return leagueDb.find('List', {
		list_id: { $in: lists } 
	});
}