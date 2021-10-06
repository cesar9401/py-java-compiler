import { Component, OnInit } from '@angular/core';
import { Parser } from '../../parser/parser';

import { CompilerService } from 'src/service/compiler.service';


declare var CodeMirror:any;
declare var TreeNode: any;
declare var TreeView: any;

@Component({
	selector: 'app-editor',
	templateUrl: './editor.component.html',
	styleUrls: ['./editor.component.css'],
})
export class EditorComponent implements OnInit {

	code: any;
	root: any;
	view: any;
	//parser: Parser;
	info: string;
	value: string;

	constructor(private compilerService: CompilerService) {
		this.info = `Linea: 1, Columna: 0`;
		this.value = `
%%PY

%%JAVA

%%PROGRAMA

/*
#include PY.*;
#include JAVA.*;
const int size = 10;
int i = 100 + size;
char x = 'a';
int count;
*/

void main() {
	int a = 10;
	int b = 25 + 12 / 2;

	if(a == 10) {
		int x = a + 1;
		printf("El valor es: %d\\n", x);
	} else {
		int x = a + 2;
		printf("El valor es %d\\n", x);
	}

	for(int i = 0; i < 10; i = i + 1) {
		int z = i + 1;
		printf("%d -> ", z);
	}

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


		/* github service */
		// this.compilerService.getRepos().then(values => {
		// 	for(let i = 0; i < values.length; i++) {
		// 		console.log(values[i].full_name);
		// 	}
		// });
		/* github service */

		/* local service */
		// this.compilerService.getLocal().then(console.log);
		/* local service */
	}

	getSource(): void {
		let input:string = this.code.getValue();

		// se crea el parser
		const parser = new Parser();
		parser.setInput(input);
	}
}
