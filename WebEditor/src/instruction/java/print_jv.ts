import { Instruction } from "src/instruction/instruction";
import { SymbolTable } from "src/table/symbolTable";
import { SemanticHandler } from "src/control/semantic_handler";
import { QuadHandler } from "src/control/quad_handler";
import { OperationJV } from "./operation_jv";
import { Variable } from "src/instruction/c/variable";
import { Error, TypeE } from "src/control/error";
import { Quadruple } from "src/table/quadruple";
import { OperationType } from "src/instruction/c/operation";

export class PrintJV extends Instruction {
	println: boolean;
	operations: OperationJV [];

	constructor(line: number, column: number, println: boolean, operations: OperationJV[]) {
		super(line, column);
		this.println = println;
		this.operations = operations;
	}

	run(table: SymbolTable, sm: SemanticHandler) {
		for(const operation of this.operations) {
			const val: Variable | undefined = operation.run(table, sm);
			if(!val || val.value === undefined) {
				const desc = `Uno de los parametros que se desea imprimir, no ha sido declarado o no tiene valor definido.`;
				const error = new Error(operation.line, operation.column, operation.variable?.id ? operation.variable.id : "", TypeE.SEMANTICO, desc);
				sm.errors.push(error);
			}
		}
	}

	generate(qh: QuadHandler) {
		for(const operation of this.operations) {
			const quad: Quadruple | undefined = operation.generate(qh);
			if(quad && quad.type) {
				const fm = this.getFormat(quad.type);
				if(quad.type === OperationType.BOOL) {
					const lt = qh.getLabel();
					const lf = qh.getLabel();
					const f = qh.getLabel();
					qh.addQuad(new Quadruple(`IF_GREATER`, quad.result, "0", lt));
					qh.addQuad(new Quadruple('GOTO', "", "", lf));
					qh.addQuad(new Quadruple("LABEL", "", "", lt));
					qh.addQuad(new Quadruple("PRINTF", "%s", `"true"`, ""));
					qh.addQuad(new Quadruple('GOTO', "", "", f));
					qh.addQuad(new Quadruple("LABEL", "", "", lf));
					qh.addQuad(new Quadruple("PRINTF", "%s", `"false"`, ""));
					qh.addQuad(new Quadruple("LABEL", "", "", f));
				} else {
					qh.addQuad(new Quadruple("PRINTF", fm, quad.result, ""));
				}

				if(this.operations[this.operations.length - 1] !== operation) {
					qh.addQuad(new Quadruple("PRINTF", "%c", "32", ""));
				}
			}
		}

		if(this.println) {
			qh.addQuad(new Quadruple("PRINTF", "\\n", "", ""));
		}
	}

	private getFormat(type: OperationType): string {
		switch(type) {
			case OperationType.INT:
			case OperationType.BOOL:
				return "%d";
			case OperationType.FLOAT:
				return "%f";
			case OperationType.STRING:
				return "%s";
			case OperationType.CHAR:
				return "%c";
		}
		return "";
	}
}
