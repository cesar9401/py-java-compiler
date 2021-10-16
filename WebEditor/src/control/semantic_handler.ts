import { OperationCheck } from "./operationcheck";
import { Error } from '../control/error';
import { SymbolTable } from "src/table/symbolTable";

export class SemanticHandler {
	op: OperationCheck;
	errors: Error[];
	private scope: string[];
	private tables: SymbolTable[];

	private functions: string[];

	constructor() {
		this.op = new OperationCheck(this);
		this.errors = [];
		this.scope = ["global"];
		this.tables = [];

		this.functions = [];
	}

	public get getScope(): string[] {
		return this.scope;
	}

	// agregar nuevo scope
	public push(block: string) {
		block = `${this.peek()}_${block}`;
		this.scope.push(block);
	}

	// retirar scope
	public pop() {
		this.scope.pop();
	}

	// ver ultimo scope
	public peek(): string {
		return this.scope[this.scope.length - 1];
	}

	public pushTable(table: SymbolTable) {
		this.tables.push(table);
	}

	public get getTables(): SymbolTable[] {
		return this.tables;
	}

	/* Agregar arreglo con nombre de las funciones */
	public set setFunctions(functions: string[]) {
		this.functions = functions;
	}

	/* Devolver arreglo con nombre de las funciones */
	public get getFunctions(): string[] {
		return this.functions;
	}

	/* verificar si la funcion con el id como parametro existe */
	public getFunction(id: string): boolean {
		return this.functions.some(f => f === id);
	}

	/* agregar funcion al arreglo de parametros */
	public addFunction(id: string) {
		const index = this.functions.indexOf(id);
		if(index !== -1) {
			console.log(`Sustituyendo... ${id} at index ${index}`);
			this.functions.splice(index, 1, id);
		} else {
			this.functions.push(id);
		}
	}
}
