const fs = require('fs').promises;
const path = require('path');

class RenderDB {
	pathDB = '../../data/data.xml';

	constructor(projects) {
		this.projects = projects;
	}

	renderProjects() {
		let data = `<root>\n`;
		for(let i = 0; i < this.projects.length; i++) {
			data += `<project>\n`;
			data += `<name>\`${this.projects[i].name}\`</name>\n`;

			/* iterar files aqui */
			for(let j = 0; j < this.projects[i].files.length; j++) {
				data += `<file>\n`;
				data += `<name>\`${this.projects[i].files[j].name}\`</name>\n`;
				data += `<code>\n\`${this.projects[i].files[j].code}\`\n</code>\n`;
				data += `</file>\n`;
			}

			// iterar packages aqui
			for(let j = 0; j < this.projects[i].content.length; j++) {
				data += this.renderPackages(this.projects[i].content[j]);
			}

			data += `</project>\n`;
		}
		data += `</root>\n`
		return data;
	}

	renderPackages(pckg) {
		let data = `<package>\n`;
		data += `<name>\`${pckg.name}\`</name>\n`;

		/* iterar files here */
		for(let i = 0; i < pckg.files.length; i++) {
			data += `<file>\n`;
			data += `<name>\`${pckg.files[i].name}\`</name>\n`;
			data += `<code>\n\`${pckg.files[i].code}\`\n</code>\n`
			data += `</file>\n`
		}

		/* iterar paquetes dentro del package aqui */
		for(let i = 0; i < pckg.content.length; i++) {
			data += this.renderPackages(pckg.content[i]);
		}

		data += `</package>\n`;
		return data;
	}

	async writeFile(data) {
		const dir = path.join(__dirname, this.pathDB);
		await fs.writeFile(dir, data);
		return dir;
	}
}

module.exports = RenderDB;
