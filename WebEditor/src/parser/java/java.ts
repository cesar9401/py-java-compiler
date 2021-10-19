import { SemanticHandler } from "src/control/semantic_handler";
import { SymbolTable } from "src/table/symbolTable";
import { Instruction } from "src/instruction/instruction";
import { QuadHandler } from "src/control/quad_handler";
import { Code } from "src/parser/main/code";
import { CodeBlock } from 'src/control/code_block';
import { CompilerService } from "src/service/compiler.service";
import { Variable } from "src/instruction/c/variable";
import { OperationType } from 'src/instruction/c/operation';
import { OperationJV } from "src/instruction/java/operation_jv";
import { StatementJV } from 'src/instruction/java/statement_jv';
import { AssignmentJV } from 'src/instruction/java/assignment_jv';
import { PrintJV } from 'src/instruction/java/print_jv';
import { IfJV } from 'src/instruction/java/if_jv';
import { IfInstructionJV } from 'src/instruction/java/if_instruction_jv';
import { ForJV } from 'src/instruction/java/for_jv';
import { ParamJV } from 'src/instruction/java/param_jv';
import { MethodJV } from 'src/instruction/java/method_jv';

declare var java: any;

export class Java {
	private source: Code;
	private yy: any;
	private blocks: CodeBlock[];

	constructor(private compilerService: CompilerService, source: Code, blocks: CodeBlock[]) {
		this.source = source;
		this.yy = java.yy;
		this.blocks = blocks;

		this.setFunctions();
	}

	parse() {
		try {
			const value: Instruction[] = java.parse(this.source.code);
			console.log(value);
		} catch (error) {
			console.error(error);
		}
	}

	setFunctions() {
		this.yy.line = this.source.first_line = 1;

		this.yy.Variable = Variable;
		this.yy.OperationType = OperationType;
		this.yy.OperationJV = OperationJV;
		this.yy.StatementJV = StatementJV;
		this.yy.AssignmentJV = AssignmentJV;
		this.yy.PrintJV = PrintJV;
		this.yy.IfJV = IfJV;
		this.yy.IfInstructionJV = IfInstructionJV;
		this.yy.ForJV = ForJV;
		this.yy.ParamJV = ParamJV;
		this.yy.MethodJV = MethodJV;
	}
}
