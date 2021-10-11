import { Program } from './program/program';
import { Python } from './py/python';
import {CompilerService} from 'src/service/compiler.service';

// declare var python:any;
declare var java:any;
// declare var program:any;

export class Parser {
	private input: string = "";
	private regx: RegExp;
	private code: string[];

	constructor(private compilerService: CompilerService) {
		this.regx = /(([^\n\r]|\n)*)(%%PY([^\n\r]|\n)*)(%%JAVA([^\n\r]|\n)*)(%%PROGRAMA([^\n\r]|\n)*)/;
		this.code = [];
	}

	setInput(input: string) {
		this.input = input;

		this.code = [];
		this.getSources();
	}

	getSources() {
		const test = this.regx.test(this.input);
		if(test) {
			let value = this.regx.exec(this.input);
			if(value) {
				this.code.push(value[1]);// package 0
				this.code.push(value[3] + "\n\n");// py 1
				this.code.push(value[5]);// java 2
				this.code.push(value[7]);// program 3

				// this.parseProgram();
				this.parserPython();
			}
		} else {
			console.log(`No se reconoce codigo fuente`);
		}
	}

	/* parser codigo con sintaxis c */
	parseProgram() {
		let program = new Program(this.compilerService, this.code[3]);
		program.parse();
	}

	/* parsear codigo con sisntaxis python */
	parserPython() {
		const python = new Python(this.compilerService, this.code[1]);
		python.parse();
	}
}
