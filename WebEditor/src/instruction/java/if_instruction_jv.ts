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

export class IfInstructionJV extends Instruction {
	instructions: IfJV[];

	constructor(line: number, column: number, instructions: IfJV[]) {
		super(line, column);
		this.instructions = instructions;
	}

	run(table: SymbolTable, sm: SemanticHandler) {
		for(const if_ of this.instructions) {
			const condition = if_.condition;
			if(condition) {
				const val: Variable | undefined = condition.run(table, sm);
				if(!val || !val.value) {
					const desc = `En la instruccion '${if_.type.toLowerCase()}', la condicion no se puede procesar debido a que uno de los operandos no tiena valor definido o no ha sido declarado.`;
					const error = new Error(condition.line, condition.column, (val && val.id ? val.id : ""), TypeE.SEMANTICO, desc);
					sm.errors.push(error);
				}

				if(val && val?.type !== OperationType.BOOL) {
					const desc = `En la instruccion '${if_.type.toLowerCase()}', se esperaba una condicion(variable de tipo boolean), se encontro una variable de tipo '${val?.type}'.`;
					const error = new Error(condition.line, condition.column, (val && val.id ? val.id : ""), TypeE.SEMANTICO, desc);
					sm.errors.push(error);
				}
			}

			/* tabla de simbolos local */
			sm.push(if_.type.toLowerCase());
			const local = new SymbolTable(sm.peek(), table);
			sm.pushTable(local);

			for(const instruction of if_.instructions) {
				instruction.run(local, sm);
			}

			/* eliminar scope */
			sm.pop();
		}
	}

	generate(qh: QuadHandler) {}
}
