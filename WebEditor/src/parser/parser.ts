import { Program } from './program/program';
import { Python } from './py/python';
import { FunctionPY } from 'src/instruction/py/function_py';
import { CompilerService } from 'src/service/compiler.service';
import { Code } from 'src/parser/main/code';
import { CodeBlock } from 'src/control/code_block';
import { Java } from './java/java';
import { ClassJV } from 'src/instruction/java/class_jv';
import { Include } from 'src/instruction/c/include';
import { Project } from 'src/model/project';
import { Package } from 'src/model/package';
import { File } from 'src/model/file';
import { If } from 'src/instruction/c/if';
import { Error, TypeE } from 'src/control/error';
import { AbsParser } from './abs_parser';
import { ProgramImports } from './program_import';

declare var main: any;

export class Parser {
	// private input: File;
	private code: Code[];
	private blocks: CodeBlock[];
	private functions: FunctionPY[];
	private classes: ClassJV[];
	private errors: Error[];
	private parsers: AbsParser[];
	private programImports: ProgramImports[];
	private list: string[];
	private map: Map<Include, string>;
	response: string;

	constructor(private compilerService: CompilerService, private input: File, private project: Project) {
		this.code = [];
		this.blocks = [];
		this.functions = [];
		this.classes = [];
		this.errors = [];
		this.parsers = [];
		this.programImports = [];
		this.list = [];
		this.map = new Map();
		this.setFunctions();
		this.response = '';
	}

	getSources() {
		try {
			const value: Code[] = main.parse(this.input.code);
			value.forEach(code => code.name = this.input.name);
			this.code = value;
			return this.getIncludes();
			// return value;

		} catch (error) {
			console.log(error);
		}
		return this.response;
	}

