import { Variable } from "../instruction/variable";

export class SymbolTable {
	private list: Variable[];

	constructor() {
		this.list = [];
	}

	add(variable: Variable): void{
		this.list.push(variable);
	}

	getById(id: string): Variable | undefined {
		return this.list.find(v=> v.id && v.id === id);
	}

	contains(id: string) : boolean {
		return this.list.some(v => v.id && v.id === id);
	}

	addAll(list: Variable[]): void {
		this.list = [...this.list, ...list];
	}

	getTable(): Variable[] {
		return this.list;
	}
}
