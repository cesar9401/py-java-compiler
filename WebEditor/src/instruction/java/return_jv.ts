import { Instruction } from "../instruction";
import { SymbolTable } from "src/table/symbolTable";
import { Quadruple } from "src/table/quadruple";
import { SemanticHandler } from "src/control/semantic_handler";
import { QuadHandler } from "src/control/quad_handler";
import { OperationType } from "src/instruction/c/operation";
import { Variable } from "src/instruction/c/variable";
import { OperationJV } from "./operation_jv";
import { Error, TypeE } from "src/control/error";

export class ReturnJV extends Instruction {
	operation: OperationJV;

	constructor(line: number, column: number, operation: OperationJV) {
		super(line, column);
		this.operation = operation;
	}

	run(table: SymbolTable, sm: SemanticHandler) {
		const type = sm.getType;
		const val: Variable | undefined = this.operation.run(table, sm);
		if(!val || !val.value) {
			const desc = `La operacion definida para retorno(instruccion 'return'), no tiene un valor definido o no ha sido declarado.`;
			const error = new Error(this.operation.line, this.operation.column, "", TypeE.SEMANTICO, desc);
			sm.errors.push(error);
			return;
		}

		if(type !== val.type) {
			const desc = `El valor de retorno encontrado es de tipo '${val.type}', se esperaba valor de tipo '${type}'`;
			const error = new Error(this.operation.line, this.operation.column, '', TypeE.SEMANTICO, desc);
			sm.errors.push(error);
			return;
		}

		if(!table.contains('return')) {
			/* agregar returna tabla de simbolos */
			const variable = new Variable(type, 'return', ' ');
			table.add(variable);
		}
	}

	/* evaluar condiciones como num1 == num2 */
	generate(qh: QuadHandler) {
		const quad: Quadruple | undefined = this.operation.generate(qh);
		if(quad && quad.type) {
			const result = qh.getQuadReturn;
			const stack = this.getNameStack(quad.type);
			if(result) {
				qh.addQuad(new Quadruple("ASSIGN", quad.result, '', stack[0]));
				qh.addQuad(new Quadruple("ASSIGN", stack[1], '', `stack[${result.result}]`))
				qh.addQuad(new Quadruple("PLUS", stack[1], '1', stack[1]));
			}
		}

		/* agregar goto hacia etiquta final */
		qh.addReturns(new Quadruple("GOTO", "", "", ""));
	}

	private getNameStack(type: OperationType) {
		switch(type) {
			case OperationType.INT:
			case OperationType.BOOL:
			return [`stack_n[ptr_n]`, `ptr_n`, `stack_n`];
			case OperationType.FLOAT:
				return [`stack_f[ptr_f]`, `ptr_f`, `stack_f`];
			case OperationType.STRING:
				return [`stack_s[ptr_s]`, `ptr_s`, `stack_s`];
			case OperationType.CHAR:
				return [`stack_c[ptr_c]`, `ptr_c`, `stack_c`];
		}
		return [];
	}
}
