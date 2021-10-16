import { Instruction } from "src/instruction/instruction";
import { SymbolTable } from "src/table/symbolTable";
import { Quadruple } from "src/table/quadruple";
import { SemanticHandler } from "src/control/semantic_handler";
import { Variable } from "src/instruction/c/variable";
import { QuadHandler } from "src/control/quad_handler";
import { OperationPY } from "./operation_py";
import { Operation, OperationType } from "../c/operation";
import { Error, TypeE } from "src/control/error";

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

		/* revisar instrucciones de tipo operacion en range */
		for(const operation of this.range) {
			const op = operation.run(local, sm);
			if(!op || !op.value) {
				/* no ha sido declarado o no tiene un valor definido */
				const desc = `En la declaracion del ciclo for-range, uno de los parametros de range no tiene un valor definido, quiza por usar una variable no declarada o que no tenga un valor asignado.`;
				const error = new Error(this.line, this.column, "", TypeE.SEMANTICO, desc);
				sm.errors.push(error);
			} else if(op.type !== OperationType.INT) {
				/* se esperaba operacion de tipo entero o float*/
				const desc = `Los paramentros para range, deben ser de tipo numerico(int), se encontro una operacion que da como resultado un valor de tipo '${op.type}'`;
				const error = new Error(this.line, this.column, "", TypeE.SEMANTICO, desc);
				sm.errors.push(error);
			}
		}

		/* revisar instrucciones del ciclo for-range */
		for(const instruction of this.instructions) {
			instruction.run(local, sm);
		}

		/* eliminar scope */
		sm.pop();
	}

	generate(qh: QuadHandler) {
		qh.push();

		/* variable iterator */
		const variable = qh.peek().getById(this.iterator);

		// declaracion o asignacion de valor inicial
		if(variable && variable.pos !== undefined) {

			/* inicializar this.iterator en this.range[0] */
			const init = this.range[0].generate(qh);
			// console.log(init);
			if(init) {
				if(variable.type === OperationType.INT) {
					// mismo tipo, cambiar valor unicamente
					const t = qh.getTmp();
					const s = qh.getTmp();
					qh.addQuad(new Quadruple("PLUS", "ptr", variable.pos.toString(), t, OperationType.INT));
					qh.addQuad(new Quadruple("ASSIGN", `stack[${t}]`, "", s, OperationType.INT));
					qh.addQuad(new Quadruple("ASSIGN", init.result, "", `stack_n[${s}]`));
				} else {
					const t = qh.getTmp();
					qh.addQuad(new Quadruple("ASSIGN", init.result, "", `stack_n[ptr_n]`));
					qh.addQuad(new Quadruple("PLUS", "ptr", variable.pos.toString(), t, OperationType.INT));
					qh.addQuad(new Quadruple("ASSIGN", "ptr_n", "", `stack[${t}]`));
					qh.addQuad(new Quadruple("PLUS", "ptr_n", "1", "ptr_n"));

					variable.type = OperationType.INT;
				}
			}

			/* etiqueta inicial */
			const li = qh.getLabel();
			qh.addQuad(new Quadruple("LABEL", "", "", li));

			/* etiquetas true and false */
			const lt = qh.labelTrue ? qh.labelTrue : qh.getLabel();
			const lf = qh.labelFalse ? qh.labelFalse : qh.getLabel();

			/* revisar esto */
			qh.labelTrue = undefined;
			qh.labelFalse = undefined;

			/* condicion segun this.range */
			const cond = this.range[1].generate(qh);
			if(cond) {
				/* valor actual de iteracion */
				const t = qh.getTmp();
				const s = qh.getTmp();
				const res = qh.getTmp();
				qh.addQuad(new Quadruple("PLUS", "ptr", variable.pos.toString(), t, OperationType.INT));
				qh.addQuad(new Quadruple("ASSIGN", `stack[${t}]`, "", s, OperationType.INT));
				qh.addQuad(new Quadruple("ASSIGN", `stack_n[${s}]`, "", res, OperationType.INT));

				const qd = new Quadruple("IF_SMALLER", res, cond.result, "");
				const goto = new Quadruple("GOTO", "", "", "");

				/* agregar falsos y verdaderos */
				qh.addTrue(qd);
				qh.addFalse(goto);

				/* agregar cuadruplos */
				qh.addQuad(qd);
				qh.addQuad(goto);

				/* etiquetas falso y verdadero */
				qh.toTrue(lt);
				qh.toFalse(lf);

				/* label true */
				qh.addQuad(new Quadruple("LABEL", "", "", lt));
			}

			for(const instruction of this.instructions) {
				instruction.generate(qh);
			}

			// generar etiqueta de incremento/accion posterior aqui
			const after = qh.getLabel();
			qh.addQuad(new Quadruple("LABEL", "", "", after));

			/* incremento aqui */
			const increment = this.range[2].generate(qh);
			if(increment) {
				/* obtener variable */
				const t = qh.getTmp();
				const s = qh.getTmp();
				const res = qh.getTmp();
				const result = qh.getTmp();

				qh.addQuad(new Quadruple("PLUS", "ptr", variable.pos.toString(), t, OperationType.INT));
				qh.addQuad(new Quadruple("ASSIGN", `stack[${t}]`, "", s, OperationType.INT));
				qh.addQuad(new Quadruple("ASSIGN", `stack_n[${s}]`, "", res, OperationType.INT));

				/* sumar incremento */
				qh.addQuad(new Quadruple(OperationType.SUM, res, increment.result, result, OperationType.INT));

				/* guardar valor en stack */
				qh.addQuad(new Quadruple("ASSIGN", result, "", `stack_n[${s}]`));
			}

			/* salto hacia etiqueta inicial aqui */
			qh.addQuad(new Quadruple("GOTO", "", "", li));

			/* label false */
			qh.addQuad(new Quadruple("LABEL", "", "", lf));

			/* etiqueta para instrucciones break */
			qh.addLabelToBreaks(lf);
			qh.addLabelToContinues(after);
		}

		qh.pop();
	}
}
