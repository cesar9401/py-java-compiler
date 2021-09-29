import { Variable } from "src/instruction/variable";
import { Instruction } from "src/instruction/instruction";
import { OperationType } from "src/instruction/operation";
import { Value } from "src/instruction/value";

export class OperationCheck {

	binaryOperation(type: OperationType, left: Variable, right: Variable) : Variable | undefined {
		if(!left || !right) {
			return undefined;
		}

		if(left.type === OperationType.INT && right.type === OperationType.INT) {
			switch(type) {
				case OperationType.SUM:
				case OperationType.SUB:
				case OperationType.MUL:
				case OperationType.DIV:
					return new Variable(OperationType.INT, undefined, "");

				case OperationType.EQEQ:
				case OperationType.NEQ:
				case OperationType.SMALLER:
				case OperationType.SMALLER_EQ:
				case OperationType.GREATER:
				case OperationType.GREATER_EQ:
					return new Variable(OperationType.INT, undefined, "");
			}
		}

		if(left.type === OperationType.FLOAT && right.type === OperationType.FLOAT) {
			switch(type) {
				case OperationType.SUM:
				case OperationType.SUB:
				case OperationType.MUL:
				case OperationType.DIV:
					return new Variable(OperationType.FLOAT, undefined, "");

				case OperationType.EQEQ:
				case OperationType.NEQ:
				case OperationType.SMALLER:
				case OperationType.SMALLER_EQ:
				case OperationType.GREATER:
				case OperationType.GREATER_EQ:
					return new Variable(OperationType.INT, undefined, "");
			}
		}

		if((left.type === OperationType.INT || left.type === OperationType.FLOAT) && (right.type === OperationType.INT || right.type === OperationType.FLOAT)) {
			switch(type) {
				case OperationType.SUM:
				case OperationType.SUB:
				case OperationType.MUL:
				case OperationType.DIV:
					return new Variable(OperationType.FLOAT, undefined, "");

				case OperationType.EQEQ:
				case OperationType.NEQ:
				case OperationType.SMALLER:
				case OperationType.SMALLER_EQ:
				case OperationType.GREATER:
				case OperationType.GREATER_EQ:
					return new Variable(OperationType.INT, undefined, "");
			}
		}

		console.log(`No es posible operacion ${type} entre ${left.type} y ${right.type}`);
		return undefined;
	}
}
