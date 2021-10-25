import { Instruction } from "src/instruction/instruction";
import { IfJV } from "./if_jv";
import { SymbolTable } from "src/table/symbolTable";
import { Quadruple } from "src/table/quadruple";
import { SemanticHandler } from "src/control/semantic_handler";
import { Variable } from "src/instruction/c/variable";
import { QuadHandler } from "src/control/quad_handler";
import { OperationJV } from "./operation_jv";
import { Error, TypeE } from 'src/control/error';
import { OperationType } from "src/instruction/c/operation";
import { ParamJV } from "./param_jv";
import { CodeBlock } from "src/control/code_block";

export class MethodJV extends Instruction {
	access: string;
	type: OperationType;
	id: string;
	params: ParamJV[];
	instructions: Instruction[];
	clazz?: string | undefined;
	private length: number;

	constructor(
		line: number,
		column: number,
		access: string,
		type: OperationType,
		id: string,
		params: ParamJV[],
		instructions: Instruction[]
	) {
		super(line, column);
		this.access = access;
		this.type = type;
		this.id = id;
		this.params = params;
		this.instructions = instructions;

		this.length = 0;
	}

	run(table: SymbolTable, sm: SemanticHandler) {
		// table -> tabla de la clase
		this.clazz = sm.getClazz?.id; // nombre de la clase actual
		sm.setType = this.type; // actualizar ti po actual

		/* verificar si el metodo ya existe */
		const functionId = this.getSignature();
		if(sm.containMethod(functionId)) {
			const desc = `En la clase ${this.clazz}, el metodo con la firma ${functionId}, ya ha sido definida.`;
			const error = new Error(this.line, this.column, this.id, TypeE.SEMANTICO, desc);
			sm.errors.push(error);
		} else {
			sm.getMethods.push(functionId);
		}

		/* crear tabla local para el metodo */
		sm.push(this.id);
		const local = new SymbolTable(sm.peek(), undefined);
		sm.pushTable(local);

		/* agregar variable this */
		local.add(new Variable(OperationType.INT, "this", " "));

		/* agregar parametros a la tabla de simbolos */
		for(const param of this.params) {
			param.run(local, sm);
		}

		/* ejecutar instrucciones del metodo */
		for(const instruction of this.instructions) {
			instruction.run(local, sm);
		}

		sm.pop(); // eliminar scope del metodo
		sm.setType = undefined; /* eliminar el tipo actual */

		if(this.type !== OperationType.VOID) {
			/* revisar returns */
			sm.checkReturnJV(this);
			/* revisar breaks y continues */
			sm.checkAstJV(this.instructions, true, true, false);
			if(!local.contains('return')) {
				local.add(new Variable(this.type, 'return', ' '));
			}
		} else {
			/* revisar breaks, continues y returns */
			sm.checkAstJV(this.instructions, true, true, true);
		}
		this.length = local.length;
	}

	generate(qh: QuadHandler) {
		/* tabla de simbolos local */
		qh.push();

		/* calcular posicion de return */
		if(this.type !== OperationType.VOID) {
			const t1 = qh.getTmp();
			const variable = qh.peek().getById('return');
			if(variable && variable.pos !== undefined) {
				const quad = new Quadruple("PLUS", "ptr", variable.pos.toString(), t1, OperationType.INT);
				qh.addQuad(quad)
				/* agregar quad para return */
				qh.setQuadReturn = quad;
			}
		}

		/* generar cuadruplas de instrucciones hijas */
		for(const instruction of this.instructions) {
			instruction.generate(qh);
		}

		/* eliminar tabla local */
		qh.pop();

		/* eliminar quad para return */
		if(this.type !== OperationType.VOID) {
			/* eliminar quad para return */
			qh.setQuadReturn = undefined;
			/* agregar etiqueta final */
			const final = qh.getLabel();
			qh.addQuad(new Quadruple("LABEL", "", "", final));
			qh.addLabelToReturns(final);
		}

		/* crear nuevo bloque de codigo */
		// qh.addCodeBlock(new CodeBlock(this.getId(), qh.getQuads));
		// qh.cleanQuads();
		const clzz = qh.getTmpClazz;
		if(clzz) {
			clzz.tmpBlocks.push(new CodeBlock(this.getId(), qh.getQuads));
			qh.cleanQuads();
		}
	}

	public getId(): string {
		let functionId = `${this.clazz}_${this.type.toLowerCase()}_${this.id}`;
		for(const param of this.params) {
			functionId += `_${param.type.toLowerCase()}`;
		}

		return functionId;
	}

	public getSignature(): string {
		let sign = `${this.id}(`;
		for(let i = 0; i < this.params.length; i++) {
			sign += this.params[i].type.toLowerCase();
			sign += i !== this.params.length - 1 ? ',' : '';
		}
		sign += `)`;
		return sign;
	}

	public get getLength() {
		return this.length;
	}
}
