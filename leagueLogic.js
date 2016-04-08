/*jshint esnext: true */
import crypto from 'crypto';
import xwingData from './xwingData';

let checksum = ( string ) => crypto.createHash('sha1').update(string, 'utf8').digest('hex');

const leaguerules = {
	pilotMax: 3,
	listMax: 2
};

function calculateLeaguePoints (players, wasPlayed) {
	
	let [{ destroyed: destroyed1 }, { destroyed: destroyed2 }] = players;
	
	if (!wasPlayed && destroyed1 === 0 && destroyed2 === 0){
		return [0, 0];
	}

	let diff = destroyed1 - destroyed2;
	let absdiff = Math.abs(diff);

	let points = (absdiff >= 12) ? [4, 1] : (absdiff > 0) ? [3, 2] : [2, 2];
	let scores = [{
		lp: points[0],
		mov: (100 + absdiff)
	}, {
		lp: points[1],
		mov: (100 - absdiff)
	}];

	return (diff < 0) ? scores.reverse() : scores;

}

let pilots_nonunique = xwingData.pilots_nonunique;

function normalizeAndValidateList (newList, player, weekIndex) {

	let normalizedData = {
		list: {},
		error: false,
		message: ''
	};

	// let listKeys = Object.keys(player.lists);
	if ( player.lists[weekIndex] ) {
		normalizedData.error = true;
		normalizedData.message = 'list has already been submitted';
		return normalizedData;
	}

	newList.list_id = '';

	// sort newList.pilots in alphabetical order 
	newList.pilots.sort(function (a,b) {
		if (a.name < b.name) {
			return -1;
		}
		else if (a.name > b.name) {
			return 1;
		}
		else  {
			return 0;
		}
	});

	// Construct listIdString and, while you're at it, check that unique pilot has been used less than 3 times and increment 
	let listIdString = '';
	newList.pilots.forEach(function (newPilot) {

		listIdString += newPilot.name;
		
		listIdString += Object.keys(newPilot.upgrades || {}).reduce(
			(upgradenames, key) => upgradenames.concat(newPilot.upgrades[key]), []).sort().join('');

		let name = newPilot.name;
		let usedPilots = player.pilots_used;
		if (!usedPilots[name]) {
			usedPilots[name] = 1;
		}
		else if (pilots_nonunique.indexOf(name) !== -1 || usedPilots[name] < leaguerules.pilotMax) {
			usedPilots[name] = usedPilots[name] + 1;
		}
		else {
			normalizedData.error = true;
			normalizedData.message = `already used pilot "${name}" ${leaguerules.pilotMax} times`;
		}
	});

	newList.list_id = checksum(listIdString);

	// there was a pilot used more than 3 times. Return the data with the error and stop.
	if (normalizedData.error) {
		return  normalizedData;
	}	

	let timesUsed = 0;
	for (let i = player.lists.length; i--;) {
		timesUsed = (player.lists[i] === newList.list_id) ? (timesUsed + 1) : 0;
	}

	if (timesUsed >= 2) {
		normalizedData.error = true;
		normalizedData.message = `list already used ${leaguerules.listMax} times`;
		return normalizedData;
	}

	normalizedData.list = newList;
	return normalizedData;

}

export default { normalizeAndValidateList, calculateLeaguePoints };
