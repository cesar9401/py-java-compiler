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
import { FunctionCall } from 'src/instruction/c/function_call';
import { CreateClass } from 'src/instruction/c/create_class';
import { SemanticHandler } from 'src/control/semantic_handler';
import { QuadHandler } from 'src/control/quad_handler';
import { ArrayStatement } from 'src/instruction/c/array_statement';
import { ArrayAccess } from 'src/instruction/c/array_access';
import { ArrayAssignment } from 'src/instruction/c/array_assignment';
import { CompilerService } from 'src/service/compiler.service';
import { Code } from 'src/parser/main/code';
import { CodeBlock } from 'src/control/code_block';
import { ClassJV } from 'src/instruction/java/class_jv';
import { FunctionPY } from 'src/instruction/py/function_py';
import { Include } from 'src/instruction/c/include';
import { Error, TypeE } from 'src/control/error';

declare var program: any;

export class Program {
	private source: Code;
	private yy: any;
	private blocks: CodeBlock[];
	private errors: Error[];
	private sm: SemanticHandler;
	private qh: QuadHandler;
	private value: Instruction[];

	/* almacenar funciones py */
	functions: FunctionPY[];

	/* almacenar las clases java */
	classes: ClassJV[];

	constructor(source: Code, blocks: CodeBlock[], errors: Error[]) {
		this.yy = program.yy;
		this.source = source;
		this.blocks = blocks;
		this.errors = errors;
		this.functions = [];
		this.classes = [];
		this.value = [];

		this.sm = new SemanticHandler();
		this.qh = new QuadHandler(this.sm, this.blocks);
		this.setFunctions();
	}

	parseTest() {
		this.value = program.parse(this.source.code);
		console.log(this.value);

		/* funciones py y clases java */

		/* table de simbolos */
		this.sm.push("global");
		const table = new SymbolTable(this.sm.peek());
		this.sm.pushTable(table);

		for(const instruction of this.value) {
			instruction.run(table, this.sm);
		}

		if(this.sm.errors.length) {
			this.sm.errors.forEach(e => console.log(e.toString()));
		} else {
			this.sm.getTables.forEach(t => console.log(t));

			this.qh.push();
			for(const instruction of this.value) {
				instruction.generate(this.qh);
			}
			this.qh.pop();

			/* agregar bloque aqui */
			this.qh.getQuads.forEach(q => console.log(q.toString()));
		}

	}

	parse() {
		try {
			// console.log(`PROGRAM`);
			this.value = program.parse(this.source.code);
			// console.log(this.value);

			/* run */
			this.sm.setFunctions = this.functions; // setear this.functions a this.sm, viene desde parser.ts
			this.sm.setClasses = this.classes; // setear las clases java

			this.sm.push("global");
			const table = new SymbolTable(this.sm.peek());
			this.sm.pushTable(table);

			for(const ins of this.value) {
				ins.run(table, this.sm);
			}

			this.sm.errors.forEach(e => {
				e.file = this.source.name;
				this.errors.push(e);
			});

		} catch (error) {
			console.error(error);
		}
	}

	generate() {
		this.qh.push();
		for(const instruction of this.value) {
			instruction.generate(this.qh);
		}
		this.qh.pop();
		this.qh.addCodeBlock(new CodeBlock("MAIN", this.qh.getQuads));
		this.qh.cleanQuads();
	}

	getIncludes(): Include[] {
		try {
			const includes: Include[] = [];
			const value: Instruction[] = program.parse(this.source.code);
			for(const instruction of value) {
				if(instruction instanceof Include) {
					includes.push(instruction);
				}
			}
			return includes;

		}catch(error) {
			console.error(error);
			return [];
		}
	}

	setFunctions() {
		this.yy.line = this.source.first_line - 1;

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
		this.yy.FunctionCall = FunctionCall; // llamada de funciones
		this.yy.ArrayStatement = ArrayStatement; // declaracion de arreglo
		this.yy.ArrayAccess = ArrayAccess; // para acceder a un arreglo
		this.yy.ArrayAssignment = ArrayAssignment; // Asignacion a un arreglo
		this.yy.CreateClass = CreateClass; // crear clases
		this.yy.Include = Include; // incluir otros archivos
	}
}
