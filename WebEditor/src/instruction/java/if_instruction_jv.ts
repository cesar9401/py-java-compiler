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

	generate(qh: QuadHandler) {
		/* etiqueta final */
		const final = qh.getLabel();

		for(const if_ of this.instructions) {
			qh.push(); /* tabla de simbolos local */
			const cond = if_.condition;
			let lt = '', lf = '';

			if(cond) {
				const quad: Quadruple | undefined = cond.generate(qh);
				lt = qh.labelTrue ? qh.labelTrue : qh.getLabel();
				lf = qh.labelFalse ? qh.labelFalse : qh.getLabel();

				/* revisar esto */
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

					case OperationType.ID:
					case OperationType.BOOL:
						if(quad) {
							/* crear condicion */
							const qd = new Quadruple(`IF_GREATER`, quad.result, "0", "");
							const goto = new Quadruple('GOTO', "", "", "");

							/* agregar a falsos y verdaderos */
							qh.addTrue(qd);
							qh.addFalse(goto);

							/* agregar cuadruplos */
							qh.addQuad(qd);
							qh.addQuad(goto);

							/* agregar etiquetas de verdadero y falso */
							qh.toTrue(lt);
							qh.toFalse(lf);

							/* etiqueta de codigo verdadero */
							qh.addQuad(new Quadruple("LABEL", "", "", lt));
						}
						break;
				}
			}

			/* generar cuadruplas de las instrucciones hijas */
			for(const instruction of if_.instructions) {
				instruction.generate(qh);
			}

			/* ir a etiqueta final */
			qh.addQuad(new Quadruple("GOTO", "", "", final));

			/* etiqueta falsa */
			if(cond && cond.type === OperationType.NOT) {
				qh.addQuad(new Quadruple("LABEL", "", "", lt));
			} else if(lf) {
				qh.addQuad(new Quadruple("LABEL", "", "", lf));
			}
			qh.pop(); /* eliminar tablad de simbolos */
		}

		/* agregar etiqueta final */
		qh.addQuad(new Quadruple("LABEL", "", "", final));
	}
}
