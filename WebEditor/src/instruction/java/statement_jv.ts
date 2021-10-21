import { Instruction } from "../instruction";
import { Variable } from 'src/instruction/c/variable';
import { OperationType } from "src/instruction/c/operation";
import { SymbolTable } from "src/table/symbolTable";
import { Quadruple } from "src/table/quadruple";
import { SemanticHandler } from "src/control/semantic_handler";
import { Error, TypeE } from "src/control/error";
import { QuadHandler } from "src/control/quad_handler";
import { OperationJV } from "src/instruction/java/operation_jv";
import { variable } from "@angular/compiler/src/output/output_ast";

export class StatementJV extends Instruction {
	access: string;
	type: OperationType;
	id: string;
	operation?: OperationJV;
	clazz: boolean;

	constructor(
		line: number,
		column: number,
		access: string,
		type: OperationType,
		id: string,
		operation?: OperationJV
	) {
		super(line, column);
		this.access = access;
		this.type = type;
		this.id = id;
		this.operation = operation;

		this.clazz = false;
	}

	run(table: SymbolTable, sm: SemanticHandler) {
		/* declaracion y asignacion */
		if(this.operation) {
			const value: Variable | undefined = this.operation.run(table, sm);
			if(value && value.value) {

				/* revisar que el tipo de variable coincida con el tipo declarado */
				if(this.type === value.type) {
					const newVal: Variable = new Variable(this.type, this.id, ' ');
					newVal.access = this.access; // acceso segun declaracion en variables de clase

					if(!table.contains(this.id)) {
						table.add(newVal);
					} else {
						/* error la variable ya existe */
						const desc = `La variable con identificador '${this.id}', ya existe, intente con un nombre distinto.`;
						const error = new Error(this.line, this.column, this.id, TypeE.SEMANTICO, desc);
						sm.errors.push(error);
					}

				} else {
					const desc = `Esta intentado asignar un valor de tipo '${value.type}' a una variable de tipo '${this.type}'`;
					const error = new Error(this.line, this.column, this.id, TypeE.SEMANTICO, desc);
					sm.errors.push(error);
				}

			} else {
				/* error, no tiene valor definido */
				const desc = `Se esta intendo asignar un valor nulo a la variable '${this.id}' probablemente uno de los operadores no tiene un valor definido o no ha sido declarado.`;
				const error = new Error(this.line, this.column, this.id, TypeE.SEMANTICO, desc);
				sm.errors.push(error);
			}
		} else {

			/* solo declaracion de variables */
			const value = new Variable(this.type, this.id, undefined);
			if(!table.contains(this.id)) {
				if(this.clazz) {
					value.value = ' '; // darle un valor por defecto a variable de clase
				}
				table.add(value);
			} else {
				/* error la variable ya existe */
				const desc = `La variable con identificador '${this.id}', ya existe, intente con un nombre distinto.`;
				const error = new Error(this.line, this.column, this.id, TypeE.SEMANTICO, desc);
				sm.errors.push(error);
			}
		}
	}

