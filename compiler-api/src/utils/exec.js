const { exec } = require('child_process');
const path = require('path');

function execute() {
	const input = path.join(__dirname, '../data/project.c')
	const output = path.join(__dirname, '../data/project.out')
	exec(`gcc ${input} -o ${output} -lm`, (error, stdout, stderr) => {
		if(error) {
			return console.log(error);
		}

		if(stderr) {
			return console.log(stderr);
		}

		console.log(`compilando: ${input}`);
		console.log(stdout);
	});
}

module.exports = execute;