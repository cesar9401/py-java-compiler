import { SymbolTable } from 'src/table/symbolTable';
import { Statement } from 'src/instruction/c/statement';
import { Instruction } from 'src/instruction/instruction';
import { Operation, OperationType } from 'src/instruction/c/operation';
import { Variable } from 'src/instruction/c/variable';
import { Assignment } from 'src/instruction/c/assignment';
import { Printf } from 'src/instruction/c/printf';
import { If } from 'src/instruction/c/if';
import { IfInstruction } from 'src/instruction/c/if_instruction';
import { While } from 'src/instruction/c/while';
import { DoWhile } from 'src/instruction/c/do_while';
import { For } from 'src/instruction/c/for';
import { Case } from 'src/instruction/c/case';
import { Switch } from 'src/instruction/c/switch';
import { Continue } from 'src/instruction/c/continue';
import { Break } from 'src/instruction/c/break';
import { Main } from 'src/instruction/c/main_c';
import { Clear } from 'src/instruction/c/clear';
import { Getch } from 'src/instruction/c/getch';
import { Scanf } from 'src/instruction/c/scanf';
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

				qh.getQuads.forEach(q => console.log(q.toString())); // imprimir cuadruplas en consola

				// this.compilerService.postCompiler(qh.getQuads)
				// 	.then(console.log)
				// 	.catch(console.log);
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
		this.yy.Getch = Getch // instruccion getch
		this.yy.Scanf = Scanf; // instruccion leer
		this.yy.Main = Main; // Metodo principal
	}
}
