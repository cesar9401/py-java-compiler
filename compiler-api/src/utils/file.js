const fs = require('fs');
const path = 'src/data/project.c';

function write(data) {
	fs.writeFile(path, data, error => {
		if(error) {
			console.log(error);
		} else {
			console.log('Archivo escrito!');
		}
	})
}

module.exports = {
	write
}
