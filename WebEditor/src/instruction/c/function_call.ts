import { Instruction } from "src/instruction/instruction";
import { SymbolTable } from "src/table/symbolTable";
import { Quadruple } from "src/table/quadruple";
import { SemanticHandler } from "src/control/semantic_handler";
import { Error, TypeE } from '../../control/error';
import { QuadHandler } from "src/control/quad_handler";
import { Operation, OperationType } from "./operation";
import { Variable } from "./variable";
import { MethodJV } from "../java/method_jv";

export class FunctionCall extends Instruction {
	type: string; /* JAVA or PYTHON */
	clazz: string;
	id: string;
	params: Operation[];

	private java?: MethodJV;

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

	run(table: SymbolTable, sm: SemanticHandler): Variable | undefined {
		if(this.type === "PYTHON") {
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
			return;

		} else if (this.type === "JAVA") {
			/* verificar la variable que hace referencia a la clase existe */
			const clzz = table.getById(this.clazz);
			if(!clzz) {
				/* error, la variable no existe */
				const desc = `La variable '${this.clazz}' no esta definida, no es posible ubicar al metodo '${this.id}'.`;
				const error = new Error(this.line, this.column, this.clazz, TypeE.SEMANTICO, desc);
				sm.errors.push(error);
				return;
			}

			const clzzz = sm.getClass(clzz.clzz);
			if(clzzz) {
				/* obtener firma del metodo a invocar */
				let e = false;
				let cons = `${this.id}(`;
				for(let i = 0; i < this.params.length; i++) {
					const value = this.params[i].run(table, sm);
					if(value) {
						cons += value.type.toLowerCase();
						cons += i !== this.params.length - 1 ? ',' : '';
					} else {
						e = true;
						const desc = `Uno de los parametros para invocar al metodo '${this.id}', no tiene un valor definido.`;
						const error = new Error(this.params[i].line, this.params[i].column, '', TypeE.SEMANTICO, desc);
						sm.errors.push(error);
					}
				}
				cons += ')';

				if(e) {
				/* no se puede buscar constructor porque al menos uno de los parametros es nulo */
					const desc = `No es posible ubicar al metodo '${this.id}', debido a que al menos uno de los parametros no tiene un valor definido.`;
					const error = new Error(this.line, this.column, this.clazz, TypeE.SEMANTICO, desc);
					sm.errors.push(error);
				} else {
					const method = clzzz.getMethod(cons);
					if(!method) {
						const desc = `El metodo con la firma '${cons}', no esta definido dentro de la clase '${clzzz.id}'`;
						const error = new Error(this.line, this.column, this.clazz, TypeE.SEMANTICO, desc);
						sm.errors.push(error);
					} else if(method.access === 'private'){
						const desc = `El metodo con firma '${cons}', definido en la clase '${clzzz.id}', es de acceso privado.`;
						const error = new Error(this.line, this.column, this.clazz, TypeE.SEMANTICO, desc);
						sm.errors.push(error);
					} else {
						this.java = method;
						/* retornar variable con tipo del metodo */
						if(method.type !== OperationType.VOID) {
							const variable = new Variable(this.java.type, "", " ");
							return variable;
						}
					}
				}
			}
			return;
		}
		return;
	}

	generate(qh: QuadHandler): Quadruple | undefined {
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

			return;
		} else if(this.type === "JAVA") {
			const length = qh.peek().length;
			const functionId = this.java?.getId();
			if(functionId !== undefined) {
				/* agregar valor de la instancia de la clase para enviar como this */
				const tt1 = qh.getTmp();
				qh.addQuad(new Quadruple("PLUS", "ptr", length.toString(), tt1, OperationType.INT));

				/* obtener la instancia actual de la clase/this */
				const clzz = qh.peek().getById(this.clazz);
				if(clzz && clzz.pos !== undefined) {
					const tt2 = qh.getTmp();
					const tt3 = qh.getTmp();
					qh.addQuad(new Quadruple("PLUS", "ptr", clzz.pos.toString(), tt2, OperationType.INT));
					qh.addQuad(new Quadruple("ASSIGN", `stack[${tt2}]`, '', tt3, OperationType.INT));
					qh.addQuad(new Quadruple('ASSIGN', tt3, '', `stack[${tt1}]`));
				}

				/* preparar parametros */
				if(this.params.length > 0) {
					for(let i = 0; i < this.params.length; i++) {
						const j = i + 1;
						const tt2 = qh.getTmp();
						const val = this.params[i].generate(qh);

						if(val && val.type) {
							const stack = this.getNameStack(val.type);
							qh.addQuad(new Quadruple("PLUS", tt1, j.toString(), tt2, OperationType.INT));
							qh.addQuad(new Quadruple('ASSIGN', val.result, '', `${stack[0]}`));
							qh.addQuad(new Quadruple('ASSIGN', stack[1], '', `stack[${tt2}]`));
							qh.addQuad(new Quadruple('PLUS', stack[1], '1', stack[1]));
						}
					}
				}

				/* cambiar puntero hacia la pila del constructor */
				qh.addQuad(new Quadruple("PLUS", "ptr", length.toString(), "ptr"));

				/* activacion del constructor */
				qh.addQuad(new Quadruple("FUNCTION", "", "", functionId));

				/* regresar puntero hacia donde fue llamado el constructor */
				qh.addQuad(new Quadruple("MINUS", "ptr", length.toString(), "ptr"));

				/* obtener valor de return */
				if(this.java && this.java.type !== OperationType.VOID) {
					const t1 = qh.getTmp();
					const t2 = qh.getTmp();
					const t3 = qh.getTmp();
					const t4 = qh.getTmp();
					const posR = this.java.getLength - 1;
					const stack = this.getNameStack(this.java.type);
					qh.addQuad(new Quadruple("PLUS", "ptr", length.toString(), t1, OperationType.INT));
					qh.addQuad(new Quadruple("PLUS", t1, posR.toString(), t2, OperationType.INT));
					qh.addQuad(new Quadruple("ASSIGN", `stack[${t2}]`, '', t3, OperationType.INT));
					const result = new Quadruple("ASSIGN", `${stack[2]}[${t3}]`, '', t4, this.java.type);
					qh.addQuad(result);
					// console.log(result);
					return result;
				}
			}
		}
		return;
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

	public get getMethod() {
		return this.java;
	}
}
