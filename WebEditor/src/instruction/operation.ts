import { Instruction } from "./instruction";

export class Operation extends Instruction{
	type: OperationType;
	left: Instruction;
	right?: Instruction;

	constructor(line: number, column: number, type: OperationType, left: Instruction, right?: Instruction) {
		super(line, column);
		this.type = type;
		this.left = left;
		this.right = right;
	}

	run() {
	}
}

export enum OperationType {
	INT,
	DOUBLE,
	FLOAT,
	CHAR,
	STRING,
	ID,

	SUM,
	SUB,
	MUL,
	DIV,
	UMINUS,
	POW,
	MOD,

	AND,
	OR,
	NOT,

	EQEQ,
	NEQ,
	GREATER,
	GREATER_EQ,
	SMALLER,
	SMALLER_EQ
}