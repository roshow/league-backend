/*jshint esnext: true */
import crypto from 'crypto';
let checksum = ( string ) => crypto.createHash('sha1').update(string, 'utf8').digest('hex');

const leaguerules = {
	pilotMax: 30,
	listMax: 2
};

function normalizeAndValidateList (newList, player) {

	let normalizedData = {
		list: {},
		error: false,
		message: ''
	};

	let listKeys = Object.keys(player.lists);

	if ( listKeys.indexOf(newList.name) !== -1 ) {
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
		else if (usedPilots[name] < leaguerules.pilotMax) {
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

	let timesUsed = listKeys.reduce( function (count, key) {
		let listId = player.lists[key];
		if (listId === newList.list_id) {
			return count + 1;
		}
		return count;
	}, 0);

	if (timesUsed >= 2) {
		normalizedData.error = true;
		normalizedData.message = `list already used ${leaguerules.listMax} times`;
		return normalizedData;
	}

	normalizedData.list = newList;
	return normalizedData;

}

export default { normalizeAndValidateList };
