import { OperationCheck } from "./operationcheck";
import { Error } from '../control/error';
import { SymbolTable } from "src/table/symbolTable";

export class SemanticHandler {
	op: OperationCheck;
	errors: Error[];
	private scope: string[];
	private tables: SymbolTable[];

	constructor() {
		this.op = new OperationCheck(this);
		this.errors = [];
		this.scope = ["global"];
		this.tables = [];
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
}
