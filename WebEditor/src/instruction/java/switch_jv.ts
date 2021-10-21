import { Instruction } from "../instruction";
import { SymbolTable } from "src/table/symbolTable";
import { Quadruple } from "src/table/quadruple";
import { SemanticHandler } from "src/control/semantic_handler";
import { QuadHandler } from "src/control/quad_handler";
import { Operation, OperationType } from "src/instruction/c/operation";
import { Variable } from "src/instruction/c/variable";
import { OperationJV } from "./operation_jv";
import { Error, TypeE } from "src/control/error";
import { CaseJV } from "./case_jv";

export class SwitchJV extends Instruction {
	operation: OperationJV;
	cases: CaseJV[];

	constructor(line: number, column: number, operation: OperationJV, cases: CaseJV[]) {
		super(line, column);
		this.operation = operation;
		this.cases = cases;
	}

	run(table: SymbolTable, sm: SemanticHandler) {
		/* revisar valor a evaluar */
		const val: Variable | undefined = this.operation.run(table, sm);
		if(!val || !val.value) {
			const desc = `En la instruccion 'switch', no se puede procesar el valor a evaluar debido a que uno de los operadores no tiene un valor definido o no ha sido declarado.`;
			const error = new Error(this.line, this.column, val && val.id ? val.id : "", TypeE.SEMANTICO, desc)
			sm.errors.push(error);
		}

		for(const cs of this.cases) {
			const value: OperationJV | undefined = cs.operation;
			if(value && val) {
				const comp: Variable | undefined = value.run(table, sm);
				if(comp && comp.value !== undefined) {
					if(comp.type !== val.type) {
						/* no son del mismo tipo */
						const desc = `En la definicion de la instruccion 'case', se esperaba una variable de tipo '${val.type}', se encontro una variable de tipo '${comp.type}'.`;
						const error = new Error(value.line, value.column, comp.id ? comp.id : "", TypeE.SEMANTICO, desc);
						sm.errors.push(error);
					}
				} else {
					const desc = `En la instruccion 'case', no se puede procesar el valor a evaluar debido a que uno de los operadores no tiene un valor definido o no ha sido declarado.`;
					const error = new Error(cs.line, cs.column, "", TypeE.SEMANTICO, desc);
					sm.errors.push(error);
				}
			}

			/* agregar scope para case */
			sm.push(`case`);
			const local = new SymbolTable(sm.peek(), table);
			sm.pushTable(local);

			/* verificar instrucciones de cada case */
			for(const instruction of cs.instructions) {
				instruction.run(local, sm);
			}

			/* eliminar scope de case */
			sm.pop();
		}
	}

	generate(qh: QuadHandler) {}
}
