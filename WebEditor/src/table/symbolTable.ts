import { Variable } from "src/instruction/c/variable";

export class SymbolTable extends Array<Variable>{
	scope: string;

	constructor(scope: string, table?: SymbolTable) {
		super();
		this.scope = scope;
		if(table) {
			table.forEach(v => this.push(v));
		}
	}

	add(variable: Variable): void{
		variable.scope = this.scope;
		// variable.size = 1;

		if(this.length > 0) {
			const n = this.length - 1;
			const prev = this[n];
			if(prev && prev.pos !== undefined && prev.size !== undefined) {
				variable.pos = prev.pos + prev.size;
			}
		} else {
			variable.pos = 0;
		}

		this.push(variable);
	}

	getById(id: string): Variable | undefined {
		return this.find(v=> v.id == id);
	}

	contains(id: string) : boolean {
		return this.some(v => v.id && v.id === id);
	}
}
