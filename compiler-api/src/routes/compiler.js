const { Router } = require('express');
const { write } = require('../utils/file')

const get3dCode = require('../utils/code');
const MakeCode = require('../utils/project');

const getProjects = require('../utils/parser/read');

const router = new Router();

const data = {name: "César", carrera: "Ingenieria en Ciencias y Sistemas"};

router.get('/',  async (req, res) => {
	const value = await getProjects();
	res.status(200);
	res.json({ projects: value });
});

router.post('/', (req, res) => {
	const { quads } = req.body;
	const code = get3dCode(quads);

	write(code);

	res.status(200);
	res.json(data);
});

router.post('/blocks', (req, res) => {
	const { blocks } = req.body;

	const code = new MakeCode(blocks);
	const value = code.getCode();
	write(value);

	res.status(200);
	res.json(data);
});

module.exports = router;
