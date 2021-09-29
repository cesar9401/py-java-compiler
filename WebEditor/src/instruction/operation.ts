import { Instruction } from "./instruction";
import { SymbolTable } from "src/table/symbolTable";
import { Variable } from "./variable";
import { OperationCheck } from "src/control/operationcheck";
import { Quadruple } from "src/table/quadruple";

export class Operation extends Instruction{
	type: OperationType;
	left: Instruction;
	right?: Instruction;
	op: OperationCheck;
	quad: Quadruple[];

	constructor(line: number, column: number, type: OperationType, left: Instruction, right?: Instruction) {
		super(line, column);
		this.type = type;
		this.left = left;
		this.right = right;
		this.op = new OperationCheck();
		this.quad = [];
	}

	run(table: SymbolTable): Variable | undefined {
		if(this.left && this.right) {
			const left: Variable = this.left.run(table);
			const right: Variable = this.right.run(table);
			return this.op.binaryOperation(this.type, left, right);
		}
		return undefined;
	}

	generate(quads: Quadruple[]) {
	}
}

export enum OperationType {
	INT = "INT",
	DOUBLE = "DOUBLE",
	FLOAT = "FLOAT",
	CHAR = "CHAR",
	STRING = "STRING",
	ID = "ID",

	SUM = "PLUS",
	SUB = "MINUS",
	MUL = "TIMES",
	DIV = "DIVISION",
	UMINUS = "UMINUS",
	POW = "POW",
	MOD = "MOD",

	AND = "AND",
	OR = "OR",
	NOT = "NOT",

	EQEQ = "EQEQ",
	NEQ = "NEQ",
	GREATER = "GREATER",
	GREATER_EQ = "GREATER_EQ",
	SMALLER = "SMALLER",
	SMALLER_EQ = "SMALLER_EQ"
}
