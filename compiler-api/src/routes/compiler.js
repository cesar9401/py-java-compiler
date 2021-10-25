const { Router } = require('express');
const { write } = require('../utils/file')
const get3dCode = require('../utils/code');
const MakeCode = require('../utils/project');
const getProjects = require('../utils/parser/read');
const RenderDB = require('../utils/db/render_db');
const execute = require('../utils/exec');

const path = require('path');

const router = new Router();

const data = {name: "César", carrera: "Ingenieria en Ciencias y Sistemas"};

/* obtener todos los proyectos */
router.get('/',  async (req, res) => {
	const value = await getProjects();
	res.status(200);
	res.json({ projects: value });
});

/* enviar compilacion del projeyecto actual */
router.get('/project.out', (req, res) => {
	const file = path.join(__dirname, '../data/project.out');
	res.sendFile(file, (error) => {
		if(error) return console.error(error);
		console.log('sending:', file);
	})
});

router.get('/project.c', (req, res) => {
	const file = path.join(__dirname, '../data/project.c');
	res.sendFile(file, error => {
		if(error) return console.error(error);
		console.log('sending:', file)
	})
})

/* post de pruebas para escribir un archivo con codigo 3d */
router.post('/', (req, res) => {
	const { quads } = req.body;
	const code = get3dCode(quads);

	write(code);

	res.status(200);
	res.json(data);
});

/* post para escribir codigo 3d de un proyecto */
router.post('/blocks', (req, res) => {
	const { blocks } = req.body;

	const code = new MakeCode(blocks);
	const value = code.getCode();
	write(value);

	/* compilar */
	execute();

	const data_ = {
		data: new Date(),
		code: value
	};

	res.status(200);
	res.json(data_);
});

/* put para modificaciones en el listado de proyectos */
router.put('/', async (req, res) => {
	const { projects } = req.body;
	const render = new RenderDB(projects);
	const file = render.renderProjects();
	const result = await render.writeFile(file);
	console.log(`updated: ${result}`);
	res.status(200);
	res.json({ response: 'base de datos actualizada', file: result});
});

module.exports = router;
