import { Instruction } from "./instruction";
import { If } from "./if";
import { SymbolTable } from "src/table/symbolTable";
import { Quadruple } from "src/table/quadruple";
import { SemanticHandler } from "src/control/semantic_handler";
import { Variable } from "./variable";
import { Error, TypeE } from "src/control/error";
import { Operation } from "src/instruction/operation";

export class IfInstruction extends Instruction {
	instructions:If[];

	constructor(line:number, column:number, instructions:If[]) {
		super(line, column);
		this.instructions = instructions;
	}

	run(table: SymbolTable, sm: SemanticHandler) {
		for(const if_ of this.instructions) {
			const condition = if_.condition;
			if(condition) {
				const val: Variable = condition.run(table, sm);
				if(!val || !val.value) {
					const desc = `En la instruccion '${if_.type.toLowerCase()}', la condicion no se puede procesar debido a que uno de los operandos no tiena valor definido o no ha sido declarado.`;
					const error = new Error(condition.line, condition.column, (val && val.id ? val.id : ""), TypeE.SEMANTICO, desc);
					sm.errors.push(error);
				}
			}

			const tmp: Instruction[] = if_.instructions;
			const local = new SymbolTable();
			local.addAll(table.getTable());
			for(const instruction of tmp) {
				instruction.run(local, sm);
			}
		}
	}

	generate(quads: Quadruple[]) {
		for(const if_ of this.instructions) {
			const cond = if_.condition;
			if(cond) {
				const quadC: Quadruple = cond.generate(quads);

				const quad = new Quadruple("IF_FALSE", quadC.result, "", "L1");
				quads.push(quad);
			}

			for(const ins of if_.instructions) {
				ins.generate(quads);
			}

			const quad = new Quadruple("LABEL", "", "", "L1");
			quads.push(quad);
		}
	}
}
