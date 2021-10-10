import { SymbolTable } from '../../table/symbolTable';
import { Quadruple } from 'src/table/quadruple';
import { Statement } from '../../instruction/statement';
import { Instruction } from '../../instruction/instruction';
import { Operation, OperationType } from '../../instruction/operation';
import { Variable } from '../../instruction/variable';
import { Assignment } from '../../instruction/assignment';
import { Printf } from '../../instruction/printf';
import { If } from '../../instruction/if';
import { IfInstruction } from '../../instruction/if_instruction';
import { While } from '../../instruction/while';
import { DoWhile } from '../../instruction/do_while';
import { For } from '../../instruction/for';
import { Case } from '../../instruction/case';
import { Switch } from '../../instruction/switch';
import { Continue } from 'src/instruction/continue';
import { Break } from 'src/instruction/break';
import { Main } from '../../instruction/main_c';
import { Clear } from '../../instruction/clear';
import { Scanf } from 'src/instruction/scanf';
import { SemanticHandler } from 'src/control/semantic_handler';
import { QuadHandler } from 'src/control/quad_handler';
import { CompilerService } from 'src/service/compiler.service';

declare var program: any;

export class Program {
	private source: string;
	private yy: any;

	constructor(private compilerService: CompilerService, source: string) {
		this.source = source;
		this.yy = program.yy;
		this.setFunctions();
	}

	parse() {
		try {
			const value: Instruction[] = program.parse(this.source);
			console.log(value);

			/* run */
			const sm = new SemanticHandler();
			const table = new SymbolTable(sm.peek());
			sm.pushTable(table);

			for(const ins of value) {
				ins.run(table, sm);
			}

			if(sm.errors.length > 0) {
				sm.errors.forEach(e => console.log(e.toString()));
			} else {
				// sm.getTables.forEach(table => console.log(table)); // tablas en consola
				/* generate */
				const qh = new QuadHandler(sm);
				qh.push();
				value.forEach(ins => ins.generate(qh)); // obtener cuadruplas
				qh.pop();

				// qh.getQuads.forEach(q => console.log(q.toString())); // imprimir cuadruplas en consola

				this.compilerService.postCompiler(qh.getQuads)
					.then(console.log)
					.catch(console.log);
			}
		} catch (error) {
			console.error(error);
		}
	}

	setFunctions() {
		this.yy.Instruction = Instruction;
		this.yy.Operation = Operation; // Operacion
		this.yy.Variable = Variable;
		this.yy.OperationType = OperationType;
		this.yy.Statement = Statement; // declaracion de variables
		this.yy.Assignment = Assignment; // asignacion de variables
		this.yy.Printf = Printf; // imprimir
		this.yy.If = If;
		this.yy.IfInstruction = IfInstruction; // instrucciones if
		this.yy.While = While; // instruccion while
		this.yy.DoWhile = DoWhile; // instruction do-while
		this.yy.For = For; // instruccion for
		this.yy.Case = Case // case
		this.yy.Switch = Switch; // switch-case
		this.yy.Continue = Continue; // instruccion continuar
		this.yy.Break = Break // instruccion break;
		this.yy.Clear = Clear // instruccion clear;
		this.yy.Scanf = Scanf; // instruccion leer
		this.yy.Main = Main; // Metodo principal
	}
}
