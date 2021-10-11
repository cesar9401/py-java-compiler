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

// break and continue
import { Break } from 'src/instruction/c/break';
import { Continue } from 'src/instruction/c/continue';

// return
import { ReturnPY } from 'src/instruction/py/return_py';


declare var python: any;

export class Python {
	private source: string;
	private yy: any;

	constructor(private compilerService: CompilerService, source: string) {
		this.source = source;
		this.yy = python.yy;
		this.setFunctions();
		console.log(this.source);
	}

	parse() {
		try {
			const value = python.parse(this.source);
			console.log(value);
		} catch (error) {
			console.error(error);
		}
	}

	setFunctions() {
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
