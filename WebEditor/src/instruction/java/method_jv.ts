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

export class MethodJV extends Instruction {
	access: string;
	type: OperationType;
	id: string;
	params: ParamJV[];
	instructions: Instruction[];
	clazz?: string | undefined;

	constructor(
		line: number,
		column: number,
		access: string,
		type: OperationType,
		id: string,
		params: ParamJV[],
		instructions: Instruction[]
	) {
		super(line, column);
		this.access = access;
		this.type = type;
		this.id = id;
		this.params = params;
		this.instructions = instructions;
	}

	run(table: SymbolTable, sm: SemanticHandler) {
		this.clazz = sm.getClazz; // nombre de la clase actual
		// table -> tabla de la clase

		/* verificar si el metodo ya existe */

		/* crear tabla local para el metodo */
		sm.push(this.id);
		const local = new SymbolTable(sm.peek(), undefined);
		sm.pushTable(local);

		/* agregar variable this */
		local.add(new Variable(OperationType.INT, "this", " "));

		/* agregar parametros a la tabla de simbolos */
		for(const param of this.params) {
			param.run(local, sm);
		}

		/* ejecutar instrucciones del metodo */
		for(const instruction of this.instructions) {
			instruction.run(local, sm);
		}

		sm.pop(); // eliminar scope del metodo
	}

	generate(qh: QuadHandler) {}
}