	async getIncludes() {
		const program = new Program(this.code[3], this.blocks, this.errors);
		const includes: Include[] = program.getIncludes();
		// console.log(includes);

		/* obtener el proyecto a compilar */
		// console.log(this.project);

		/* obtener el codigo a compilar */
		if(includes.length > 0) {
			for(const include of includes) {
				if(include.all && include.dir.length === 0) {
					/* incluir todas las funciones py en el archivo actual */
					if(include.type === "PY") {
						this.addFile("PY", this.input, "*");
					}

					/* incluir todas las clases java en el archivo actual */
					if(include.type === "JAVA") {
						this.addFile("JAVA", this.input, "*");
					}
				}

				if(include.all && include.dir.length > 0) {
					const dir: File[] | undefined = this.getFilesInPackage(include.dir);
					/* todas las funciones py en el paquete */
					if(include.type === "PY") {
						if(dir) {
							for(const f of dir) {
								this.addFile("PY", f, "*");
							}
						} else {
							/* no existe dir */
							const desc = `El directorio/paquete que ha indicado como ${this.getDir(include.dir)}, no existe.`;
							const error = new Error(include.line, include.column, this.getDir(include.dir), TypeE.SEMANTICO, desc);
							this.errors.push(error);
						}
					}

					/* todas las clases java en el paquete */
					if(include.type === "JAVA") {
						if(dir) {
							// console.log('todas las clases en pack -> ', dir);
							for(const f of dir) {
								this.addFile("JAVA", f, "*");
							}
						} else {
							/* no existe dir */
							const desc = `El directorio/paquete que ha indicado como ${this.getDir(include.dir)}, no existe.`;
							const error = new Error(include.line, include.column, this.getDir(include.dir), TypeE.SEMANTICO, desc);
							this.errors.push(error);
						}
					}
				}

				if(!include.all && include.dir.length > 0) {
					/* una clase en especifico en fichero */
					if(include.type === "JAVA") {
						if(include.dir.length === 1) {
							/* clase en el archivo actual */
							this.addFile("JAVA", this.input, include.dir[0]);
							/* include.dir[0] -> include */
							this.map.set(include, include.dir[0]);
						} else {
							/* clase en el paquete actual */
							const dir = include.dir.slice(0, -1);
							if(dir) {
								const files: File[] | undefined = this.getFilesInPackage(dir);
								if(files) {
									// console.log(`clase ${include.dir[include.dir.length - 1]} en paquete ->`, files);
									for(const f of files) {
										this.addFile("JAVA", f, include.dir[include.dir.length - 1]);
										/* include.dir[include.dir.length - 1] -> include */
										this.map.set(include, include.dir[include.dir.length - 1]);
									}
								} else {
									const desc = `El directorio/paquete que ha indicado como ${this.getDir(include.dir)}, no existe.`;
									const error = new Error(include.line, include.column, this.getDir(include.dir), TypeE.SEMANTICO, desc);
									this.errors.push(error);
								}
							} else {
								/* no existe dir */
								const desc = `El directorio/paquete que ha indicado como ${this.getDir(include.dir)}, no existe.`;
								const error = new Error(include.line, include.column, this.getDir(include.dir), TypeE.SEMANTICO, desc);
								this.errors.push(error);
							}
						}
					}

					/* funciones py en fichero */
					const file = this.getFile(include.dir);
					if(include.type === "PY") {
						if(file) {
							this.addFile("PY", file, "*")
						} else {
							const desc = `El directorio/paquete que ha indicado como ${this.getDir(include.dir)}, no existe.`;
							const error = new Error(include.line, include.column, this.getDir(include.dir), TypeE.SEMANTICO, desc);
							this.errors.push(error);
						}
					}
				}
			}
		}

		// console.log(this.programImports);
		for(const imps of this.programImports) {
			if(imps.type === 'PY') {
				const file = imps.file;
				const value: Code[] = main.parse(file.code);
				if(value) {
					value.forEach(code => code.name = file.name);
					this.parsePython(value[1]);
				}
			}

			if(imps.type === 'JAVA') {
				if(!imps.all) {
					const value: Code[] = main.parse(imps.file.code);
					if(value) {
						value.forEach(code => code.name = imps.file.name);
						const java = this.parseJava(value[2]);
						java.parse();
						const classes = java.classes;
						for(const c of classes) {
							const id = c.id;
							if(imps.imports.includes(id)) {
								this.addClass(c);
							}
						}
					}
				} else {
					const value: Code[] = main.parse(imps.file.code);
					if(value) {
						value.forEach(code => code.name = imps.file.name)
						const java = this.parseJava(value[2]);
						java.parse();
						for(const c of java.classes) {
							this.addClass(c);
						}
					}
				}
			}
		}

		/* parsear codigo c */
		const c = new Program(this.code[3], this.blocks, this.errors);
		c.functions = this.functions;
		c.classes = this.classes;
		c.parse();

		/* revisar que todas las clases que pidieron importarse, fueron encontradas */
		// console.log(this.list);
		// console.log(this.classes);
		// console.log(this.map);
		// // for(const entry of this.map.entries()) {
		// // 	console.log(entry[0], entry[1]);
		// // }
		/* revisar que todas las clases que pidieron importarse, fueron encontradas */

		if(this.errors.length > 0) {
			//this.errors.forEach(e => console.log(e.toString()));
			/* emitir errores */
		} else {
			/* aca en teoria todo el codigo esta bien :v */
			for(const parser of this.parsers) {
				parser.generate();
			}
			c.generate();

			/* agregar bloques de cleses java */
			for(const clzz of this.classes) {
				this.blocks = [...this.blocks, ...clzz.tmpBlocks];
			}

			// console.log(this.blocks);

			/* enviar al servidor */
			// this.compilerService.sendCodeBlocks(this.blocks)
			// 	.then(data => {
			// 		// console.log(data.code);
			// 		/* emitir data */
			// 		this.response = data.code;
			// 		console.log(this.response);
			// 	})
			// 	.catch(console.log);
			try {
				const data = await this.compilerService.sendCodeBlocks(this.blocks);
				// console.log(data);
				this.response = data.code;
				return this.response;
			} catch (error) {
				console.error(error);
			}
		}
		return this.response;
	}

