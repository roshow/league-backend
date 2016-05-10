
import leagueDb from './db';
import { readFileSync, writeFile, createReadStream } from 'fs';
import { Converter } from 'csvtojson';
import request from 'request';

let _writeToFile = false;
let urls = {
	ultima: `https://docs.google.com/spreadsheets/d/1iM6YRodJyhLqII7BYELNogJYdyJFFN8JGpSg5Y2bdMA/pub?output=csv&gid=0`,
	argent: `https://docs.google.com/spreadsheets/d/1iM6YRodJyhLqII7BYELNogJYdyJFFN8JGpSg5Y2bdMA/pub?output=csv&gid=1526608063`
};
function formatMatches (rawmatches) {
  return rawmatches.map( (match, i) => (
		{
			week: match.week,
			division: match.division,
			game: (i + 1),
			played: !!match.played,
			gamePlayed: match.played,
			players: [
				{
					name: match.player1.replace(/\s/g, '').toLowerCase(),
					destroyed: match.points1
				},
				{
					name: match.player2.replace(/\s/g, '').toLowerCase(),
					destroyed: match.points2
				}
			]
		}
	));
}


function convertThoseMatches (division, convertType, data) {
	return new Promise(function (resolve, reject) {
		division = ( division === 'ultima' || division === 'argent' ) ? division : false;
		convertType = ( convertType === 'url' || convertType === 'file' ) ? convertType : false;
		let arg = data || false;

		if (!division || !convertType) {
			console.log('I have no idea what you want me to convert');
			reject('I have no idea what you want me to convert');
		} 

		
		let converter =  new Converter({ constructResult: true });
		converter.on('end_parsed', function (result) { 
			// console.log(result);
			let formattedmatches = formatMatches(result);
			if (_writeToFile) {
				let filename = `json/matches/${division}-all-formatted.json`;
				console.log(`writing to file ${filename}`);
				writeFile(filename, JSON.stringify(formattedmatches));
			}
			resolve(formattedmatches);
		});


		if (convertType === 'url') {

			let csvUrl = urls[division];
			console.log(`converting from url: ${csvUrl}`);
			request.get(csvUrl).pipe(converter);
		}
		else if (convertType === 'file' && arg) {
			console.log(`converting from file: ${csvUrl}`);
			createReadStream(arg).pipe(converter);

		}
	});

}

function getMatchesFromUrls (writeToFile) {
	_writeToFile = writeToFile;
	return Promise.all([
		convertThoseMatches('ultima', 'url'),
		convertThoseMatches('argent', 'url')
	]).then(function (results) {
		let allmatches = [...results[0], ...results[1]];
		return allmatches;
	});
}

export default {
	convertThoseMatches,
	getMatchesFromUrls,
};

