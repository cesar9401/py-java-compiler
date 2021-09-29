export class Quadruple {
	op: string;
	arg1: string;
	arg2: string;
	result: string;

	constructor(op: string, arg1: string, arg2: string, result: string) {
		this.op = op;
		this.arg1 = arg1;
		this.arg2 = arg2;
		this.result = result;
	}

	toString(): string {
		return `op: ${this.op}, arg1: ${this.arg1}, arg2: ${this.arg2}, res: ${this.result}`;
	}
}
