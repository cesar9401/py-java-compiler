import { Instruction } from "./instruction";
import { SymbolTable } from "src/table/symbolTable";
import { QuadHandler } from "src/control/quad_handler";
import { SemanticHandler } from "src/control/semantic_handler";
import { Variable } from "./variable";
import { Error, TypeE } from "src/control/error";
import { OperationType } from "./operation";

export class Scanf extends Instruction {
	format: string;
	id: string;
	fmt: string [];

	constructor(line: number, column: number, format: string, id: string, fmt: string []) {
		super(line, column);
		this.format = format;
		this.id = id;
		this.fmt = fmt;
	}

	run(table: SymbolTable, sm: SemanticHandler) {
		const val: Variable | undefined = table.getById(this.id);
		if(!val) {
			const desc = `La variable indicada en la instruccion 'scanf', no ha sido declarada.`;
			const error = new Error(this.line, this.column, this.id, TypeE.SEMANTICO, desc);
			sm.errors.push(error);
			return;
		}

		if(this.fmt.length === 0) {
			const desc = `No se ha indicado ningun formato para el tipo de valor a leer desde la entrada estandar y asignar a la variable ${this.id}.`;
			const error = new Error(this.line, this.column, '', TypeE.SEMANTICO, desc);
			sm.errors.push(error);
			return;
		}

		if(this.fmt.length > 1) {
			const desc = `Se ha indicado mas de un formato para el valor a leer desde la entrada estandar.`;
			const error = new Error(this.line, this.column, '', TypeE.SEMANTICO, desc);
			sm.errors.push(error);
			return;
		}

		const f = this.fmt[0];
		const type = val.type;
		if(type === OperationType.INT && f !== '%d' || type === OperationType.FLOAT && f !== '%f' || type === OperationType.CHAR && f !== '%c') {
			const desc = `Se encontro variable de tipo ${type}, pero el formato no coincide para leer este tipo de variable(${f}).`;
			const error = new Error(this.line, this.column, '', TypeE.SEMANTICO, desc);
			sm.errors.push(error);
		}
	}

	generate(qh: QuadHandler) {}
}
