const express = require('express');
const cors = require('cors');

const app = express();

const compiler = require('./routes/compiler');

// puerto
app.set('port', process.env.PORT || 3000);

// leer json
app.use(express.json());

// cors
app.use(cors());

// routes
app.use('/api/compiler', compiler);

// server
app.listen(app.get('port'), () => {
	console.log(`listen on http://localhost:${app.get('port')}`);
});
