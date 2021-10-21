import { Instruction } from "src/instruction/instruction";
import { SymbolTable } from "src/table/symbolTable";
import { Quadruple } from "src/table/quadruple";
import { SemanticHandler } from "src/control/semantic_handler";
import { QuadHandler } from "src/control/quad_handler";
import { Operation, OperationType } from "src/instruction/c/operation";
import { Error, TypeE } from "src/control/error";
import { Variable } from "src/instruction/c/variable";
import { AssignmentJV } from "./assignment_jv";
import { StatementJV } from "./statement_jv";
import { OperationJV } from "./operation_jv";

export class ForJV extends Instruction {
	init?: StatementJV;
	init1?: AssignmentJV;
	condition: OperationJV;
	assign: AssignmentJV;
	instructions: Instruction[];

	constructor(
		line: number,
		column: number,
		condition: OperationJV,
		assign: AssignmentJV,
		instructions: Instruction[],
		init?: StatementJV,
		init1?: AssignmentJV
	) {
		super(line, column);
		this.condition = condition;
		this.assign = assign;
		this.instructions = instructions;
		this.init = init;
		this.init1 = init1;
	}

	run(table: SymbolTable, sm: SemanticHandler) {
		/* agregar scope */
		sm.push('for');
		const local = new SymbolTable(sm.peek(), table);
		sm.pushTable(local);

		if(this.init) {
			/* revisar declaracion/asignacion ciclo for */
			this.init.run(local, sm);
		} else if(this.init1) {
			/* revisar asignacion */
			this.init1.run(local, sm);
			const id = this.init1.id;
			const val: Variable | undefined = local.getById(id);
			if(val && val.type === OperationType.INT) {
				const desc = `En la declaracion de la instruccion 'for', se esperaba una asignacion de variable de tipo entero, se encontro variable de tipo: ${val.type}`;
				const error = new Error(this.line, this.column, id, TypeE.SEMANTICO, desc);
				sm.errors.push(error);
			}
		}

		/* revisar operacion y/o condicion */
		const cond: Variable | undefined = this.condition.run(local, sm);
		if(!cond ||!cond.value) {
			/* variable no tiene valor */
			const desc = `En la instruccion 'for', la condicion no se puede procesar debido a que uno de los operandos no tiena valor definido o no ha sido declarado.`;
			const error = new Error(this.condition.line, this.condition.column, this.condition.variable?.id ? this.condition.variable?.id : "", TypeE.SEMANTICO, desc);
			sm.errors.push(error);
		}

		if(cond && cond?.type !== OperationType.BOOL) {
			const desc = `En la instruccion 'for', se esperaba una condicion(variable de tipo boolean), se encontro una variable de tipo '${cond?.type}'.`;
			const error = new Error(this.condition.line, this.condition.column, (cond && cond.id ? cond.id : ""), TypeE.SEMANTICO, desc);
			sm.errors.push(error);
		}

		/* revisar asignacion o accion de incremento/decremento */
		this.assign.run(local, sm);

		/* revisar instrucciones del ciclo for */
		for(const instruction of this.instructions) {
			instruction.run(local, sm);
		}

		/* eliminar scope */
		sm.pop();
	}

	generate(qh: QuadHandler) {}
}
