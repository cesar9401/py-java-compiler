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
import { For } from "src/instruction/c/for";
import { While } from "src/instruction/c/while";
import { DoWhile } from "src/instruction/c/do_while";
import { IfInstruction } from "src/instruction/c/if_instruction";
import { Switch } from "src/instruction/c/switch";
import { ForPY } from "src/instruction/py/for_py";
import { WhilePY } from "src/instruction/py/while_py";
import { IfInstructionPY } from "src/instruction/py/if_instruction_py";
import { ReturnPY } from "src/instruction/py/return_py";

export class SemanticHandler {
	op: OperationCheck;
	errors: Error[];
	private scope: string[];
	private tables: SymbolTable[];

	/* para codigo py */
	private functions: FunctionPY[];

	/* para codigo java */
	private classTable?: SymbolTable;
	private clazz?: ClassJV;
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
	public get getClazz(): ClassJV | undefined {
		return this.clazz;
	}

	/* setear nombre de la clase actual */
	public set setClazz(clazz: ClassJV | undefined) {
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

	/* revisar instruccion return en funciones con retorno JV*/
	public checkReturnJV(instruction: Instruction) {
		if(instruction instanceof MethodJV) {
			/* instrucciones hijas */
			const inst = instruction.instructions;
			const value = this.checkReturnInAstJV(inst, true, true);
			/* no tiene return */
			if(!value) {
				const desc = `El metodo con firma '${instruction.getSignature()}', de tipo '${instruction.type}' no posee declaracion de retorno(return).`;
				const error = new Error(instruction.line, instruction.column, instruction.id, TypeE.SINTACTICO, desc);
				this.errors.push(error);
			}
		}
	}

	/* revisar instruccion return en funciones con retorno JV */
	public checkReturnInAstJV(instructions: Instruction[], ignoreContinue: boolean, ignoreBreak: boolean): boolean {
		for(let i = 0; i < instructions.length; i++) {
			const current = instructions[i];
			if(current instanceof IfInstructionJV) {
				const len = current.instructions.length;
				let aux = current
				let value = current.instructions[len - 1].type === 'else';

				/* revisar if_jv */
				for(let j = 0; j < len; j++) {
					const tmp = aux.instructions[j].instructions;
					let val = this.checkReturnInAstJV(tmp, ignoreContinue, ignoreBreak);
					value = value && val;
				}

				if(value) {
					/* instrucciones despues de return no se ejecutan */
					for(let j = i + 1; j < instructions.length; j++) {
						const desc = `La instruccion en la linea ${instructions[j].line}, no puede ser ejecutada por tener una instruccion return antes.`;
						const error = new Error(instructions[j].line, instructions[j].column, "", TypeE.SINTACTICO, desc);
						this.errors.push(error);
					}
					return true;
				}
			}

			if(current instanceof DoWhileJV) {
				const tmp = current.instructions;
				const value = this.checkReturnInAstJV(tmp, false, false);
				if(value) {
					/* instrucciones despues de return no se ejecutan */
					for(let j = i + 1; j < instructions.length; j++) {
						const desc = `La instruccion en la linea ${instructions[j].line}, no puede ser ejecutada por tener una instruccion return antes.`;
						const error = new Error(instructions[j].line, instructions[j].column, "", TypeE.SINTACTICO, desc);
						this.errors.push(error);
					}
					return true;
				}
			}

			if(current instanceof ForJV) {
				this.checkReturnInAstJV(current.instructions, false, false);
			}

			if(current instanceof WhileJV) {
				this.checkReturnInAstJV(current.instructions, false, false);
			}

			if(current instanceof SwitchJV) {
				const cases = current.cases;
				for(const c of cases) {
					this.checkReturnInAstJV(c.instructions, true, false);
				}
			}

			if(current instanceof ReturnJV) {
				for(let j = i + 1; j < instructions.length; j++) {
					const desc = `La instruccion en la linea ${instructions[j].line}, no puede ser ejecutada por tener una instruccion return antes.`;
					const error = new Error(instructions[j].line, instructions[j].column, "", TypeE.SINTACTICO, desc);
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

	/* revisar instrucciones break, continue y return donde no van JV */
	public checkAstJV(instructions: Instruction[], break_: boolean, continue_: boolean, return_: boolean) {
		for(const inst of instructions) {
			if(inst instanceof ForJV) {
				this.checkAstJV(inst.instructions, false, false, return_);
			}

			if(inst instanceof WhileJV) {
				this.checkAstJV(inst.instructions, false, false, return_);
			}

			if(inst instanceof DoWhileJV) {
				this.checkAstJV(inst.instructions, false, false, return_);
			}

			if(inst instanceof IfInstructionJV) {
				for(const if_ of inst.instructions) {
					this.checkAstJV(if_.instructions, break_, continue_, return_);
				}
			}

			if(inst instanceof SwitchJV) {
				for(const c of inst.cases) {
					this.checkAstJV(c.instructions, false, true, return_);
				}
			}

			if(inst instanceof Break && break_) {
				const desc = `La instruccion 'break' unicamente debe incluirse dentro de ciclos o dentro de una instruccion 'switch'.`;
				const error = new Error(inst.line, inst.column, 'break', TypeE.SINTACTICO, desc);
				this.errors.push(error);
			}

			if(inst instanceof Continue && continue_) {
				const desc = `La instruccion 'continue' unicamente debe incluirse dentro de ciclos.`;
				const error = new Error(inst.line, inst.column, 'continue', TypeE.SINTACTICO, desc);
				this.errors.push(error);
			}

			if(inst instanceof ReturnJV && return_) {
				const desc = `La instruccion 'return' unicamente debe incluirse dentro de metodos que tengan un tipo de retorno.`;
				const error = new Error(inst.line, inst.column, 'return', TypeE.SINTACTICO, desc);
				this.errors.push(error);
			}
		}
	}

	/* revisar instrucciones break, continue y return donde no van en lenguaje con sintaxis c */
	public checkAstProgram(instruccions: Instruction[], break_: boolean, continue_: boolean) {
		for(const inst of instruccions) {
			if(inst instanceof For) {
				this.checkAstProgram(inst.instructions, false, false);
			}

			if(inst instanceof While) {
				this.checkAstProgram(inst.instructions, false, false);
			}

			if(inst instanceof DoWhile) {
				this.checkAstProgram(inst.instructions, false, false);
			}

			if(inst instanceof IfInstruction) {
				for(const if_ of inst.instructions)
				this.checkAstProgram(if_.instructions, break_, continue_);
			}

			if(inst instanceof Switch) {
				for(const c of inst.cases) {
					this.checkAstProgram(c.instructions, false, true);
				}
			}

			if(inst instanceof Break && break_) {
				const desc = `La instruccion 'break' unicamente debe incluirse dentro de ciclos o dentro de una instruccion 'switch'.`;
				const error = new Error(inst.line, inst.column, 'break', TypeE.SINTACTICO, desc);
				this.errors.push(error);
			}

			if(inst instanceof Continue && continue_) {
				const desc = `La instruccion 'continue' unicamente debe incluirse dentro de ciclos.`;
				const error = new Error(inst.line, inst.column, 'continue', TypeE.SINTACTICO, desc);
				this.errors.push(error);
			}
		}
	}

	/* revisar si existe return en funcion py */
	public checkIfIsThereReturnPY(instructions: Instruction[], ignoreContinue: boolean, ignoreBreak: boolean): boolean {
		for(const inst of instructions) {

			if(inst instanceof ForPY) {
				const value = this.checkIfIsThereReturnPY(inst.instructions, false, false);
				if(value) {
					return value;
				}
			}

			if(inst instanceof WhilePY) {
				const value = this.checkIfIsThereReturnPY(inst.instructions, false, false);
				if(value) {
					return value;
				}
			}

			if(inst instanceof IfInstructionPY) {
				for(const if_ of inst.instructions) {
					const value = this.checkIfIsThereReturnPY(if_.instructions, ignoreContinue, ignoreBreak);
					if(value) {
						return value;
					}
				}
			}

			if(inst instanceof Continue && !ignoreContinue) {
				return false;
			}

			if(inst instanceof Break && !ignoreBreak) {
				return false;
			}

			if(inst instanceof ReturnPY) {
				return true;
			}
		}
		return false;
	}

	/* revisar instrucciones break, continue y return donde no van en lenguaje con sintaxis python */
	public checkAstPY(instructions: Instruction[], break_: boolean, continue_: boolean, return_: boolean) {
		for(const inst of instructions) {
			if(inst instanceof ForPY) {
				this.checkAstPY(inst.instructions, false, false, return_);
			}

			if(inst instanceof WhilePY) {
				this.checkAstPY(inst.instructions, false, false, return_);
			}

			if(inst instanceof IfInstructionPY) {
				for(const if_ of inst.instructions) {
					this.checkAstPY(if_.instructions, break_, continue_, return_);
				}
			}

			if(inst instanceof Break && break_) {
				const desc = `La instruccion 'break' unicamente debe incluirse dentro de ciclos o dentro de una instruccion 'switch'.`;
				const error = new Error(inst.line, inst.column, 'break', TypeE.SINTACTICO, desc);
				this.errors.push(error);
			}

			if(inst instanceof Continue && continue_) {
				const desc = `La instruccion 'continue' unicamente debe incluirse dentro de ciclos.`;
				const error = new Error(inst.line, inst.column, 'continue', TypeE.SINTACTICO, desc);
				this.errors.push(error);
			}

			if(inst instanceof ReturnPY && return_) {
				const desc = `La instruccion 'return' unicamente debe incluirse dentro de metodos que tengan un tipo de retorno.`;
				const error = new Error(inst.line, inst.column, 'return', TypeE.SINTACTICO, desc);
				this.errors.push(error);
			}
		}
	}
}
