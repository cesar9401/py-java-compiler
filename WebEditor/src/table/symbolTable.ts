import { Variable } from "../instruction/variable";

export class SymbolTable {
	private list: Variable[];
	private father: Variable[];

	constructor(father?: Variable[]) {
		this.list = [];
		if(father) {
			this.father = father;
		} else {
			this.father = [];
		}
	}

	add(variable: Variable): void{
		this.list.push(variable);

		// agregar a padre
		variable.size = 1;
		if(this.father.length > 0) {
			const n = this.father.length - 1;
			const last = this.father[n];
			if(last && last.pos !== undefined && last.size !== undefined) {
				variable.pos = last.pos + last.size;
			}
		} else {
			variable.pos = 0;
		}
		this.father.push(variable);
	}

	getById(id: string): Variable | undefined {
		return this.list.find(v=> v.id == id);
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

	// retornar tabla de simbolos principal
	public get getFather(): Variable[] {
		return this.father;
	}
}
