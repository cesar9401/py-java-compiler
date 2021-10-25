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
import { WhileJV } from 'src/instruction/java/while_jv';
import { DoWhileJV } from 'src/instruction/java/do_while_jv';
import { Break } from 'src/instruction/c/break';
import { Continue } from 'src/instruction/c/continue';
import { ReturnJV } from 'src/instruction/java/return_jv';
import { CaseJV } from 'src/instruction/java/case_jv';
import { SwitchJV } from 'src/instruction/java/switch_jv';
import { ClassJV } from 'src/instruction/java/class_jv';
import { ConstructorJV } from 'src/instruction/java/constructor_jv';
import { FunctionCallJV } from 'src/instruction/java/function_call_jv';
import { Error, TypeE } from 'src/control/error';
import { AbsParser } from "../abs_parser";

declare var java: any;

export class Java extends AbsParser{
	private yy: any;
	/* para almacenar las clases java */
	classes: ClassJV[];
	private sm: SemanticHandler;
	private qh: QuadHandler;
	private value: Instruction[];

	constructor(source: Code, blocks: CodeBlock[], errors: Error[]) {
		super(source, blocks, errors);
		this.yy = java.yy;
		this.classes = [];
		this.value = [];
		this.sm = new SemanticHandler();
		this.qh = new QuadHandler(this.sm, this.blocks);
		this.setFunctions();
	}

	parse() {
		try {
			// console.log("JAVA");
			this.value = java.parse(this.source.code);
			// console.log(this.value);

			this.sm.setClasses = [];

			const table= new SymbolTable(this.sm.peek());

			for(const instruction of this.value) {
				instruction.run(table, this.sm);
			}

			this.classes = this.sm.getClasses; // obtener las clases java

			/* agregar todos los errores recogidos */
			this.sm.errors.forEach(e => {
				e.file = this.source.name;
				this.errors.push(e);
			})

		} catch (error) {
			console.error(error);
		}
	}

	generate() {
		for(const instruction of this.value) {
			instruction.generate(this.qh);
		}
	}

	setFunctions() {
		this.yy.line = this.source.first_line - 1;

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
		this.yy.WhileJV = WhileJV;
		this.yy.DoWhileJV = DoWhileJV;
		this.yy.Break = Break;
		this.yy.Continue = Continue;
		this.yy.ReturnJV = ReturnJV;
		this.yy.CaseJV = CaseJV;
		this.yy.SwitchJV = SwitchJV;
		this.yy.ClassJV = ClassJV;
		this.yy.ConstructorJV = ConstructorJV;
		this.yy.FunctionCallJV = FunctionCallJV;
	}
}
