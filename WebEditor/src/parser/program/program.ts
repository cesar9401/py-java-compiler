import { Statement } from '../../instruction/statement';
import { Instruction } from '../../instruction/instruction';
import { Operation, OperationType } from '../../instruction/operation';
import { Value } from '../../instruction/value';
import { Variable } from '../../instruction/variable';

declare var program: any;

export class Program {
	source: string;
	yy: any;

	constructor(source: string) {
		this.source = source;
		this.yy = program.yy;
		this.setFunctions();
	}

	parse() {
		try {
			const value = program.parse(this.source);
			console.log(value);
		} catch (error) {
			console.error(error);
		}
	}

	setFunctions() {
		this.yy.Instruction = Instruction;
		this.yy.Operation = Operation;
		this.yy.Value = Value;
		this.yy.Variable = Variable;
		this.yy.OperationType = OperationType;
		this.yy.Statement = Statement; // declaracion de variable
	}
}