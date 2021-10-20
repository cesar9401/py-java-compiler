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

export class ConstructorJV extends Instruction {
	access: string;
	id: string;
	params: ParamJV[];
	instructions: Instruction[];

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
		// table -> tabla de la clase

		/* verificar si el constructor ya existe */

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

	generate(qh: QuadHandler) {}
}
