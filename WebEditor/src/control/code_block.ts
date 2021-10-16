import { Quadruple } from "src/table/quadruple";

export class CodeBlock {
	name: string;
	quads: Quadruple[];

	constructor(name: string, quads: Quadruple[]) {
		this.name = name;
		this.quads = quads;
	}
}
