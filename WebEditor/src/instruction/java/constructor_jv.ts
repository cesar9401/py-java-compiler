import { Instruction } from "src/instruction/instruction";
import { IfJV } from "./if_jv";
import { SymbolTable } from "src/table/symbolTable";
import { Quadruple } from "src/table/quadruple";
import { SemanticHandler } from "src/control/semantic_handler";
import { Variable } from "src/instruction/c/variable";
import { QuadHandler } from "src/control/quad_handler";
import { OperationJV } from "./operation_jv";
import { Error, TypeE } from 'src/control/error';
import { OperationType } from "src/instruction/c/operation";
import { ParamJV } from "./param_jv";
import { CodeBlock } from 'src/control/code_block';

export class ConstructorJV extends Instruction {
	access: string;
	id: string;
	params: ParamJV[];
	instructions: Instruction[];
	clazz?: string;

	constructor(
		line: number,
		column: number,
		access: string,
		id: string,
		params: ParamJV[],
		instructions: Instruction[]
	) {
		super(line, column);
		this.access = access;
		this.id = id;
		this.params = params;
		this.instructions = instructions;
	}

	run(table: SymbolTable, sm: SemanticHandler) {
		this.clazz = sm.getClazz; // nombre de la clase actual
		// table -> tabla de la clase

		/* verificar que el constructor tenga el mismo nombre de la clase */
		if(this.id !== this.clazz) {
			const desc = `El constructor debe tener el mismo nombre que la clase: '${this.clazz}'.`;
			const error = new Error(this.line, this.column, this.id, TypeE.SEMANTICO, desc);
			sm.errors.push(error);
		}

		/* verificar si el constructor ya existe */
		const constructorId = this.getSignature();
		if(sm.containMethod(constructorId)) {
			const desc = `El constructor con la firma '${constructorId}' ya ha sido definida.`;
			const error = new Error(this.line, this.column, this.id, TypeE.SEMANTICO, desc);
			sm.errors.push(error);
		} else {
			sm.getMethods.push(constructorId);
		}

		/* crear tabla local para el constructor */
		sm.push(this.id);
		const local = new SymbolTable(sm.peek(), undefined);
		sm.pushTable(local);

		/* agregar variable this */
		local.add(new Variable(OperationType.INT, "this", " "));

		/* agregar parametros a tabla de simbolos */
		for(const param of this.params) {
			param.run(local, sm);
		}

		/* ejecutar instrucciones del constructor */
		for(const instruction of this.instructions) {
			instruction.run(local, sm);
		}

		sm.pop(); // eliminar scope del constructor
	}

	generate(qh: QuadHandler) {
		/* tabla de la clase */
		const table = qh.getSM.getClassTable;
		qh.push();

		const tmp = qh.getTmp();
		qh.addQuad(new Quadruple("PLUS", "ptr", "0", tmp, OperationType.INT));
		qh.addQuad(new Quadruple("ASSIGN", "h", "", `stack[${tmp}]`));

		/* reservar espacion en stack's para las variables de la clase */
		//console.log(table);
		if(table) {
			for(const variable of table) {
				if(variable.pos !== undefined) {
					const t1 = qh.getTmp();
					const dest = this.getNameStack(variable.type);
					qh.addQuad(new Quadruple("PLUS", "h", variable.pos?.toString(), t1, OperationType.INT));
					qh.addQuad(new Quadruple("ASSIGN", `${dest[1]}`, '', `heap[${t1}]`));
					qh.addQuad(new Quadruple("PLUS", `${dest[1]}`, '1', `${dest[1]}`));
				}
			}
		}

		qh.addQuad(new Quadruple("PLUS", "h", `${table?.length}`, "h"));

		/* generar instrucciones hijas */
		for(const instruction of this.instructions) {
			instruction.generate(qh);
		}

		qh.pop();

		/* crear nuevo bloque de codigo */
		qh.addCodeBlock(new CodeBlock(this.getId(), qh.getQuads));
		qh.cleanQuads();
	}

	public getId():string {
		let constructorId = `${this.clazz}_${this.id}`
		for(const param of this.params) {
			constructorId += `_${param.type.toLowerCase()}`;
		}
		return constructorId;
	}

	public getSignature(): string {
		let sign = `${this.clazz}(`;
		for(let i = 0; i < this.params.length; i++) {
			sign += this.params[i].type.toLowerCase();
			sign += i !== this.params.length - 1 ? ',' : '';
		}
		sign += `)`;
		return sign;
	}

	private getNameStack(type: OperationType) {
		switch(type) {
			case OperationType.INT:
			case OperationType.BOOL:
			return [`stack_n[ptr_n]`, `ptr_n`, `stack_n`];
			case OperationType.FLOAT:
				return [`stack_f[ptr_f]`, `ptr_f`, `stack_f`];
			case OperationType.STRING:
				return [`stack_s[ptr_s]`, `ptr_s`, `stack_s`];
			case OperationType.CHAR:
				return [`stack_c[ptr_c]`, `ptr_c`, `stack_c`];
		}
		return [];
	}
}
