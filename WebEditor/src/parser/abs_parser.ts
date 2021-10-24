import { CodeBlock } from "src/control/code_block";
import { Error } from "src/control/error";
import { Code } from "./main/code";

export abstract class AbsParser {
	source: Code;
	blocks: CodeBlock[];
	errors: Error[];

	constructor(source: Code, blocks: CodeBlock[], errors: Error[]){
		this.source = source;
		this.blocks = blocks;
		this.errors = errors;
	}

	parse():any {}
	setFunctions():any {}
}