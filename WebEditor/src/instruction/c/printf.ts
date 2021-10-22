import { Instruction } from "../instruction";
import { Variable } from "./variable";
import { SymbolTable } from "src/table/symbolTable";
import { Quadruple } from "src/table/quadruple";
import { SemanticHandler } from "src/control/semantic_handler";
import { Error, TypeE } from 'src/control/error';
import { QuadHandler } from "src/control/quad_handler";
import { Operation, OperationType } from "./operation";

export class Printf extends Instruction {
	format: string;
	fmts: string[];
	operations?: Operation[];

	constructor(line:number, column:number, format:string, fmts:string[], operations?:Operation[]) {
		super(line, column);
		this.format = format;
		this.operations = operations;
		this.fmts = fmts;
	}

	run(table: SymbolTable, sm: SemanticHandler) {
		if(this.operations) {
			if(this.operations.length !== this.fmts.length) {
				const desc = `En la operacion imprimir, desea imprimir ${this.operations.length} datos, pero solo ha indicado formato para ${this.fmts.length} variables.`;
				const error = new Error(this.line, this.column, 'printf', TypeE.SEMANTICO, desc);
				sm.errors.push(error);
				return;
			}

			for(let i = 0; i < this.operations.length; i++) {
				const op = this.operations[i];
				const val : Variable | undefined = op.run(table, sm);
				if(!val || !val.value) {
					const desc = `Uno de los parametros que se desea imprimir, no ha sido declarado o no tiene valor definido.`;
					const error = new Error(op.line, op.column, val?.id ? val.id : "printf", TypeE.SEMANTICO, desc);
					sm.errors.push(error);
					//return;
				} else if(val.type === OperationType.STRING) {
					const desc = `En la instruccion 'print', la variable a imprimir no puede ser de tipo string`;
					const error = new Error(this.line, this.column, val?.value ? val.value : "", TypeE.SEMANTICO, desc);
					sm.errors.push(error);
				}else {
					const fm = this.fmts[i];
					if(val.type == OperationType.INT && fm !== "%d" || val.type === OperationType.FLOAT && fm !== "%f" || val.type === OperationType.CHAR && fm !== "%c") {
						const desc = `Se encontro variable para imprimir de tipo '${val.type}', pero el formato ingresado: '${fm}' no corresponde al tipo variable.`;
						const error = new Error(this.line, this.column, fm, TypeE.SEMANTICO, desc);
						sm.errors.push(error);
					}
				}
			}

			return;
		}

		if(this.fmts.length > 0) {
			const desc = `Se ha indicando formato para imprimir ${this.fmts.length} datos(s), pero no se ha agregado ninguna variable.`;
			const error = new Error(this.line, this.column, 'printf', TypeE.SEMANTICO, desc);
			sm.errors.push(error);
		}
	}

	generate(qh: QuadHandler) {
		if(this.operations) {
			while(this.fmts.length > 0) {
				const current = this.fmts.shift();
				if(current) {
					const index = this.format.indexOf(current);
					const fm = this.format.slice(0, index + 2); // formato temporal para imprimir
					this.format = this.format.slice(index + 2)

					const op = this.operations.shift();
					const q : Quadruple | undefined = op?.generate(qh);

					if(q) {
						const quad = new Quadruple("PRINTF", fm, q.result, '');
						qh.addQuad(quad);
					}
				}
			}

			if(this.format) {
				const quad = new Quadruple("PRINTF", this.format, "", "");
				qh.addQuad(quad);
			}

			return;
		}

		// const result = qh.getTmp();
		const quad = new Quadruple("PRINTF", this.format, "", "");
		qh.addQuad(quad);

		return quad;
	}
}