	/* parsear codigo con sisntaxis python */
	parsePython(source: Code) {
		const python = new Python(source, this.blocks, this.errors);
		python.parse();
		// this.functions = [...python.functions];
		this.parsers.push(python);
		for(const f of python.functions) {
			this.addFunction(f);
		}
	}

	/* parsear codigo con sintaxis java */
	parseJava(source: Code) {
		const java = new Java(source, this.blocks, this.errors);
		this.parsers.push(java);
		return java;
	}

	/* parser codigo con sintaxis c */
	// parseProgram(source: Code) {
	// 	let program = new Program(source, this.blocks, this.errors);
	// 	program.functions = this.functions;
	// 	program.classes = this.classes;
	// 	program.parse();
	// }


	/* agregar una funcion de py */
	private addFunction(f: FunctionPY) {
		const element = this.functions.find(fun => fun.getId() === f.getId());
		const index = element ? this.functions.indexOf(element) : -1;
		if(index !== -1) {
			console.log('sustituyendo:', element, '->', f);
			this.functions.splice(index, 1, f);
		} else {
			this.functions.push(f);
		}
	}

	private addClass(clazz: ClassJV) {
		const element = this.classes.find(clzz => clzz.id === clazz.id);
		const index = element ? this.classes.indexOf(element) : -1;
		if(index !== -1) {
			console.log('sustituyendo', element, '->', clazz);
			this.classes.splice(index, 1, clazz);
		} else {
			this.classes.push(clazz);
		}
	}

	private setFunctions() {
		main.yy.Code = Code;
	}

	/* agregar ficheros que serviran de imports */
	private addFile(type: string, file: File, toImport: string) {
		const imprt = this.programImports.find(prog => prog.file === file && prog.type === type);
		if(!imprt) {
			const all = toImport === '*';
			const imp = all ? [] : [toImport];
			const newImport = new ProgramImports(type, file, imp, all);
			this.programImports.push(newImport);
			if(!all && !this.list.includes(toImport)) {
				this.list.push(toImport);
			}
		} else {
			if(toImport === '*') {
				imprt.all = true;
			} else if(!imprt.imports.includes(toImport)) {
				imprt.imports.push(toImport);
			}

			if(toImport !== '*' && !this.list.includes(toImport)) {
				this.list.push(toImport); /* agregar a listado donde estan todas las clases */
			}
		}
	}

	/* obtener fichero segun direccion */
	private getFile(dir: string[]): File | undefined {
		// console.log(dir);
		if(dir.length > 1) {
			let i = 1;
			let aux: Package | undefined;
			aux = this.project.content.find(pack => pack.name === dir[0]);
			while(i < dir.length - 1 && aux !== undefined) {
				aux = aux.content.find(pack => pack.name === dir[i]);
				i++;
			}
			if(aux) {
				const file = aux.files.find(fl => fl.name === `${dir[i]}.mlg`);
				return file;
			}

		} else if(dir.length == 1){
			return this.project.files.find(file => file.name === `${dir[0]}.mlg`);
		}
		return;
	}

	/* obtener todos los ficheros en un paquete */
	private getFilesInPackage(dir: string[]): File[] | undefined {
		// console.log(dir);
		if(dir.length > 1) {
			let i = 1;
			let aux: Package | undefined = this.project.content.find(pack => pack.name === dir[0]);
			while(i < dir.length && aux) {
				aux = aux.content.find(pack => pack.name === dir[i]);
				i++;
			}
			if(aux) {
				return aux.files;
			}
		} else if(dir.length === 1) {
			const pack = this.project.content.find(pack => pack.name === dir[0]);
			if(pack) {
				return pack.files;
			}
		}

		return;
	}

	private getDir(dir: string[]) {
		return dir.reduce((a, b) => `${a}.${b}`);
	}

	public get getErrors(): Error[] {
		return this.errors;
	}
}
