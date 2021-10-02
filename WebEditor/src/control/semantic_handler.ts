import { OperationCheck } from "./operationcheck";
import { Error } from '../control/error';

export class SemanticHandler {
	op: OperationCheck;
	errors: Error[];

	constructor() {
		this.op = new OperationCheck(this);
		this.errors = [];
	}
}
