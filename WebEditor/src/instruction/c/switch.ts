import { Instruction } from "src/instruction/instruction";
import { SymbolTable } from "src/table/symbolTable";
import { Quadruple } from "src/table/quadruple";
import { Case } from "./case";
import { SemanticHandler } from "src/control/semantic_handler";
import { QuadHandler } from "src/control/quad_handler";
import { Operation, OperationType } from "./operation";
import { Variable } from "./variable";
import { Error, TypeE } from "src/control/error";

export class Switch extends Instruction {
	operation: Operation;
	cases: Case[];

	constructor(line: number, column: number, operation: Operation, cases: Case[]) {
		super(line, column);
		this.operation = operation;
		this.cases = cases;
	}

	run(table: SymbolTable, sm: SemanticHandler) {
		// revisar valor a evaluar
		const val: Variable | undefined = this.operation.run(table, sm);
		if(!val || !val.value) {
			const desc = `En la instruccion 'switch', no se puede procesar el valor a evaluar debido a que uno de los operadores no tiene un valor definido o no ha sido declarado.`;
			const error = new Error(this.line, this.column, val && val.id ? val.id : "", TypeE.SEMANTICO, desc)
			sm.errors.push(error);
		}

		if(val?.type === OperationType.STRING) {
			const desc = `En la operacion a evaluar dentro de la instruccion 'switch', la condicion no puede ser de tipo string`;
			const error = new Error(this.line, this.column, val?.value ? val.value : "", TypeE.SEMANTICO, desc);
			sm.errors.push(error);
		}

		for(const cs of this.cases) {
			const value: Operation | undefined = cs.operation;
			if(value && val) {
				const comp: Variable | undefined = value.run(table, sm);
				if(comp && comp.value !== undefined) {
					if(comp.type === OperationType.STRING) {
						const desc = `En la instruccion 'switch-case', el valor a evaluar no puede ser de tipo string.`;
						const error = new Error(cs.line, cs.column, comp?.value ? comp.value : "", TypeE.SEMANTICO, desc);
						sm.errors.push(error);

					} else if(comp.type !== val.type) {
						// no son del mismo tipo
						const desc = `En la definicion de la instruccion 'case', se esperaba una variable de tipo '${val.type}', se encontro una variable de tipo '${comp.type}'.`;
						const error = new Error(value.line, value.column, comp.id ? comp.id : "", TypeE.SEMANTICO, desc);
						sm.errors.push(error);
					}
				} else {
					// error, no es posible evaluar condicion para case
					const desc = `En la instruccion 'case', no se puede procesar el valor a evaluar debido a que uno de los operadores no tiene un valor definido o no ha sido declarado.`;
					const error = new Error(cs.line, cs.column, "", TypeE.SEMANTICO, desc);
					sm.errors.push(error);
				}
			}

			sm.push(`case`);
			const local = new SymbolTable(sm.peek(), table);
			sm.pushTable(local);

			for(const instruction of cs.instructions) {
				instruction.run(local, sm);
			}

			sm.pop();
		}
	}

	generate(qh: QuadHandler){
		// evaluar la operacion:
		const op: Quadruple | undefined = this.operation.generate(qh);
		if(op) {
			// etiqueta final
			const final = qh.getLabel();

			const result = op.result;
			// generar label para prueba:
			const test = qh.getLabel();
			qh.addQuad(new Quadruple("GOTO", "", "", test));


			const labels: string[] = [];
			for(const cs of this.cases) {
				const lb = qh.getLabel();
				labels.push(lb);
				qh.addQuad(new Quadruple("LABEL", "", "", lb));

				// agregar tabla aca
				qh.push();

				for(const ins of cs.instructions) {
					ins.generate(qh);
				}

				// eliminar tabla aca
				qh.pop();

				// label para instruccion break aca
				qh.addLabelToBreaks(final);
			}

			// goto etiqueta final
			qh.addQuad(new Quadruple("GOTO", "", "", final));

			// label para tests
			qh.addQuad(new Quadruple("LABEL", "", "", test));
			for(const cs of this.cases) {
				const goto = labels.length > 0 ? labels.shift() : final;
				if(cs.operation) {
					const qo : Quadruple | undefined = cs.operation.generate(qh);
					if(qo) {
						const ts = new Quadruple("IF_EQEQ", result, qo.result, goto ? goto : final);
						qh.addQuad(ts);
					}
				} else {
					// goto default
					const def = new Quadruple("GOTO", "", "", goto ? goto : final);
					qh.addQuad(def);
				}
			}

			// etiqueta final
			qh.addQuad(new Quadruple("LABEL", "", "", final));
		}
	}
}
