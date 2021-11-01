import { Instruction } from "src/instruction/instruction";
import { SymbolTable } from "src/table/symbolTable";
import { Variable } from "./variable";
import { Quadruple } from "src/table/quadruple";
import { SemanticHandler } from "src/control/semantic_handler";
import { Error, TypeE } from '../../control/error';
import { QuadHandler } from "src/control/quad_handler";
import { Operation, OperationType } from "./operation";

export class ArrayStatement extends Instruction {
	type: OperationType;
	id: string;
	dimensions: Operation[];

	constructor(
		line: number,
		column: number,
		type: OperationType,
		id: string,
		dimensions: Operation[]
	) {
		super(line, column);
		this.type = type;
		this.id = id;
		this.dimensions = dimensions;
	}

	run(table: SymbolTable, sm: SemanticHandler) {
		/* revisar operaciones que definen el tamaño de cada dimension */
		for(const operation of this.dimensions) {
			const value: Variable | undefined = operation.run(table, sm);
			if(value) {
				if(value.type !== OperationType.INT) {
					/* error, se espera variable de tipo entero */
					const desc = `Se esta intentando definir la dimension del arreglo '${this.id}' con una variable que no es de tipo entero, se encontro variable de tipo '${value.type}'.`;
					const error = new Error(operation.line, operation.column, operation.variable && operation.variable.id ? operation.variable.id : '', TypeE.SEMANTICO, desc);
					sm.errors.push(error);
				}
			} else {
				const desc = `Se esta intentando asignar un valor nulo para definir una de las dimensiones del arreglo '${this.id}', probablemente uno de los operandos no tiene un valor definido o no ha sido declarado.`;
				const error = new Error(this.line, this.column, this.id, TypeE.SEMANTICO, desc);
				sm.errors.push(error);
			}
		}
	}

	generate(qh: QuadHandler) {}
}
