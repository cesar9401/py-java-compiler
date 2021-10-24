import { Instruction } from "src/instruction/instruction";
import { SymbolTable } from "src/table/symbolTable";
import { Variable } from "src/instruction/c/variable";
import { Quadruple } from "src/table/quadruple";
import { SemanticHandler } from "src/control/semantic_handler";
import { Error, TypeE } from 'src/control/error';
import { QuadHandler } from "src/control/quad_handler";
import { OperationType } from "src/instruction/c/operation";
import { OperationJV } from "./operation_jv";
import { MethodJV } from "./method_jv";

export class FunctionCallJV extends Instruction {
	id: string;
	params: OperationJV[];
	private method?: MethodJV;

	constructor(line: number, column: number, id: string, params: OperationJV[]) {
		super(line, column);
		this.id = id;
		this.params = params;
	}

	run(table: SymbolTable, sm: SemanticHandler): Variable | undefined{
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
			const error = new Error(this.line, this.column, this.id, TypeE.SEMANTICO, desc);
			sm.errors.push(error);
			return;
		} else {
			/* obtener metodo de la clase */
			const clzz = sm.getClazz;
			if(clzz) {
				const method = clzz.getMethod(cons);
				if(!method) {
					const desc = `El metodo con la firma '${cons}', no esta definido dentro de esta clase(${clzz.id}).`;
					const error = new Error(this.line, this.column, this.id, TypeE.SEMANTICO, desc);
					sm.errors.push(error);
				} else {
					this.method = method;
					if(method.type !== OperationType.VOID) {
						return new Variable(this.method.type, undefined, " ");
					}
				}
			}
		}
		return;
	}

	generate(qh: QuadHandler){
		const length = qh.peek().length;
		const methodId = this.method?.getId();
		if(methodId !== undefined) {
			/* temporar que apunta al inicio de la pila de la llamada a la siguiente funcio */
			const tt1 = qh.getTmp();
			qh.addQuad(new Quadruple("PLUS", "ptr", length.toString(), tt1, OperationType.INT));

			/* obtener instancia de la clase para pasar como this */
			const this_ = qh.peek().getById('this');
			if(this_ && this_.pos !== undefined) {
				const tt2 = qh.getTmp();
				const tt3 = qh.getTmp();
				qh.addQuad(new Quadruple("PLUS", "ptr", this_.pos.toString(), tt2, OperationType.INT));
				qh.addQuad(new Quadruple("ASSIGN", `stack[${tt2}]`, '', tt3, OperationType.INT));
				/* asignar this al principio del stack de la siguiente activacion */
				qh.addQuad(new Quadruple('ASSIGN', tt3, '', `stack[${tt1}]`));
			}

			/* preparar parametros */
			if(this.params.length > 0) {
				for(let i = 0; i < this.params.length; i ++) {
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

			/* cambia puntero hacia la pila de la funcion */
			qh.addQuad(new Quadruple("PLUS", "ptr", length.toString(), "ptr"));

			/* activacion de la funcion */
			qh.addQuad(new Quadruple("FUNCTION", "", "", methodId));

			/* regresar puntero hacia donde fue llamada la funcion */
			qh.addQuad(new Quadruple("MINUS", "ptr", length.toString(), "ptr"));

			/* obtener valor de return */
			if(this.method && this.method.type !== OperationType.VOID) {
				const t1 = qh.getTmp();
				const t2 = qh.getTmp();
				const t3 = qh.getTmp();
				const t4 = qh.getTmp();
				const posR = this.method.getLength - 1;
				const stack = this.getNameStack(this.method.type);
				qh.addQuad(new Quadruple("PLUS", "ptr", length.toString(), t1, OperationType.INT));
				qh.addQuad(new Quadruple("PLUS", t1, posR.toString(), t2, OperationType.INT));
				qh.addQuad(new Quadruple("ASSIGN", `stack[${t2}]`, '', t3, OperationType.INT));
				const result = new Quadruple("ASSIGN", `${stack[2]}[${t3}]`, '', t4, this.method.type);
				// console.log(result);
				qh.addQuad(result);
				return result;
			}
		}
		return;
	}

	public get getMethod() {
		return this.method;
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
