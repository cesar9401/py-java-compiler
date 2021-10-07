import { Quadruple } from "src/table/quadruple";
import { SymbolTable } from "src/table/symbolTable";

export class QuadHandler {
	private quads: Quadruple[];
	private labels: number[];
	private tmps: number[];
	private isTrue: Quadruple[];
	private isFalse: Quadruple[];
	private breaks: Quadruple[];
	private continues: Quadruple[];

	private tables: SymbolTable[];
	private stack: SymbolTable[];

	labelTrue: string | undefined;
	labelFalse: string | undefined;

	constructor(tables: SymbolTable[]) {
		this.tables = tables;
		this.quads = [];
		this.labels = [];
		this.tmps = [];
		this.isTrue = [];
		this.isFalse = [];
		this.breaks = [];
		this.continues = [];
		this.stack = [];
	}

	// obtener todos los quadruples
	public get getQuads(): Quadruple[] {
		return this.quads;
	}

	// agregar
	public addQuad(quad: Quadruple): void {
		this.quads.push(quad);
	}

	// agregar quadruples que seran verdaderos (if que van hacia codigo verdadero)
	public addTrue(quad: Quadruple): void {
		this.isTrue.push(quad);
	}

	// agregar quadruples que seran falsos (if que van hacia codigo falso)
	public addFalse(quad: Quadruple): void {
		this.isFalse.push(quad);
	}

	// cambiar verdaderos por falsos
	public switch(): void {
		const aux = [...this.isFalse];
		this.isFalse = [];

		this.isFalse = [...this.isTrue];
		this.isTrue = [...aux];
	}

	// nuevo temporal
	public getTmp(): string {
		const size = this.tmps.length + 1;
		this.tmps.push(size);
		return `t${size}`;
	}

	// nueva etiqueta
	public getLabel(): string {
		const label = this.labels.length + 1;
		this.labels.push(label);
		return `L${label}`;
	}

	// agregar etiqueta hacia codigo verdadero
	public toTrue(label: string) {
		while(this.isTrue.length > 0) {
			const tmp = this.isTrue.pop();
			if(tmp) {
				tmp.result = label;
			}
		}
	}

	// agregar etiqueta hacia codigo falso
	public toFalse(label: string) {
		while(this.isFalse.length > 0) {
			const tmp = this.isFalse.pop();
			if(tmp) {
				tmp.result = label;
			}
		}
	}

	// agregar breaks
	public addBreak(quad: Quadruple) {
		this.quads.push(quad);
		this.breaks.push(quad);
	}

	// agregar continues
	public addContinue(quad: Quadruple) {
		this.quads.push(quad);
		this.continues.push(quad);
	}

	// agregar etiqueta destino a breaks
	public addLabelToBreaks(label: string) {
		while(this.breaks.length > 0) {
			const tmp = this.breaks.pop();
			if(tmp) {
				tmp.result = label;
			}
		}
	}

	// agregar etiqueta destino a continue
	public addLabelToContinues(label: string) {
		while(this.continues.length > 0) {
			const tmp = this.continues.shift();
			if(tmp) {
				tmp.result = label;
			}
		}
	}

	public get getTables(): SymbolTable[] {
		return this.tables;
	}

	public push() {
		const t = this.tables.shift();
		if(t) {
			this.stack.push(t);
		}
	}

	public pop() {
		this.stack.pop();
	}

	public peek(): SymbolTable {
		const t = this.stack[this.stack.length - 1];
		return t;
	}
}
