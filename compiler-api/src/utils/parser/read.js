const fs = require('fs').promises;
const data = require('./data');
const path = require('path')
const pathF = '../../data/data.txt';

async function getProjects() {
	const db = await fs.readFile(path.join(__dirname, pathF), "utf-8");
	const txt = await db;
	const value = data.parse(txt);
	return value;
}

module.exports = getProjects;
