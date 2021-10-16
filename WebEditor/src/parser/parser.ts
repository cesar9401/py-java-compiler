import { Program } from './program/program';
import { Python } from './py/python';
import {CompilerService} from 'src/service/compiler.service';
import { Code } from 'src/parser/main/code';
import { CodeBlock } from 'src/control/code_block';

declare var main: any;

export class Parser {
	private input: string = "";
	private code: Code[];
	private blocks: CodeBlock[];

	private functions: string[];

	constructor(private compilerService: CompilerService) {
		this.code = [];
		this.blocks = [];

		this.functions = [];

		this.setFunctions();
	}

	setInput(input: string) {
		this.input = input;
		this.getSources();
	}

	getSources() {
		try {
			const value: Code[] = main.parse(this.input);
			// console.log(value);
			this.code = value;

			this.parsePython();
			this.parseProgram();

			// this.blocks.forEach(block => console.log(block));

			this.compilerService.sendCodeBlocks(this.blocks)
				.then(console.log)
				.catch(console.log);

		} catch (error) {
			console.error(error);
		}
	}

	/* parsear codigo con sisntaxis python */
	parsePython() {
		const python = new Python(this.compilerService, this.code[1], this.blocks);
		python.parse();
		this.functions = python.functions;
	}

	/* parser codigo con sintaxis c */
	parseProgram() {
		let program = new Program(this.compilerService, this.code[3], this.blocks);
		program.functions = this.functions;
		program.parse();
	}

	private setFunctions() {
		main.yy.Code = Code;
	}
}
