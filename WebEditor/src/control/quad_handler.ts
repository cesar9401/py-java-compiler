import { OperationType } from "src/instruction/c/operation";
import { ClassJV } from "src/instruction/java/class_jv";
import { Quadruple } from "src/table/quadruple";
import { SymbolTable } from "src/table/symbolTable";
import { CodeBlock } from "./code_block";
import { SemanticHandler } from "./semantic_handler";

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

	private sm: SemanticHandler;
	private blocks: CodeBlock[];

	private quadReturn?: Quadruple;
	private returns: Quadruple[];

	private tmpClazz?: ClassJV;

	constructor(sm: SemanticHandler, blocks: CodeBlock[]) {
		this.sm = sm;
		this.blocks = blocks;

		this.tables = sm.getTables;
		this.quads = [];
		this.labels = [];
		this.tmps = [];
		this.isTrue = [];
		this.isFalse = [];
		this.breaks = [];
		this.continues = [];
		this.stack = [];
		this.returns = [];
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

	public get getSM(): SemanticHandler {
		return this.sm;
	}

	// hacer que las variables tengan tipo void (PY)
	public setVoid(table: SymbolTable) {
		table.forEach(val => val.type = OperationType.VOID);
	}

	public getQuadByResult(result: string): Quadruple | undefined {
		this.quads.find(q => q.result === result);
		return;
	}

	/* agregar bloque de codigo */
	public addCodeBlock(block: CodeBlock) {
		const element = this.blocks.find(b => b.name === block.name);
		let index = element ? this.blocks.indexOf(element) : -1;
		if(index !== -1) {
			console.log('sustituyendo:', element, '->', block)
			// console.log(`Sustituyendo... ${element} at index ${index}`);
			this.blocks.splice(index, 1, block);
		} else {
			this.blocks.push(block);
		}
	}

	public cleanQuads() {
		this.quads = [];
	}

	/* clase temporal, no sere undefined cuando se ejecute el metodo generate de la clase */
	public set setTmpClazz(tmpClazz: ClassJV | undefined) {
		this.tmpClazz = tmpClazz;
	}

	public get getTmpClazz(): ClassJV | undefined {
		return this.tmpClazz;
	}
	/* clase temporal, no sere undefined cuando se ejecute el metodo generate de la clase */

	/* agregar y obtener quad para return */
	public set setQuadReturn(quadReturn: Quadruple | undefined) {
		this.quadReturn = quadReturn;
	}

	public get getQuadReturn(): Quadruple | undefined {
		return this.quadReturn;
	}

	/* etiquetas goto para despues de returns */
	public addReturns(quad: Quadruple) {
		this.returns.push(quad);
		this.quads.push(quad);
	}

	public addLabelToReturns(label: string) {
		while(this.returns.length > 0) {
			const tmp = this.returns.shift();
			if(tmp) {
				tmp.result = label;
			}
		}
	}
}
