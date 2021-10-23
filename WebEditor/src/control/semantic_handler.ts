import { OperationCheck } from "./operationcheck";
import { Error, TypeE } from '../control/error';
import { SymbolTable } from "src/table/symbolTable";
import { ClassJV } from "src/instruction/java/class_jv";
import { FunctionPY } from "src/instruction/py/function_py";
import { OperationType } from "src/instruction/c/operation";
import { Instruction } from "src/instruction/instruction";
import { MethodJV } from "src/instruction/java/method_jv";
import { IfInstructionJV } from "src/instruction/java/if_instruction_jv";
import { DoWhileJV } from "src/instruction/java/do_while_jv";
import { ForJV } from "src/instruction/java/for_jv";
import { WhileJV } from "src/instruction/java/while_jv";
import { SwitchJV } from "src/instruction/java/switch_jv";
import { ReturnJV } from "src/instruction/java/return_jv";
import { Continue } from "src/instruction/c/continue";
import { Break } from "src/instruction/c/break";

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
	private type?: OperationType;

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

	/* obtener tipo del metodo actual java */
	public get getType(): OperationType | undefined {
		return this.type;
	}

	/* actualizar tipo del metodo actual java */
	public set setType(type: OperationType | undefined) {
		this.type = type;
	}

	/* revisar instruccion return en funciones con retorno */
	public checkReturn(instruction: Instruction) {
		if(instruction instanceof MethodJV) {
			/* instrucciones hijas */
			const inst = instruction.instructions;
			const value = this.checkReturnInAst(inst, true, true);
			/* no tiene return */
			if(!value) {
				const desc = `El metodo con firma '${instruction.getSignature()}', de tipo '${instruction.type}' no posee declaracion de retorno(return).`;
				const error = new Error(instruction.line, instruction.column, instruction.id, TypeE.SEMANTICO, desc);
				this.errors.push(error);
			}
		}
	}

	/* revisar instruccion return en funciones con retorno */
	public checkReturnInAst(instructions: Instruction[], ignoreContinue: boolean, ignoreBreak: boolean): boolean {
		for(let i = 0; i < instructions.length; i++) {
			const current = instructions[i];
			if(current instanceof IfInstructionJV) {
				const len = current.instructions.length;
				let aux = current
				let value = current.instructions[len - 1].type === 'else';

				/* revisar if_jv */
				for(let j = 0; j < len; j++) {
					const tmp = aux.instructions[j].instructions;
					let val = this.checkReturnInAst(tmp, ignoreContinue, ignoreBreak);
					value = value && val;
				}

				if(value) {
					/* instrucciones despues de return no se ejecutan */
					for(let j = i + 1; j < instructions.length; j++) {
						const desc = `La instruccion en la linea ${instructions[j].line}, no puede ser ejecutada por tener una instruccion return antes.`;
						const error = new Error(instructions[j].line, instructions[j].column, "", TypeE.SEMANTICO, desc);
						this.errors.push(error);
					}
					return true;
				}
			}

			if(current instanceof DoWhileJV) {
				const tmp = current.instructions;
				const value = this.checkReturnInAst(tmp, false, false);
				if(value) {
					/* instrucciones despues de return no se ejecutan */
					for(let j = i + 1; j < instructions.length; j++) {
						const desc = `La instruccion en la linea ${instructions[j].line}, no puede ser ejecutada por tener una instruccion return antes.`;
						const error = new Error(instructions[j].line, instructions[j].column, "", TypeE.SEMANTICO, desc);
						this.errors.push(error);
					}
					return true;
				}
			}

			if(current instanceof ForJV) {
				this.checkReturnInAst(current.instructions, false, false);
			}

			if(current instanceof WhileJV) {
				this.checkReturnInAst(current.instructions, false, false);
			}

			if(current instanceof SwitchJV) {
				const cases = current.cases;
				for(const c of cases) {
					this.checkReturnInAst(c.instructions, true, false);
				}
			}

			if(current instanceof ReturnJV) {
				for(let j = i + 1; j < instructions.length; j++) {
					const desc = `La instruccion en la linea ${instructions[j].line}, no puede ser ejecutada por tener una instruccion return antes.`;
					const error = new Error(instructions[j].line, instructions[j].column, "", TypeE.SEMANTICO, desc);
					this.errors.push(error);
				}
				return true;
			}

			if(current instanceof Continue && !ignoreContinue) {
				return false;
			}

			if(current instanceof Break && !ignoreBreak) {
				return false;
			}
		}

		return false;
	}

	/* revisar instrucciones break, continue y return donde no van */
	public checkAst(instructions: Instruction[], break_: boolean, continue_: boolean, return_: boolean) {
		for(const inst of instructions) {
			if(inst instanceof ForJV) {
				this.checkAst(inst.instructions, false, false, return_);
			}

			if(inst instanceof WhileJV) {
				this.checkAst(inst.instructions, false, false, return_);
			}

			if(inst instanceof DoWhileJV) {
				this.checkAst(inst.instructions, false, false, return_);
			}

			if(inst instanceof IfInstructionJV) {
				for(const if_ of inst.instructions) {
					this.checkAst(if_.instructions, break_, continue_, return_);
				}
			}

			if(inst instanceof SwitchJV) {
				for(const c of inst.cases) {
					this.checkAst(c.instructions, false, true, return_);
				}
			}

			if(inst instanceof Break && break_) {

			}

			if(inst instanceof Continue && continue_) {

			}

			if(inst instanceof ReturnJV && return_) {

			}
		}
	}
}
