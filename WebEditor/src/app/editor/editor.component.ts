import { Component, OnInit } from '@angular/core';
import { Parser } from '../../parser/parser';

import { CompilerService } from 'src/service/compiler.service';

declare var CodeMirror:any;
declare var TreeNode: any;
declare var TreeView: any;

declare var python: any;

@Component({
	selector: 'app-editor',
	templateUrl: './editor.component.html',
	styleUrls: ['./editor.component.css'],
})
export class EditorComponent implements OnInit {

	code: any;
	root: any;
	view: any;
	info: string;
	value: string;

	constructor(private compilerService: CompilerService) {
		this.info = `Linea: 1, Columna: 0`;
		this.value = `
%%PY
	def demo1():
		n1 = 10
		n2 = 12
		result = n2 / n1
		// println("El numero es: ", number)
		// if number % 2 == 0:
		// 	number = number * -1

		// if number < 0:
		// 	number = number * -1

	// def demo2():
	// 	aux, number = 1, 2
	// 	aux = number * number + aux
	// 	number = aux + aux
	// 	// if aux < 0:
	// 	// 	number = number ^ 2
	// 	// elif aux == 0:
	// 	// 	number = number / 2

	// 	// while aux < 0 :
	// 	// 	println("El valor es ", aux)
	// 	// 	aux = aux + 1

%%JAVA

%%PROGRAMA

/*
#include PY.*;
#include JAVA.*;
*/

void main() {
	int a = 10;
	int b = a + 5;

	if(a == 10) {
		int x = a * 2;
		printf("El valor es: %d\\n", x);
	} else {
		int x = b * 2;
		printf("El valor es: %d\\n", x);
	}

	printf("Fin ejecucion :D\\n");

}\n`;

	}

	ngOnInit(): void {
		// code mirror
		this.code = new CodeMirror(document.querySelector('.code'), {
			lineNumbers: true,
			tabSize: 4,
			mode: "javascript",
			theme: "monokai",
			value: this.value
		});

		// evento del cursor
		this.code.on("cursorActivity", () => {
			const result = this.code.getCursor();
			this.info = `Linea: ${result.line + 1}, Columna: ${result.ch}`;
		});

		// treeview
		this.root = new TreeNode("root");
		let n1 = new TreeNode("tree.cpp");
		let n2 = new TreeNode("metodos.pyy");
		this.root.addChild(n1);
		this.root.addChild(n2);
		this.view = new TreeView(this.root, document.querySelector('.folders-container'));

		/* compiler service */
		// this.compilerService.getCompiler()
		// 	.then(console.log)
		// 	.catch(console.log);
		/* compiler service */
	}

	getSource(): void {
		let input:string = this.code.getValue();
		// se crea el parser
		const parser = new Parser(this.compilerService);
		parser.setInput(input);
	}
}
