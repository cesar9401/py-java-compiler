import { Instruction } from "./instruction";
import { If } from "./if";
import { SymbolTable } from "src/table/symbolTable";
import { Quadruple } from "src/table/quadruple";
import { SemanticHandler } from "src/control/semantic_handler";
import { Variable } from "./variable";
import { Error, TypeE } from "src/control/error";
import { QuadHandler } from "src/control/quad_handler";
import { OperationType } from "./operation";

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

			const tmp: Instruction[] = if_.instructions;
			const local = new SymbolTable();
			local.addAll(table.getTable());
			for(const instruction of tmp) {
				instruction.run(local, sm);
			}
		}
	}

	generate(qh: QuadHandler) {
		const final = qh.getLabel();
		for(const if_ of this.instructions) {
			const cond = if_.condition;
			let lt = "";
			let lf = "";

			if(cond) {
				const quad: Quadruple | undefined = cond.generate(qh);
				lt = qh.labelTrue ? qh.labelTrue : qh.getLabel();
				console.log(lt);
				lf = qh.labelFalse ? qh.labelFalse : qh.getLabel();
				console.log(lf);

				qh.labelTrue = undefined;
				qh.labelFalse = undefined;
				switch(cond.type) {
					case OperationType.AND:
						qh.toTrue(lt);
						qh.toFalse(lf);

						qh.addQuad(new Quadruple("LABEL", "", "", lt));
						break;

					case OperationType.OR:
						qh.toTrue(lt);
						qh.toFalse(lf);

						qh.addQuad(new Quadruple("LABEL", "", "", lt));
						break;

					case OperationType.NOT:
						qh.toTrue(lf);
						qh.toFalse(lt);

						qh.addQuad(new Quadruple("LABEL", "", "", lf));
						break;

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
				}
			}

			for(const ins of if_.instructions) {
				ins.generate(qh);
			}
			qh.addQuad(new Quadruple("GOTO", "", "", final));
			if(cond && cond.type === OperationType.NOT) {
				qh.addQuad(new Quadruple("LABEL", "", "", lt));
			} else if(lf) {
				qh.addQuad(new Quadruple("LABEL", "", "", lf));
			}
		}
		qh.addQuad(new Quadruple("LABEL", "", "", final));
	}
}
