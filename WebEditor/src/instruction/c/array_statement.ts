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
			if(!value || !value.value) {
				const desc = `Se esta intentando asignar un valor nulo para definir una de las dimensiones del arreglo '${this.id}', probablemente uno de los operandos no tiene un valor definido o no ha sido declarado.`;
				const error = new Error(this.line, this.column, this.id, TypeE.SEMANTICO, desc);
				sm.errors.push(error);
			} else {
				if(value.type !== OperationType.INT) {
					/* error, se espera variable de tipo entero */
					const desc = `Se esta intentando definir la dimension del arreglo '${this.id}' con una variable que no es de tipo entero, se encontro variable de tipo '${value.type}'.`;
					const error = new Error(operation.line, operation.column, operation.variable && operation.variable.id ? operation.variable.id : '', TypeE.SEMANTICO, desc);
					sm.errors.push(error);
				}
			}
		}

		/* revisar que el id este diponible en la tabla de simbolos */
		if(!table.contains(this.id)) {
			const val = new Variable(this.type, this.id, " ");
			val.isArray = true;
			val.size = this.dimensions.length; /* el tamaño de la variable es segun las dimensiones */

			/* agregar a tabla de simbolos */
			table.add(val);

			/* agregar las la longitud de cada dimension aqui :v */
			this.dimensions.forEach((dim, index) => {
				table.add(new Variable(OperationType.INT, `${this.id}[${index}]`, " "));
			});

		} else {
			/* error, el id ya existe */
			const desc = `La variable con identificador '${this.id}' ya existe, intente con un nombre distinto.`;
			const error = new Error(this.line, this.column, this.id, TypeE.SEMANTICO, desc);
			sm.errors.push(error);
		}
	}

	generate(qh: QuadHandler) {
		const variable = qh.peek().getById(this.id);
		if(variable && variable.pos !== undefined) {
			/* switch this.type */
			const t1 = qh.getTmp();
			qh.addQuad(new Quadruple("PLUS", "ptr", variable.pos.toString(), t1, OperationType.INT));
			qh.addQuad(new Quadruple("ASSIGN", "ptr_n", '', `stack[${t1}]`));

			/* guardar valores de las dimensiones en la pila */
			this.dimensions.forEach((operation, index) => {
				const quad: Quadruple | undefined = operation.generate(qh);
				const val = qh.peek().getById(`${this.id}[${index}]`);
				const tt = qh.getTmp();
				if(val && val.pos !== undefined && quad) {
					qh.addQuad(new Quadruple("PLUS", "ptr", val.pos.toString(), tt, OperationType.INT));
					qh.addQuad(new Quadruple("ASSIGN", quad.result, '', `stack[${tt}]`));
				}
			});

			/* para calcular dimension del arreglo */
			let tmp = '';
			this.dimensions.forEach((operation, index) => {
				const tt2 = qh.getTmp();
				const tt3 = qh.getTmp();
				const val = qh.peek().getById(`${this.id}[${index}]`);
				if(val && val .pos !== undefined) {
					qh.addQuad(new Quadruple("PLUS", "ptr", val.pos.toString(), tt2, OperationType.INT));
					qh.addQuad(new Quadruple("ASSIGN", `stack[${tt2}]`, '', tt3, OperationType.INT));

					if(index === 0) {
						tmp = tt3;
					} else {
						const tt4 = qh.getTmp();
						qh.addQuad(new Quadruple("TIMES", tmp, tt3, tt4, OperationType.INT));
						tmp = tt4;
					}
				}
			})
			/* para calcular dimension del arreglo */

			/* aumentar puntero */
			qh.addQuad(new Quadruple("PLUS", "ptr_n", tmp, "ptr_n"));
		}
	}
}
