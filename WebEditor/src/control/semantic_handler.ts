import { OperationCheck } from "./operationcheck";
import { Error } from '../control/error';
import { SymbolTable } from "src/table/symbolTable";
import { ClassJV } from "src/instruction/java/class_jv";
import { FunctionPY } from "src/instruction/py/function_py";

export class SemanticHandler {
	op: OperationCheck;
	errors: Error[];
	private scope: string[];
	private tables: SymbolTable[];

	/* para codigo py */
	private functions: FunctionPY[];

	/* para codigo java */
	private classTable?: SymbolTable;
	private clazz?: string;
	private methods: string[];

	private classes: ClassJV[];

	constructor() {
		this.op = new OperationCheck(this);
		this.errors = [];
		this.scope = [];
		this.tables = [];

		this.functions = [];
		this.methods = [];
		this.classes = [];
	}

	public get getScope(): string[] {
		return this.scope;
	}

	// agregar nuevo scope
	public push(block: string) {
		block = `${this.peek() ? this.peek() : ''}_${block}`;
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
	public set setFunctions(functions: FunctionPY[]) {
		this.functions = functions;
	}

	/* Devolver arreglo con nombre de las funciones */
	public get getFunctions(): FunctionPY[] {
		return this.functions;
	}

	/* verificar si la funcion con el id como parametro existe */
	public getFunction(id: string): FunctionPY | undefined {
		return this.functions.find(f => f.getId() === id);
	}

	/* obtener tabla de simbolos de la clase actual */
	public get getClassTable(): SymbolTable | undefined {
		return this.classTable;
	}

	/* setear tabla de simbolos para clase actual */
	public set setClassTable(table: SymbolTable | undefined) {
		this.classTable = table;
	}

	/* obtener nombre de la clase actual */
	public get getClazz(): string | undefined {
		return this.clazz;
	}

	/* setear nombre de la clase actual */
	public set setClazz(clazz: string | undefined) {
		this.clazz = clazz;
	}

	/* obtener listado con metodos de la clase actual */
	public get getMethods(): string[] {
		return this.methods;
	}

	public set setMethods(methods: string[]) {
		this.methods = methods;
	}

	public containMethod(method: string) {
		return this.methods.some(val => val === method);
	}

	/* clases java */
	public get getClasses(): ClassJV[] {
		return this.classes;
	}

	/* clases java */
	public set setClasses(classes: ClassJV[]) {
		this.classes = classes;
	}

	/* obtener clase segun id */
	public getClass(id: string): ClassJV | undefined {
		return this.classes.find(clazz => clazz.id === id);
	}
}
