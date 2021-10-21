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

	generate(qh: QuadHandler) {
		/* tabla local */
		qh.push();

		/* generar declaracion/asignacion ciclo for */
		if(this.init) {
			this.init.generate(qh);
		} else if(this.init1) {
			this.init1.generate(qh);
		}

		/* etiqueta inicial */
		const li = qh.getLabel();
		qh.addQuad(new Quadruple("LABEL", "", "", li));

		/* generar condicion */
		const quad: Quadruple | undefined = this.condition.generate(qh);
		const lt = qh.labelTrue ? qh.labelTrue : qh.getLabel();
		const lf = qh.labelFalse ? qh.labelFalse : qh.getLabel();

		qh.labelTrue = undefined;
		qh.labelFalse = undefined;

		// generar etiqueta de incremento/accion posterior aqui
		const after = qh.getLabel();

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

			case OperationType.BOOL:
				if(quad) {
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

		/* generar cuadruplas de instrucciones hijas */
		for(const instruction of this.instructions) {
			instruction.generate(qh);
		}

		/* generar cuadruplas de asignacion aqui */
		qh.addQuad(new Quadruple("LABEL", "", "", after)); // etiqueta de incremento
		const quadAssign = this.assign.generate(qh); // incremento

		// accion de salto hacia etiqueta inicial
		qh.addQuad(new Quadruple("GOTO", "", "", li));

		// label false
		const labelF = this.condition.type === OperationType.NOT ? lt : lf;
		qh.addQuad(new Quadruple("LABEL", "", "", labelF));

		// etiqueta para instrucciones break
		qh.addLabelToBreaks(labelF);

		// etiqueta para instrucciones continue
		qh.addLabelToContinues(after); // ir al incremento

		/* eliminar tabla local */
		qh.pop();
	}
}
