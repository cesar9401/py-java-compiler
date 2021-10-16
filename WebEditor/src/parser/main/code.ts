export class Code {
	name: string
	code: string;
	first_line: number;
	last_line: number;
	first_column: number;
	last_column: number;

	constructor(
		name: string,
		code: string,
		first_line: number,
		last_line: number,
		first_column: number,
		last_column: number
	) {
		this.name = name;
		this.code = code;
		this.first_line = first_line;
		this.last_line = last_line;
		this.first_column = first_column;
		this.last_column = last_column;
	}
}
