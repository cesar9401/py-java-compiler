import { OperationCheck } from "./operationcheck";
import { Error } from '../control/error';
import { Variable } from "src/instruction/variable";

export class SemanticHandler {
	op: OperationCheck;
	errors: Error[];
	private father: Variable[];

	constructor() {
		this.op = new OperationCheck(this);
		this.errors = [];
		this.father = [];
	}

	public get getFather(): Variable[] {
		return this.father;
	}
}
