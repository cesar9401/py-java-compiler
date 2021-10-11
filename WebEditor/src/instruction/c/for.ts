import { Instruction } from "src/instruction/instruction";
import { SymbolTable } from "src/table/symbolTable";
import { Quadruple } from "src/table/quadruple";
import { Assignment } from "./assignment";
import { Statement } from "./statement";
import { SemanticHandler } from "src/control/semantic_handler";
import { QuadHandler } from "src/control/quad_handler";
import { Operation, OperationType } from "./operation";
import { Error, TypeE } from "src/control/error";
import { Variable } from "./variable";

export class For extends Instruction {
	init?: Statement;
	init1?: Assignment;
	condition: Operation;
	assign: Assignment;
	instructions: Instruction[];

	constructor(
		line: number,
		column: number,
		condition: Operation,
		assign: Assignment,
		instructions: Instruction[],
		init?: Statement,
		init1?: Assignment,) {
		super(line, column);
		this.condition = condition;
		this.assign = assign;
		this.instructions = instructions;

		if(init) {
			this.init = init;
		} else if(init1) {
			this.init1 = init1;
		}
	}

	run(table: SymbolTable, sm: SemanticHandler) {
		sm.push('for'); // agregar scope for
		const local = new SymbolTable(sm.peek(), table);
		sm.pushTable(local);

		// revisar declaracion/asignacion ciclo for
		if(this.init) {
			// revisar statement
			this.init.run(local, sm);

		} else if(this.init1) {
			// revisar assignment
			this.init1.run(local, sm);
			const id = this.init1.id;
			const val: Variable | undefined = local.getById(id);
			if(val && val.type !== OperationType.INT) {
				const desc = `En la declaracion de la instruccion 'for', se esperaba una declaracion de variable de tipo entero, se encontro variable de tipo: ${val.type}`;
				const error = new Error(this.line, this.column, val.id ? val.id : "", TypeE.SEMANTICO, desc);
				sm.errors.push(error);
			}
		}

		// revisar operacion y/o condicion
		const cond: Variable | undefined = this.condition.run(local, sm);

		// revisar asignacion o accion de incremento, decremento
		this.assign.run(local, sm);

		// revisar instrucciones del ciclo for
		for(const instruction of this.instructions) {
			instruction.run(local, sm);
		}

		sm.pop(); // eliminar scope for
	}

	generate(qh: QuadHandler) {
		qh.push();

		// generar declaracion/asignacion ciclo for
		if(this.init) {
			this.init.generate(qh);
		} else if(this.init1) {
			this.init1.generate(qh);
		}

		// generar eqitueta inicial
		const li = qh.getLabel();
		qh.addQuad(new Quadruple("LABEL", "", "", li));

		// generar condicion
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

		for(const instruction of this.instructions) {
			instruction.generate(qh);
		}

		// generar accion de asignacion aqui
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

		qh.pop();
	}
}
