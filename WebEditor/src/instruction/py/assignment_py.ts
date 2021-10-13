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
			const val: Quadruple | undefined = this.values[i].generate(qh);
			const operation = this.values[i];
			switch(operation.type) {
				case OperationType.GREATER:
				case OperationType.SMALLER:
				case OperationType.GREATER_EQ:
				case OperationType.SMALLER_EQ:
				case OperationType.EQEQ:
				case OperationType.NEQ:
				case OperationType.AND:
				case OperationType.OR:
					const lt = qh.labelTrue ? qh.labelTrue : qh.getLabel();
					const lf = qh.labelFalse ? qh.labelFalse : qh.getLabel();
					const final = qh.getLabel();

					/* rivisar esto :v */
					qh.labelTrue = undefined;
					qh.labelFalse = undefined;

					qh.toTrue(lt);
					qh.toFalse(lf);

					/* obtener puntero */
					const variable = qh.peek().getById(this.ids[i]);
					if(variable && variable.pos !== undefined) {
						if(variable.type === OperationType.BOOL) {
							qh.addQuad(new Quadruple("LABEL", "", "", lt));

							const t = qh.getTmp();
							const sn = qh.getTmp();
							qh.addQuad(new Quadruple("PLUS", "ptr", variable.pos.toString(), t, OperationType.INT));
							qh.addQuad(new Quadruple("ASSIGN", `stack[${t}]`, "", sn, OperationType.INT));
							qh.addQuad(new Quadruple("ASSIGN", "1", "", `stack_n[${sn}]`)); // asignar 1

							qh.addQuad(new Quadruple("GOTO", "", "", final));
							qh.addQuad(new Quadruple("LABEL", "", "", lf));

							const t1 = qh.getTmp();
							const sn1 = qh.getTmp();
							qh.addQuad(new Quadruple("PLUS", "ptr", variable.pos.toString(), t1, OperationType.INT));
							qh.addQuad(new Quadruple("ASSIGN", `stack[${t1}]`, "", sn1, OperationType.INT));
							qh.addQuad(new Quadruple("ASSIGN", "0", "", `stack_n[${sn1}]`)); // asignar 0

							qh.addQuad(new Quadruple("LABEL", "", "", final));
						} else {
							qh.addQuad(new Quadruple("LABEL", "", "", lt));

							const t = qh.getTmp();
							qh.addQuad(new Quadruple("ASSIGN", "1", "", `stack_n[ptr_n]`)); // asignar 1
							qh.addQuad(new Quadruple("PLUS", "ptr", variable.pos.toString(), t, OperationType.INT));
							qh.addQuad(new Quadruple("ASSIGN", "ptr_n", "", `stack[${t}]`));
							qh.addQuad(new Quadruple("PLUS", "ptr_n", "1", "ptr_n"));

							qh.addQuad(new Quadruple("GOTO", "", "", final));
							qh.addQuad(new Quadruple("LABEL", "", "", lf));

							const t1 = qh.getTmp();
							qh.addQuad(new Quadruple("ASSIGN", "0", "", `stack_n[ptr_n]`)); // asignar 0
							qh.addQuad(new Quadruple("PLUS", "ptr", variable.pos.toString(), t1, OperationType.INT));
							qh.addQuad(new Quadruple("ASSIGN", "ptr_n", "", `stack[${t1}]`));
							qh.addQuad(new Quadruple("PLUS", "ptr_n", "1", "ptr_n"));

							qh.addQuad(new Quadruple("LABEL", "", "", final));
							/* cambiar a tipo boleano */
							variable.type = OperationType.BOOL;
						}
					}
					return;
				case OperationType.NOT:
					const lt1 = qh.labelTrue ? qh.labelTrue : qh.getLabel();
					const lf1 = qh.labelFalse ? qh.labelFalse : qh.getLabel();
					const final1 = qh.getLabel();

					/* revisar esto */
					qh.labelTrue = undefined;
					qh.labelFalse = undefined;

					qh.toTrue(lf1);
					qh.toFalse(lt1);

					/* obtener puntero */
					const val = qh.peek().getById(this.ids[i]);
					if(val && val.pos !== undefined) {
						if(val.type === OperationType.BOOL) {
							qh.addQuad(new Quadruple("LABEL", "", "", lt1));

							const t1 = qh.getTmp();
							const sn1 = qh.getTmp();
							qh.addQuad(new Quadruple("PLUS", "ptr", val.pos.toString(), t1, OperationType.INT));
							qh.addQuad(new Quadruple("ASSIGN", `stack[${t1}]`, "", sn1, OperationType.INT));
							qh.addQuad(new Quadruple("ASSIGN", "0", "", `stack_n[${sn1}]`)); // asignar 0

							qh.addQuad(new Quadruple("GOTO", "", "", final1));
							qh.addQuad(new Quadruple("LABEL", "", "", lf1));

							const t = qh.getTmp();
							const sn = qh.getTmp();
							qh.addQuad(new Quadruple("PLUS", "ptr", val.pos.toString(), t, OperationType.INT));
							qh.addQuad(new Quadruple("ASSIGN", `stack[${t}]`, "", sn, OperationType.INT));
							qh.addQuad(new Quadruple("ASSIGN", "1", "", `stack_n[${sn}]`)); // asignar 1

							qh.addQuad(new Quadruple("LABEL", "", "", final1));
						} else {
							qh.addQuad(new Quadruple("LABEL", "", "", lt1));

							const t1 = qh.getTmp();
							qh.addQuad(new Quadruple("ASSIGN", "0", "", `stack_n[ptr_n]`)); // asignar 0
							qh.addQuad(new Quadruple("PLUS", "ptr", val.pos.toString(), t1, OperationType.INT));
							qh.addQuad(new Quadruple("ASSIGN", "ptr_n", "", `stack[${t1}]`));
							qh.addQuad(new Quadruple("PLUS", "ptr_n", "1", "ptr_n"));

							qh.addQuad(new Quadruple("GOTO", "", "", final1));
							qh.addQuad(new Quadruple("LABEL", "", "", lf1));

							const t = qh.getTmp();
							qh.addQuad(new Quadruple("ASSIGN", "1", "", `stack_n[ptr_n]`)); // asignar 1
							qh.addQuad(new Quadruple("PLUS", "ptr", val.pos.toString(), t, OperationType.INT));
							qh.addQuad(new Quadruple("ASSIGN", "ptr_n", "", `stack[${t}]`));
							qh.addQuad(new Quadruple("PLUS", "ptr_n", "1", "ptr_n"));

							qh.addQuad(new Quadruple("LABEL", "", "", final1));
							/* cambiar a tipo boleano */
							val.type = OperationType.BOOL;
						}
					}
					return;
			}

			const variable = qh.peek().getById(this.ids[i]);
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
						// distinto tipo, cambiar valor, tipo y referencia en stack
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
			case OperationType.BOOL:
			return [`stack_n[ptr_n]`, `ptr_n`, `stack_n`];
			case OperationType.FLOAT:
				return [`stack_f[ptr_f]`, `ptr_f`, `stack_f`];
		}
		return [];
	}
}
