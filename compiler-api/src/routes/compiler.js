const { Router } = require('express');

const { write } = require('../utils/file')
const get3dCode = require('../utils/code');

const router = new Router();

const data = {name: "César", carrera: "Ingenieria en Ciencias y Sistemas"};

router.get('/', (req, res) => {
	res.status(200);
	res.json(data);
});

router.post('/', (req, res) => {
	const { quads } = req.body;
	const code = get3dCode(quads);

	write(code);

	res.status(200);
	res.json(data);
});

module.exports = router;
