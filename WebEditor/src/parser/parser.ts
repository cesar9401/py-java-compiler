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
import { Error } from 'src/control/error';
import { AbsParser } from './abs_parser';

declare var main: any;

export class Parser {
	// private input: File;
	private code: Code[];
	private blocks: CodeBlock[];
	private functions: FunctionPY[];
	private classes: ClassJV[];
	private errors: Error[];
	private parsers: AbsParser[];

	constructor(private compilerService: CompilerService, private input: File, private project: Project) {
		this.code = [];
		this.blocks = [];
		this.functions = [];
		this.classes = [];
		this.errors = [];
		this.parsers = [];
		this.setFunctions();
	}

	getSources() {
		try {
			const value: Code[] = main.parse(this.input.code);
			this.code = value;
			this.getIncludes();
			// return value;


			/* parsear archivos */
			// this.parsePython();
			// this.parseJava();
			// this.parseProgram();
			/* parsear archivos */

			// this.blocks.forEach(block => console.log(block));

			/* enviar bloques al servidor */
			// this.compilerService.sendCodeBlocks(this.blocks)
			// 	.then(console.log)
			// 	.catch(console.log);

		} catch (error) {
			return;
		}
	}

	getIncludes() {
		const program = new Program(this.compilerService, this.code[3], this.blocks);
		const includes: Include[] = program.getIncludes();
		console.log(includes);

		/* obtener el proyecto a compilar */
		console.log(this.project);

		/* obtener el codigo a compilar */
		if(includes.length > 0) {
			for(const include of includes) {
				if(include.all && include.dir.length === 0) {
					/* incluir todas las clases java en el archivo actual */
					if(include.type === "PY") {
						/* obtener value de this.code[1] */
						console.log(`todo py en actual -> `, this.input);
						this.parsePython(this.code[1]);
					}

					/* incluir todas las funciones py en el archivo actual */
					if(include.type === "JAVA") {
						/* obtener value de this.code[2] */
						console.log(`todo java en actual -> `, this.input);
						this.parseJava(this.code[2]);
					}
				}

				if(include.all && include.dir.length > 0) {
					const dir = this.getFilesInPackage(include.dir);
					/* todas las funciones py en el paquete */
					if(include.type === "PY") {
						if(dir) {
							console.log('todas las func py en pack-> ', dir);
						} else {
							/* no existe dir */
						}
					}

					/* todas las clases java en el paquete */
					if(include.type === "JAVA") {
						if(dir) {
							console.log('todas las clases en pack -> ', dir);
						} else {
							/* no existe dir */
						}
					}
				}

				if(!include.all && include.dir.length > 0) {
					/* una clase en especifico en fichero */
					const file = this.getFile(include.dir);
					if(include.type === "JAVA") {
						if(include.dir.length === 1) {
							/* clase en el archivo actual */
							console.log(`clase ${include.dir[0]} en actual ->`, this.input);
						} else {
							/* clase en el paquete actual */
							const dir = include.dir.slice(0, -1);
							if(dir) {
								const files = this.getFilesInPackage(dir);
								console.log(`clase ${include.dir[include.dir.length - 1]} en paquete ->`, files);
							} else {
								/* no existe dir */
							}
						}
					}

					/* funciones py en fichero */
					if(include.type === "PY") {
						console.log('funciones en fichero py -> ', file);
					}
				}
			}
		} else {

		}

		console.log(this.parsers);
		this.errors.forEach(console.log);
		/* parsear con this.value[3] */
	}

	/* parsear codigo con sisntaxis python */
	parsePython(source: Code) {
		const python = new Python(source, this.blocks, this.errors);
		python.parse();
		// this.functions = [...python.functions];
		this.parsers.push(python);
	}

	/* parsear codigo con sintaxis java */
	parseJava(source: Code) {
		let java = new Java(source, this.blocks, this.errors);
		java.parse();
		// this.classes = [...java.classes];
		this.parsers.push(java);
	}

	/* parser codigo con sintaxis c */
	parseProgram() {
		let program = new Program(this.compilerService, this.code[3], this.blocks);
		program.functions = this.functions;
		program.classes = this.classes;
		program.parse();
	}

	private setFunctions() {
		main.yy.Code = Code;
	}

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
}
