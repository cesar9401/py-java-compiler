import { Variable } from "src/instruction/variable";
import { OperationType } from "src/instruction/operation";
import { SemanticHandler } from "./semantic_handler";
import { Error, TypeE } from "./error";

export class OperationCheck {
	sm: SemanticHandler;

	constructor(sm: SemanticHandler) {
		this.sm = sm;
	}

	binaryOperation(type: OperationType, left: Variable | undefined, right: Variable | undefined, line:number, column: number) : Variable | undefined {
		if(!left || !right) {
			return undefined;
		}

		// comparaciones
		switch(type) {
			case OperationType.EQEQ:
			case OperationType.NEQ:
			case OperationType.SMALLER:
			case OperationType.SMALLER_EQ:
			case OperationType.GREATER:
			case OperationType.GREATER_EQ:
				return new Variable(OperationType.INT, undefined, " ");

			case OperationType.AND:
			case OperationType.OR:
				return new Variable(OperationType.INT, undefined, " ");
		}

		// char vs char
		if(left.type === OperationType.CHAR && right.type === OperationType.CHAR) {
			switch(type) {
				case OperationType.SUM:
				case OperationType.SUB:
				case OperationType.MUL:
				case OperationType.DIV:
				case OperationType.MOD:
				case OperationType.POW:
					return new Variable(OperationType.CHAR, undefined, " ");
			}
		}

		// entero vs entero
		if(left.type === OperationType.INT && right.type === OperationType.INT) {
			switch(type) {
				case OperationType.SUM:
				case OperationType.SUB:
				case OperationType.MUL:
				case OperationType.DIV:
				case OperationType.MOD:
				case OperationType.POW:
					return new Variable(OperationType.INT, undefined, " ");
			}
		}

		// float vs float
		if(left.type === OperationType.FLOAT && right.type === OperationType.FLOAT) {
			switch(type) {
				case OperationType.SUM:
				case OperationType.SUB:
				case OperationType.MUL:
				case OperationType.DIV:
				case OperationType.POW:
					return new Variable(OperationType.FLOAT, undefined, " ");
			}
		}

		// entero vs float or float vs entero
		if((left.type === OperationType.INT && right.type === OperationType.FLOAT) || (left.type === OperationType.FLOAT && right.type === OperationType.INT)) {
			switch(type) {
				case OperationType.SUM:
				case OperationType.SUB:
				case OperationType.MUL:
				case OperationType.DIV:
				case OperationType.POW:
					return new Variable(OperationType.FLOAT, undefined, " ");
			}
		}

		// float vs char or char vs float
		if((left.type === OperationType.FLOAT && right.type === OperationType.CHAR) || (left.type === OperationType.CHAR && right.type === OperationType.FLOAT)) {
			switch(type) {
				case OperationType.SUM:
				case OperationType.SUB:
				case OperationType.MUL:
				case OperationType.DIV:
				case OperationType.POW:
					return new Variable(OperationType.FLOAT, undefined, " ");
			}
		}

		// entero vs char or char vs entero
		if((left.type === OperationType.INT && right.type === OperationType.CHAR) || (left.type === OperationType.CHAR && right.type === OperationType.INT)) {
			switch(type) {
				case OperationType.SUM:
				case OperationType.SUB:
				case OperationType.MUL:
				case OperationType.DIV:
				case OperationType.POW:
				case OperationType.MOD:
					return new Variable(OperationType.INT, undefined, " ");
			}
		}

		const desc = `No es posible efectuar la operacion '${type}' entre tipos '${left.type}' y '${right.type}'.`;
		const error = new Error(line, column, type, TypeE.SEMANTICO, desc);
		this.sm.errors.push(error);
		return undefined;
	}
}
