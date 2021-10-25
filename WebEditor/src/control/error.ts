
export class Error {
	file: string;
	line: number;
	column: number;
	lexeme: string;
	type: TypeE;
	description: string;

	constructor(
		line: number,
		column: number,
		lexeme: string,
		type: TypeE,
		description: string
	) {
		this.file = '';
		this.line = line;
		this.column = column;
		this.lexeme = lexeme;
		this.type = type;
		this.description = description;
	}

	toString() : string {
		return `file: ${this.file}, line: ${this.line}, col: ${this.column}, type: ${this.type}, lexeme: ${this.lexeme}, desc: ${this.description}`;
	}
}

export enum TypeE {
	LEXICO = "LEXICO",
	SINTACTICO = "SINTACTICO",
	SEMANTICO = "SEMANTICO"
}
