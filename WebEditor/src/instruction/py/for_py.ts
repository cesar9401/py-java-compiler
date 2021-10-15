import { Instruction } from "src/instruction/instruction";
import { SymbolTable } from "src/table/symbolTable";
import { Quadruple } from "src/table/quadruple";
import { SemanticHandler } from "src/control/semantic_handler";
import { Variable } from "src/instruction/c/variable";
import { QuadHandler } from "src/control/quad_handler";
import { OperationPY } from "./operation_py";
import { OperationType } from "../c/operation";

export class ForPY extends Instruction {
	iterator: string;
	range: OperationPY[];
	instructions: Instruction[];

	constructor(
		line: number,
		column: number,
		iterator: string,
		range: OperationPY[],
		instructions: Instruction[]
	) {
		super(line, column);
		this.iterator = iterator;
		this.range = range;
		this.instructions = instructions;
	}

	run(table: SymbolTable, sm: SemanticHandler) {
		/* scope for */
		sm.push('for-range');
		const local = new SymbolTable(sm.peek(), table);
		sm.pushTable(local);

		const val: Variable | undefined = local.getById(this.iterator);
		if(val) {
			/* cambiar el valor y tipo de this.iterator */
			val.type = OperationType.INT;
			val.value = " ";
		} else {
			/* agregar this.iterator como variable */
			const newVal: Variable = new Variable(OperationType.INT, this.iterator, ' ');
			local.add(newVal);
		}

		/* revisar instrucciones del ciclo for-range */
		for(const instruction of this.instructions) {
			instruction.run(local, sm);
		}

		/* eliminar scope */
		sm.pop();
	}

	generate(qh: QuadHandler) {}
}
