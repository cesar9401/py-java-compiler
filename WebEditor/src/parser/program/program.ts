import { Statement } from '../../instruction/statement';
import { Instruction } from '../../instruction/instruction';
import { Operation, OperationType } from '../../instruction/operation';
import { Value } from '../../instruction/value';
import { Variable } from '../../instruction/variable';
import { Assignment } from '../../instruction/assignment';
import { Printf } from '../../instruction/printf';
import { If } from '../../instruction/if';
import { IfInstruction } from '../../instruction/if_instruction';
import { Main } from '../../instruction/main_c';
import { SymbolTable } from '../../table/symbolTable';
import { Quadruple } from 'src/table/quadruple';

declare var program: any;

export class Program {
	private source: string;
	private yy: any;

	constructor(source: string) {
		this.source = source;
		this.yy = program.yy;
		this.setFunctions();
	}

	parse() {
		try {
			const value : Instruction[] = program.parse(this.source);
			console.log(`run:`);

			const table = new SymbolTable();
			for(const ins of value) {
				ins.run(table);
			}

			// const quads:Quadruple[] = [];
			// for(const ins of value) {
			// 	ins.generate(quads);
			// }
			// quads.forEach(q => q.toString());
		} catch (error) {
			console.error(error);
		}
	}

	setFunctions() {
		this.yy.Instruction = Instruction;
		this.yy.Operation = Operation; // Operacion
		this.yy.Value = Value;
		this.yy.Variable = Variable;
		this.yy.OperationType = OperationType;
		this.yy.Statement = Statement; // declaracion de variables
		this.yy.Assignment = Assignment; // asignacion de variables
		this.yy.Printf = Printf; // imprimir
		this.yy.If = If;
		this.yy.IfInstruction = IfInstruction; // instrucciones if
		this.yy.Main = Main; // Metodo principal
	}
}
