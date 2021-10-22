import { Instruction } from "src/instruction/instruction";
import { SymbolTable } from "src/table/symbolTable";
import { Quadruple } from "src/table/quadruple";
import { SemanticHandler } from "src/control/semantic_handler";
import { QuadHandler } from "src/control/quad_handler";
import { Variable } from "./variable";
import { Operation, OperationType } from "./operation";
import { Error, TypeE } from "src/control/error";

export class DoWhile extends Instruction {
	operation: Operation;
	instructions: Instruction[];

	constructor(line: number, column: number, operation: Operation, instructions: Instruction[]) {
		super(line, column);
		this.operation = operation;
		this.instructions = instructions;
	}

	run(table:SymbolTable, sm: SemanticHandler) {
		const val: Variable | undefined = this.operation.run(table, sm);
		if(!val || !val.value) {
			const desc = `En la instruccion 'do-while', la condicion no se puede procesar debido a que uno de los operandos no tiena valor definido o no ha sido declarado.`;
			const error = new Error(this.line, this.column, val && val.id ? val.id : "", TypeE.SEMANTICO, desc);
		}

		if(val?.type === OperationType.STRING) {
			const desc = `En la instruccion 'do-while', la condicion no puede ser de tipo string`;
			const error = new Error(this.line, this.column, val?.value ? val.value : "", TypeE.SEMANTICO, desc);
			sm.errors.push(error);
		}

		sm.push('do-while'); //agregar scope
		const local = new SymbolTable(sm.peek(), table);
		sm.pushTable(local);

		for(const instruction of this.instructions) {
			instruction.run(local, sm);
		}

		sm.pop(); // eliminar scope
	}

	generate(qh: QuadHandler) {
		qh.push();

		// etiqueta inicial
		const l1 = new Quadruple("LABEL", "", "", "");
		qh.addQuad(l1);

		// ejecutar instrucciones
		for(const instruction of this.instructions) {
			instruction.generate(qh);
		}

		// generar condicion
		const quad: Quadruple | undefined = this.operation.generate(qh);
		const lt = qh.labelTrue ? qh.labelTrue : qh.getLabel();
		const lf = qh.labelFalse ? qh.labelFalse : qh.getLabel();

		qh.labelTrue = undefined;
		qh.labelFalse = undefined;

		// agregar etiqueta para breaks
		qh.addLabelToBreaks(this.operation.type === OperationType.NOT ? lt : lf);

		// agregar etiqueta para continues
		qh.addLabelToContinues(this.operation.type === OperationType.NOT ? lf : lt);

		switch(this.operation.type) {
			case OperationType.AND:
			case OperationType.OR:
			case OperationType.SMALLER:
			case OperationType.GREATER:
			case OperationType.SMALLER_EQ:
			case OperationType.GREATER_EQ:
			case OperationType.EQEQ:
			case OperationType.NEQ:
				qh.toTrue(lt);
				qh.toFalse(lf);

				// indicar nombre a etiqueta inicial/true
				l1.result = lt;

				// label false
				qh.addQuad(new Quadruple("LABEL", "", "", lf));
				break;

			case OperationType.NOT:
				qh.toTrue(lf);
				qh.toFalse(lt);

				l1.result = lf;

				qh.addQuad(new Quadruple("LABEL", "", "", lt));
				break;

			case OperationType.INT:
			case OperationType.FLOAT:
			case OperationType.CHAR:
			case OperationType.ID:
			case OperationType.SUM:
			case OperationType.SUB:
			case OperationType.MUL:
			case OperationType.DIV:
			case OperationType.MOD:
			case OperationType.POW:
			case OperationType.UMINUS:
				if(quad) {
					// crear condicion
					const qd = new Quadruple(`IF_GREATER`, quad.result, "0", "");
					const goto = new Quadruple('GOTO', "", "", "");

					// agregar falsos y verdaderos
					qh.addTrue(qd);
					qh.addFalse(goto);

					// agregar cuadruplos
					qh.addQuad(qd);
					qh.addQuad(goto);

					// agregar etiquetas para verdadero y falso
					qh.toTrue(lt);
					qh.toFalse(lf);

					// indicar nombre a label inicial/true
					l1.result = lt;

					// label false
					qh.addQuad(new Quadruple("LABEL", "", "", lf));
				}
				break;
		}

		qh.pop();
	}
}
