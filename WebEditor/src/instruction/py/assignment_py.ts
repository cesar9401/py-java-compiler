import { Instruction } from "src/instruction/instruction";
import { SymbolTable } from "src/table/symbolTable";
import { Variable } from "../c/variable";
import { Quadruple } from "src/table/quadruple";
import { SemanticHandler } from "src/control/semantic_handler";
import { OperationPY } from "./operation_py";
import { QuadHandler } from "src/control/quad_handler";
import { Error, TypeE } from "src/control/error";
import { OperationType } from "src/instruction/c/operation";

export class AssignmentPY extends Instruction {
	ids: string[];
	values: OperationPY[];

	constructor(line: number, column: number, ids: string[], values: OperationPY[]) {
		super(line, column);
		this.ids = ids;
		this.values = values;
	}

	run(table: SymbolTable, sm: SemanticHandler) {
		if(this.ids.length !== this.values.length) {
			// error, deben ser el mismo numero de identificadores que de operaciones
			const desc = `En el conjunto de asignaciones, la cantidad de identificadores debe ser la misma que la cantidad que operaciones a asignar. (identificadores = ${this.ids.length}, valores a asignar = ${this.values.length}).`;
			const error = new Error(this.line, this.column, '', TypeE.SEMANTICO, desc);
			sm.errors.push(error);
			return;
		}

		for(let i = 0; i < this.ids.length; i++) {
			const value: Variable | undefined = this.values[i].run(table, sm);

			if(!value) {
				const desc = `Se esta intendo asignar un valor nulo a la variable '${this.ids[i]}' probablemente uno de los operadores no tiene un valor definido o no ha sido declarado.`;
				const error = new Error(this.line, this.column, this.ids[i], TypeE.SEMANTICO, desc);
				sm.errors.push(error);
				continue;
			}

			if(!table.contains(this.ids[i])) {
				// almacenar en tabla de simbolos
				const newVal: Variable = new Variable(value.type, this.ids[i], ' ');
				table.add(newVal);
			} else {
				// cambiar el valor y tipo de variable
				const val:Variable | undefined = table.getById(this.ids[i]);
				if(val) {
					val.type = value.type;
					val.value = ' ';
				}
			}
		}
	}

	generate(qh: QuadHandler) {
		for(let i = 0; i < this.ids.length; i++) {
			const variable = qh.peek().getById(this.ids[i]);
			const val: Quadruple | undefined = this.values[i].generate(qh);
			if(variable && val) {
				if(variable.pos !== undefined) {
					if(variable.type === val.type) {
						// mismo tipo, cambiar valor unicamente
						const t = qh.getTmp();
						const s = qh.getTmp();
						const dest = this.getNameStack(val.type);
						qh.addQuad(new Quadruple("PLUS", "ptr", variable.pos.toString(), t, OperationType.INT));
						qh.addQuad(new Quadruple("ASSIGN", `stack[${t}]`, "", s, OperationType.INT));
						qh.addQuad(new Quadruple("ASSIGN", val.result, "", `${dest[2]}[${s}]`));

					} else {
						// distinto tipo, cambiar y valor y referencia en stack
						if(val.type) {
							const t = qh.getTmp();
							const s = this.getNameStack(val.type);
							qh.addQuad(new Quadruple("ASSIGN", val.result, "", s[0]));
							qh.addQuad(new Quadruple("PLUS", "ptr", variable.pos.toString(), t, OperationType.INT));
							qh.addQuad(new Quadruple("ASSIGN", s[1], "", `stack[${t}]`));
							qh.addQuad(new Quadruple("PLUS", s[1], "1", s[1]));

							// actualizar tipo:
							variable.type = val.type;
						}
					}
				}
			}
		}
	}

	private getNameStack(type: OperationType) {
		switch(type) {
			case OperationType.INT:
				return [`stack_n[ptr_n]`, `ptr_n`, `stack_n`];
			case OperationType.FLOAT:
				return [`stack_f[ptr_f]`, `ptr_f`, `stack_f`];
		}
		return [];
	}
}
