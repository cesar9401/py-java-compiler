import { OperationType } from "./operation";

export class Variable {
	cnst: boolean;
	type: OperationType;
	id?: string
	value?: string;
	size: number | undefined;
	pos: number | undefined;
	isArray: boolean;
	scope: string;
	access: string;
	clzz: string;

	constructor(type: OperationType, id?: string, value?: string) {
		this.type = type;
		this.id = id;
		this.value = value;

		this.cnst = false;
		this.isArray = false;
		this.access = 'public';
		this.size = 1;
		this.scope = "";
		this.clzz = "";
	}
}
