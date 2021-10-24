import { CompilerService } from "src/service/compiler.service";
import { Variable } from "src/instruction/c/variable";
import { OperationType } from 'src/instruction/c/operation';
import { OperationPY } from 'src/instruction/py/operation_py';
import { AssignmentPY } from 'src/instruction/py/assignment_py';
import { IfPY } from 'src/instruction/py/if_py'
import { IfInstructionPY } from 'src/instruction/py/if_instruction_py';
import { PrintPY } from "src/instruction/py/print_py";
import { WhilePY } from "src/instruction/py/while_py";
import { ForPY } from "src/instruction/py/for_py";
import { FunctionPY } from 'src/instruction/py/function_py';
import { Instruction } from "src/instruction/instruction";
import { SymbolTable } from "src/table/symbolTable";
import { SemanticHandler } from "src/control/semantic_handler";
import { QuadHandler } from "src/control/quad_handler";
import { Break } from 'src/instruction/c/break';
import { Continue } from 'src/instruction/c/continue';
import { ReturnPY } from 'src/instruction/py/return_py';
import { Code } from 'src/parser/main/code';
import { CodeBlock } from 'src/control/code_block';
import { Error, TypeE } from 'src/control/error';
import { AbsParser } from "../abs_parser";

declare var python: any;

export class Python extends AbsParser{
	private yy: any;
	/* para almacenar las funciones python */
	functions: FunctionPY[];
	private sm: SemanticHandler;

	constructor(source: Code, blocks: CodeBlock[], errors: Error[]) {
		super(source, blocks, errors);
		this.yy = python.yy;
		this.sm = new SemanticHandler();
		this.functions = [];
		this.setFunctions();
	}

	parse() {
		try {
			console.log("PY");
			const value: Instruction[] = python.parse(this.source.code);
			console.log(value);

			//const sm = new SemanticHandler();
			this.sm.setFunctions = [];
			const table = new SymbolTable(this.sm.peek());
			// sm.pushTable(table);

			for(const ins of value) {
				ins.run(table, this.sm);
			}

			this.functions = this.sm.getFunctions; // devolver funciones python

			// if(sm.errors.length > 0) {
			// 	sm.errors.forEach(e => console.log(e.toString()));
			// } else {
				// generar Cuadruplos
				// console.log(sm.getTables);
				// const qh = new QuadHandler(sm, this.blocks);
				// value.forEach(v => v.generate(qh));

				// // console.log("PY");
				// // qh.getQuads.forEach(q => console.log(q.toString()));

				// // this.compilerService.postCompiler(qh.getQuads)
				// // 	.then(console.log)
				// // 	.catch(console.log);
			// }

		} catch (error) {
			console.error(error);
		}
	}

	setFunctions() {
		this.yy.line = this.source.first_line - 1;

		this.yy.Variable = Variable;
		this.yy.OperationType = OperationType;
		this.yy.OperationPY = OperationPY;
		this.yy.AssignmentPY = AssignmentPY;
		this.yy.IfPY = IfPY;
		this.yy.IfInstructionPY = IfInstructionPY;
		this.yy.PrintPY = PrintPY;
		this.yy.WhilePY = WhilePY;
		this.yy.ForPY = ForPY;
		this.yy.FunctionPY = FunctionPY;
		this.yy.ReturnPY = ReturnPY;
		this.yy.Break = Break;
		this.yy.Continue = Continue;
	}
}
