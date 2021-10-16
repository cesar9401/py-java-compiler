import { Instruction } from "src/instruction/instruction";
import { SymbolTable } from "src/table/symbolTable";
import { Quadruple } from "src/table/quadruple";
import { SemanticHandler } from "src/control/semantic_handler";
import { Error, TypeE } from '../../control/error';
import { QuadHandler } from "src/control/quad_handler";
import { Operation, OperationType } from "./operation";
import { Variable } from "./variable";

export class FunctionCall extends Instruction {
	type: string; /* JAVA or PYTHON */
	clazz: string;
	id: string;
	params: Operation[];

	constructor(
		line: number,
		column: number,
		type: string,
		clazz: string,
		id: string,
		params: Operation[]
	) {
		super(line, column);
		this.type = type;
		this.clazz = clazz;
		this.id = id;
		this.params = params;
	}

	run(table: SymbolTable, sm: SemanticHandler) {
		/* verificar parametros de funciones */
		for(const operation of this.params) {
			const value: Variable | undefined = operation.run(table, sm);
			if(!value || value.value === undefined) {
				const desc = `En la llamada a la funcion 'PY.${this.id}', uno de los parametros no ha sido declarado o no tiene un valor definido.`;
				let lexema = '';
				if(operation.variable?.id) {
					lexema = operation.variable.id;
				}
				const error = new Error(operation.line, operation.column, lexema, TypeE.SEMANTICO, desc);
				sm.errors.push(error);
			}
		}

		/* verificar que la funcion exista */
		const functionId = `__py__${this.id}__`;
		const isPresent = sm.getFunction(functionId);
		if(!isPresent) {
			/* error, la funcion no existe */
			const desc = `La funcion PY con identificador '${this.id}' no ha sido definida.`;
			const error = new Error(this.line, this.column, this.id, TypeE.SEMANTICO, desc);
			sm.errors.push(error);
		}
	}

	generate(qh: QuadHandler) {
		if(this.type === "PYTHON") {
			/* activacion de funcion python */
			const len = qh.peek().length;
			const functionId = `__py__${this.id}__`;
			// cambiar puntero de pila hacia pila de la funcion
			qh.addQuad(new Quadruple("PLUS", "ptr", len.toString(), "ptr"));

			/* activacion de la funcion */
			qh.addQuad(new Quadruple("FUNCTION", "", "", functionId));

			// cambiar puntero de pila hacia pila donde fue llamada la funcion
			qh.addQuad(new Quadruple("MINUS", "ptr", len.toString(), "ptr"));
		} else if(this.type === "JAVA") {

		}
	}
}
