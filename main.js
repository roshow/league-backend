/*jshint esnext: true */

import squadLists from './squadLists';

if (process.argv[2]) {
	let filesList = process.argv.slice(2);
	squadLists.uploadLFromFiles(filesList);
}