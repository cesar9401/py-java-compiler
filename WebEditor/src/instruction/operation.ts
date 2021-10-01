import { Instruction } from "./instruction";
import { SymbolTable } from "src/table/symbolTable";
import { Variable } from "./variable";
import { Quadruple } from "src/table/quadruple";
import { SemanticHandler } from "src/control/semantic_handler";

export class Operation extends Instruction{
	type: OperationType;
	left: Instruction;
	right?: Instruction;
	quad: Quadruple[];

	constructor(line: number, column: number, type: OperationType, left: Instruction, right?: Instruction) {
		super(line, column);
		this.type = type;
		this.left = left;
		this.right = right;
		this.quad = [];
	}

	run(table: SymbolTable, sm: SemanticHandler): Variable | undefined {
		if(this.left && this.right) {
			const left: Variable = this.left.run(table, sm);
			const right: Variable = this.right.run(table, sm);
			return sm.op.binaryOperation(this.type, left, right);
		}

		if(this.left) {
			console.log(this.left);
		}
		return undefined;
	}

	generate(quads: Quadruple[]): Quadruple | undefined {
		if(this.left && this.right) {
			const left: Quadruple = this.left.generate(quads);
			const right: Quadruple = this.right.generate(quads);
			if(left && right) {
				const result = "t" + (quads.length + 1);
				const quad : Quadruple = new Quadruple(this.type, left.result, right.result, result);
				quads.push(quad);
				return quad;
			}
		}

		return undefined;
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
