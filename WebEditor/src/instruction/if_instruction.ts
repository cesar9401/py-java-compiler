import { Instruction } from "./instruction";
import { If } from "./if";
import { SymbolTable } from "src/table/symbolTable";
import { Quadruple } from "src/table/quadruple";
import { SemanticHandler } from "src/control/semantic_handler";
import { Variable } from "./variable";
import { Error, TypeE } from "src/control/error";
import { QuadHandler } from "src/control/quad_handler";
import { Operation, OperationType } from "./operation";

export class IfInstruction extends Instruction {
	instructions:If[];

	constructor(line:number, column:number, instructions:If[]) {
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
			}

			// tabla de simbolos local
			sm.push(`${if_.type.toLowerCase()}`); // agregar scope if
			const local = new SymbolTable(sm.peek(), table);
			sm.pushTable(local);

			const tmp: Instruction[] = if_.instructions;
			for(const instruction of tmp) {
				instruction.run(local, sm);
			}

			sm.pop(); // eliminar scope
		}
	}

	generate(qh: QuadHandler) {
		const final = qh.getLabel();
		for(const if_ of this.instructions) {
			qh.push();// agregar tabla
			const cond = if_.condition;
			let lt = "";
			let lf = "";

			if(cond) {
				const quad: Quadruple | undefined = cond.generate(qh);
				lt = qh.labelTrue ? qh.labelTrue : qh.getLabel();
				lf = qh.labelFalse ? qh.labelFalse : qh.getLabel();

				qh.labelTrue = undefined;
				qh.labelFalse = undefined;
				switch(cond.type) {
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

						qh.addQuad(new Quadruple("LABEL", "", "", lt));
						break;

					case OperationType.NOT:
						qh.toTrue(lf);
						qh.toFalse(lt);

						qh.addQuad(new Quadruple("LABEL", "", "", lf));
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

							qh.addQuad(new Quadruple("LABEL", "", "", lt));
						}
						break;
				}
			}

			for(const ins of if_.instructions) {
				ins.generate(qh);
			}

			// ir a etiqueta final
			qh.addQuad(new Quadruple("GOTO", "", "", final));

			// etiqueta false
			if(cond && cond.type === OperationType.NOT) {
				qh.addQuad(new Quadruple("LABEL", "", "", lt));
			} else if(lf) {
				qh.addQuad(new Quadruple("LABEL", "", "", lf));
			}
			qh.pop(); // devolver tabla
		}

		// etiqueta final
		qh.addQuad(new Quadruple("LABEL", "", "", final));
	}
}
