import { Instruction } from "./instruction";
import { Variable } from "./variable";
import { SymbolTable } from "src/table/symbolTable";
import { Quadruple } from "src/table/quadruple";
import { SemanticHandler } from "src/control/semantic_handler";
import { Error, TypeE } from 'src/control/error';
import { QuadHandler } from "src/control/quad_handler";

export class Printf extends Instruction {
	format: string;
	fmts: string[];
	operations?: Instruction[];

	constructor(line:number, column:number, format:string, fmts:string[], operations?:Instruction[]) {
		super(line, column);
		this.format = format;
		this.operations = operations;
		this.fmts = fmts;
		// console.log(this.fmts);
		// console.log(this.format);
	}

	run(table: SymbolTable, sm: SemanticHandler){
		if(this.operations) {
			if(this.operations.length !== this.fmts.length) {
				const desc = `En la operacion imprimir, desea imprimir ${this.operations.length} datos, pero solo ha indicado formato para ${this.fmts.length} variables.`;
				const error = new Error(this.line, this.column, 'printf', TypeE.SEMANTICO, desc);
				sm.errors.push(error);
			}

			for(const op of this.operations) {
				const val : Variable | undefined = op.run(table, sm);
				if(!val || !val.value) {
					const desc = `Uno de los parametros que se desea imprimir, no ha sido declarado o no tiene valor definido.`;
					const error = new Error(op.line, op.column, val?.id ? val.id : "printf", TypeE.SEMANTICO, desc);
					sm.errors.push(error);
					return;
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
					const q : Quadruple = op?.generate(qh);

					//const result = qh.getTmp();
					const quad = new Quadruple("PRINTF", fm, q.result, '');
					qh.addQuad(quad);
				}
			}

			if(this.format) {
				// const result = qh.getTmp();
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
