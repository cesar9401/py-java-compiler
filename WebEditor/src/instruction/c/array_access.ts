import { Operation } from "./operation";

export class ArrayAccess {
	id: string;
	dimensions: Operation[];

	constructor(id: string, dimensions: Operation[]) {
		this.id = id;
		this.dimensions = dimensions;
	}
}
