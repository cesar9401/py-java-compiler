import { OperationType } from "./operation";

export class Variable {
	cnst: boolean;
	type: OperationType;
	id?: string
	value?: string;

	constructor(type: OperationType, id?: string, value?: string) {
		this.type = type;
		this.id = id;
		this.value = value;
		this.cnst = false;
	}
}