	generate(qh: QuadHandler) {
		if(this.operation) {
			const res: Quadruple | undefined = this.operation.generate(qh);
			switch(this.operation.type) {
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

					// obtener puntero
					const variable = qh.peek().getById(this.id);
					if(variable && variable.pos !== undefined) {
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

					const val = qh.peek().getById(this.id);
					console.log(`not:`);
					console.log(val);

					if(val && val.pos !== undefined) {
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
					}
					return;
			}

			if(res) {
				const variable = qh.peek().getById(this.id);
				if(variable && variable.pos !== undefined) {
					switch(this.type) {
						case OperationType.INT:
							// if(this.clazz) {
							// } else {
								const t = qh.getTmp();
								qh.addQuad(new Quadruple("ASSIGN", res.result, "", `stack_n[ptr_n]`));
								qh.addQuad(new Quadruple("PLUS", "ptr", variable.pos.toString(), t, OperationType.INT));
								qh.addQuad(new Quadruple("ASSIGN", "ptr_n", "", `stack[${t}]`));
								qh.addQuad(new Quadruple("PLUS", "ptr_n", "1", "ptr_n"));
								return;
							// }
						case OperationType.FLOAT:
							const tf = qh.getTmp();
							qh.addQuad(new Quadruple("ASSIGN", res.result, "", `stack_f[ptr_f]`));
							qh.addQuad(new Quadruple("PLUS", "ptr", variable.pos.toString(), tf, OperationType.INT));
							qh.addQuad(new Quadruple("ASSIGN", "ptr_f", "", `stack[${tf}]`));
							qh.addQuad(new Quadruple("PLUS", "ptr_f", "1", "ptr_f"));
							return;
						case OperationType.CHAR:
							const tc = qh.getTmp();
							qh.addQuad(new Quadruple("ASSIGN", res.result, "", `stack_c[ptr_c]`));
							qh.addQuad(new Quadruple("PLUS", "ptr", variable.pos.toString(), tc, OperationType.INT));
							qh.addQuad(new Quadruple("ASSIGN", "ptr_c", "", `stack[${tc}]`));
							qh.addQuad(new Quadruple("PLUS", "ptr_c", "1", "ptr_c"));
							return;
						case OperationType.STRING:
							const ts = qh.getTmp();
							qh.addQuad(new Quadruple("ASSIGN", res.result, "", `stack_s[ptr_s]`));
							qh.addQuad(new Quadruple("PLUS", "ptr", variable.pos.toString(), ts, OperationType.INT));
							qh.addQuad(new Quadruple("ASSIGN", "ptr_s", "", `stack[${ts}]`));
							qh.addQuad(new Quadruple("PLUS", "ptr_s", "1", "ptr_s"));
							return;
						case OperationType.BOOL:
							const tb = qh.getTmp();
							qh.addQuad(new Quadruple("ASSIGN", res.result, "", `stack_n[ptr_n]`));
							qh.addQuad(new Quadruple("PLUS", "ptr", variable.pos.toString(), tb, OperationType.INT));
							qh.addQuad(new Quadruple("ASSIGN", "ptr_n", "", `stack[${tb}]`));
							qh.addQuad(new Quadruple("PLUS", "ptr_n", "1", "ptr_n"));
							return;
					}
				}
			}
		} else {
			const variable = qh.peek().getById(this.id);
			if(variable && variable.pos !== undefined) {
				switch(this.type) {
					case OperationType.INT:
					case OperationType.BOOL:
						const t = qh.getTmp();
						qh.addQuad(new Quadruple("PLUS", "ptr", variable.pos.toString(), t, OperationType.INT));
						qh.addQuad(new Quadruple("ASSIGN", "ptr_n", "", `stack[${t}]`));
						qh.addQuad(new Quadruple("PLUS", "ptr_n", "1", "ptr_n"));
						return;
					case OperationType.FLOAT:
						const tf = qh.getTmp();
						qh.addQuad(new Quadruple("PLUS", "ptr", variable.pos.toString(), tf, OperationType.INT));
						qh.addQuad(new Quadruple("ASSIGN", "ptr_f", "", `stack[${tf}]`));
						qh.addQuad(new Quadruple("PLUS", "ptr_f", "1", "ptr_f"));
						return;
					case OperationType.CHAR:
						const tc = qh.getTmp();
						qh.addQuad(new Quadruple("PLUS", "ptr", variable.pos.toString(), tc, OperationType.INT));
						qh.addQuad(new Quadruple("ASSIGN", "ptr_c", "", `stack[${tc}]`));
						qh.addQuad(new Quadruple("PLUS", "ptr_c", "1", "ptr_c"));
						return;
					case OperationType.STRING:
						const ts = qh.getTmp();
						qh.addQuad(new Quadruple("PLUS", "ptr", variable.pos.toString(), ts, OperationType.INT));
						qh.addQuad(new Quadruple("ASSIGN", "ptr_s", "", `stack[${ts}]`));
						qh.addQuad(new Quadruple("PLUS", "ptr_s", "1", "ptr_s"));
				}
			}
		}
		return;
	}
}
