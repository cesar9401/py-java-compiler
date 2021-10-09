import { OperationType } from "src/instruction/operation";

export class Quadruple {
	op: string;
	arg1: string;
	arg2: string;
	result: string;
	type?: OperationType;

	constructor(op: string, arg1: string, arg2: string, result: string, type?: OperationType) {
		this.op = op;
		this.arg1 = arg1;
		this.arg2 = arg2;
		this.result = result;
		this.type = type;
	}

	toString(): string {
		const type = this.type ? `, type: ${this.type.toLowerCase()}` : ``;
		return `op: ${this.op}, arg1: ${this.arg1}, arg2: ${this.arg2}, res: ${this.result} ${type}`;
	}
}
