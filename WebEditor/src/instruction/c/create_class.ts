import { Instruction } from "src/instruction/instruction";
import { SymbolTable } from "src/table/symbolTable";
import { Quadruple } from "src/table/quadruple";
import { SemanticHandler } from "src/control/semantic_handler";
import { Error, TypeE } from '../../control/error';
import { QuadHandler } from "src/control/quad_handler";
import { Operation, OperationType } from "./operation";
import { Variable } from "./variable";

export class CreateClass extends Instruction {
	clazz: string;
	ids: string[];
	params: Operation[];

	constructorId?: string;

	constructor(line: number, column: number, clazz: string, ids: string[], params: Operation[]) {
		super(line, column);
		this.clazz = clazz;
		this.ids = ids;
		this.params = params;
	}

	run(table: SymbolTable, sm: SemanticHandler) {
		// console.log(`JAVA.${this.clazz} ${this.ids}`);

		/* verificar si la clase this.clazz existe */
		const clzz = sm.getClass(this.clazz);
		if(clzz) {
			/* en base a los parametros -> this.params, verificar si el constructor existe */
			/* obtener firma del constructor a invocar */
			let e = false;
			let cons = `${this.clazz}(`;
			for(let i = 0; i < this.params.length; i++) {
				const value = this.params[i].run(table, sm);
				if(value) {
					cons += value.type.toLowerCase();
					cons += i !== this.params.length - 1 ? ',' : '';
				} else {
					e = true;
					const desc = `Uno de los parametros para crear una instancia de la clase '${this.clazz}', no tiene un valor definido.`;
					const error = new Error(this.params[i].line, this.params[i].column, '', TypeE.SEMANTICO, desc);
					sm.errors.push(error);
				}
			}
			cons += `)`;

			if(e) {
				/* no se puede buscar constructor porque al menos uno de los parametros es nulo */
				const desc = `No es posible ubicar un constructor para la clase '${this.clazz}', debido a que al menos uno de los parametros no tiene un valor definido.`;
				const error = new Error(this.line, this.column, this.clazz, TypeE.SEMANTICO, desc);
				sm.errors.push(error);
			} else {
				/* buscar constructor */
				const construct = clzz.getConstructor(cons);
				// console.log(construct);
				if(!construct) {
					const desc = `El constructor con la firma '${cons}', no esta definido.`;
					const error = new Error(this.line, this.column, this.clazz, TypeE.SEMANTICO, desc);
					sm.errors.push(error);
				} else {
					if(construct.access === 'private') {
						const desc = `El constructor con firma '${cons}', es de acceso privado.`;
						const error = new Error(this.line, this.column, this.clazz, TypeE.SEMANTICO, desc);
						sm.errors.push(error);
					} else {
						/* agregar variable a tabla de simbolos */
						for(const id of this.ids) {
							const present = table.contains(id);
							if(present) {
								const desc = `La variable con identificador '${id}', ya ha sido definida, intente con otro identificador.`;
								const error = new Error(this.line, this.column, this.clazz, TypeE.SEMANTICO, desc);
								sm.errors.push(error);
							} else {
								/* establecer constructorId */
								this.constructorId = construct.getId();

								const variable = new Variable(OperationType.CLAZZ, id, " ");
								variable.clzz = this.clazz;
								table.add(variable);
							}
						}
					}
				}
			}
		} else {
			const desc = `La clase que intenta instanciar: '${this.clazz}', no ha sido definida.`;
			const error = new Error(this.line, this.column, this.clazz, TypeE.SEMANTICO, desc);
			sm.errors.push(error);
		}
	}

// JAVA.Persona p1, p2;
// JAVA.Persona p1(params);

	generate(qh: QuadHandler) {

		const length = qh.peek().length;
		// let constructorId = `${this.clazz}_${this.clazz}`;
		// for(const param of this.params) {
		// 	const val = param.generate(qh);
		// 	constructorId += `_${val?.type?.toLowerCase()}`;
		// }

		for(const id of this.ids) {
			if(this.constructorId !== undefined) {
				/* preparar parametros */
				if(this.params.length > 0) {
					const tt1 = qh.getTmp();
					qh.addQuad(new Quadruple("PLUS", "ptr", length.toString(), tt1, OperationType.INT));
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
				qh.addQuad(new Quadruple("FUNCTION", "", "", this.constructorId));

				/* regresar puntero hacia donde fue llamado el constructor */
				qh.addQuad(new Quadruple("MINUS", "ptr", length.toString(), "ptr"));

				/* recuperar la ubicacion de la instancia */
				const t1 = qh.getTmp();
				const t2 = qh.getTmp();
				const t3 = qh.getTmp();
				const value = qh.peek().getById(id);
				if(value && value.pos !== undefined) {
					qh.addQuad(new Quadruple("PLUS", "ptr", length.toString(), t1, OperationType.INT));
					qh.addQuad(new Quadruple("ASSIGN", `stack[${t1}]`, '', t2, OperationType.INT));
					qh.addQuad(new Quadruple("PLUS", "ptr", value.pos.toString(), t3, OperationType.INT));
					qh.addQuad(new Quadruple("ASSIGN", t2, '', `stack[${t3}]`));
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
			case OperationType.STRING:
				return [`stack_s[ptr_s]`, `ptr_s`, `stack_s`];
			case OperationType.CHAR:
				return [`stack_c[ptr_c]`, `ptr_c`, `stack_c`];
		}
		return [];
	}
}
