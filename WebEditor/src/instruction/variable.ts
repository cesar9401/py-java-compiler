import { OperationType } from "./operation";

export class Variable {
	type?: OperationType;
	id?: string
	value?: string;

	constructor(type?: OperationType, id?: string, value?: string) {
		this.type = type;
		this.id = id;
		this.value = value;
	}
}
