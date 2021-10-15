import { Instruction } from "src/instruction/instruction";
import { SymbolTable } from "src/table/symbolTable";
import { Quadruple } from "src/table/quadruple";
import { SemanticHandler } from "src/control/semantic_handler";
import { Variable } from "src/instruction/c/variable";
import { QuadHandler } from "src/control/quad_handler";
import { OperationPY } from "./operation_py";
import { Error, TypeE } from 'src/control/error';
import { OperationType } from "../c/operation";

export class WhilePY extends Instruction {
	condition: OperationPY;
	instructions: Instruction[];

	constructor(line: number, column: number, condition: OperationPY, instructions: Instruction[]) {
		super(line, column);
		this.condition = condition;
		this.instructions = instructions;
	}

	run(table: SymbolTable, sm: SemanticHandler) {
		const val: Variable | undefined = this.condition.run(table, sm);
		if(!val || !val.value) {
			const desc = `En la instruccion 'while', la condicion no se puede procesar debido a que uno de los operandos no tiena valor definido o no ha sido declarado.`;
			const error = new Error(this.line, this.column, val && val.id ? val.id : "", TypeE.SEMANTICO, desc);
			sm.errors.push(error);
		}

		/* scope while */
		sm.push('while');
		const local = new SymbolTable(sm.peek(), table);
		sm.pushTable(local);

		for(const instruction of this.instructions) {
			instruction.run(local, sm);
		}

		/* eliminar scope while */
		sm.pop();
	}

	generate(qh: QuadHandler) {
		qh.push();

		/* etiqueta inicial */
		const l1 = qh.getLabel();
		qh.addQuad(new Quadruple("LABEL", "", "", l1));

		/* condicion */
		const quad: Quadruple | undefined = this.condition.generate(qh);

		/* etiquetas para codigo verdadero y codigo falso */
		const lt = qh.labelTrue ? qh.labelTrue : qh.getLabel();
		const lf = qh.labelFalse ? qh.labelFalse : qh.getLabel();

		/* revisar esto */
		qh.labelTrue = undefined;
		qh.labelFalse = undefined;

		switch(this.condition.type) {
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

				// label true
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
			case OperationType.BOOL: /* expresiones booleanas */
			case OperationType.STRING: /* cadenas de caracteres */
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

		for(const instruction of this.instructions) {
			instruction.generate(qh);
		}

		/* goto etiqueta inicial */
		qh.addQuad(new Quadruple("GOTO", "", "", l1));

		/* etiqueta para codigo falso */
		const labelF = this.condition.type === OperationType.NOT ? lt : lf;

		// etiqueta codigo falso
		qh.addQuad(new Quadruple("LABEL", "", "", labelF));

		/* etiqueta para instrucciones break */
		qh.addLabelToBreaks(labelF);

		/* etiqueta para instucciones continue */
		qh.addLabelToContinues(l1);

		qh.pop();
	}
}
