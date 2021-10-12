import { Variable } from "src/instruction/c/variable";
import { OperationType } from "src/instruction/c/operation";
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

	binaryOperationPY(type: OperationType, left: Variable | undefined, right: Variable | undefined, line:number, column: number) : Variable | undefined {
		if(!left || !right) return undefined;

		// OR | AND
		switch(type) {
			case OperationType.AND:
			case OperationType.OR:
				return new Variable(OperationType.BOOL, undefined, " ");
		}

		// entero vs entero
		if(left.type === OperationType.INT && right.type === OperationType.INT) {
			switch(type) {
				case OperationType.SUM:
				case OperationType.SUB:
				case OperationType.MUL:
				case OperationType.MOD:
				case OperationType.POW:
					return new Variable(OperationType.INT, undefined, " ");
				case OperationType.DIV:
					return new Variable(OperationType.FLOAT, undefined, " ");

				case OperationType.EQEQ:
				case OperationType.NEQ:
				case OperationType.SMALLER:
				case OperationType.SMALLER_EQ:
				case OperationType.GREATER:
				case OperationType.GREATER_EQ:
					return new Variable(OperationType.BOOL, undefined, " ");
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

				case OperationType.EQEQ:
				case OperationType.NEQ:
				case OperationType.SMALLER:
				case OperationType.SMALLER_EQ:
				case OperationType.GREATER:
				case OperationType.GREATER_EQ:
					return new Variable(OperationType.BOOL, undefined, " ");
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

				case OperationType.EQEQ:
				case OperationType.NEQ:
				case OperationType.SMALLER:
				case OperationType.SMALLER_EQ:
				case OperationType.GREATER:
				case OperationType.GREATER_EQ:
					return new Variable(OperationType.BOOL, undefined, " ");
			}
		}

		// string vs string
		if(left.type === OperationType.STRING && right.type === OperationType.STRING) {
			switch(type) {
				case OperationType.SUM:
					return new Variable(OperationType.STRING, undefined, " ");
				case OperationType.EQEQ:
				case OperationType.NEQ:
					return new Variable(OperationType.BOOL, undefined, " ");
			}
		}

		// boolean vs boolean
		if(left.type === OperationType.BOOL && right.type === OperationType.BOOL) {
			switch(type) {
				case OperationType.SUM:
				case OperationType.SUB:
				case OperationType.MUL:
				case OperationType.MOD:
				case OperationType.POW:
					return new Variable(OperationType.INT, undefined, " ");
				case OperationType.DIV:
					return new Variable(OperationType.FLOAT, undefined, " ");

				case OperationType.EQEQ:
				case OperationType.NEQ:
				case OperationType.SMALLER:
				case OperationType.SMALLER_EQ:
				case OperationType.GREATER:
				case OperationType.GREATER_EQ:
					return new Variable(OperationType.BOOL, undefined, " ");

			}
		}

		// boolean vs int or int vs boolean
		if((left.type === OperationType.BOOL && right.type === OperationType.INT) || (left.type === OperationType.INT && right.type === OperationType.BOOL)) {
			switch(type) {
				case OperationType.SUM:
				case OperationType.SUB:
				case OperationType.MUL:
				case OperationType.MOD:
				case OperationType.POW:
					return new Variable(OperationType.INT, undefined, " ");
				case OperationType.DIV:
					return new Variable(OperationType.FLOAT, undefined, " ");

				case OperationType.EQEQ:
				case OperationType.NEQ:
				case OperationType.SMALLER:
				case OperationType.SMALLER_EQ:
				case OperationType.GREATER:
				case OperationType.GREATER_EQ:
					return new Variable(OperationType.BOOL, undefined, " ");
			}
		}

		// boolean vs float or float vs boolean
		if((left.type === OperationType.BOOL && right.type === OperationType.FLOAT) || (left.type === OperationType.FLOAT && right.type === OperationType.BOOL)) {
			switch(type) {
				case OperationType.SUM:
				case OperationType.SUB:
				case OperationType.MUL:
				case OperationType.MOD:
				//case OperationType.POW:
				case OperationType.DIV:
					return new Variable(OperationType.FLOAT, undefined, " ");

				case OperationType.EQEQ:
				case OperationType.NEQ:
				case OperationType.SMALLER:
				case OperationType.SMALLER_EQ:
				case OperationType.GREATER:
				case OperationType.GREATER_EQ:
					return new Variable(OperationType.BOOL, undefined, " ");
			}
		}

		const desc = `No es posible efectuar la operacion '${type}' entre tipos '${left.type}' y '${right.type}'.`;
		const error = new Error(line, column, type, TypeE.SEMANTICO, desc);
		this.sm.errors.push(error);
		return undefined;
	}

	notPY(left: Variable | undefined, line:number, column: number) : Variable | undefined {
		if(!left) {
			return;
		}

		return new Variable(OperationType.BOOL, undefined, " ");
	}

	uminusPY(left: Variable | undefined, line:number, column: number) : Variable | undefined {
		if(!left) return;

		switch(left.type) {
			case OperationType.INT:
				return new Variable(OperationType.INT, undefined, " ");
			case OperationType.FLOAT:
				return new Variable(OperationType.FLOAT, undefined, " ");
		}

		const desc = `No es posible efectuar la operacion de 'negacion logica' con una variable de tipo '${left.type}'`;
		const error = new Error(line, column, '', TypeE.SEMANTICO, desc);
		this.sm.errors.push(error);
		return;
	}
}
