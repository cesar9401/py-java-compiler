import { Component, OnInit } from '@angular/core';
import { Parser } from '../../parser/parser';

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

	constructor() {
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
	int a = 1;
	int b = 25 + 12 / 2;
	float z = 12.25 * 1.75;
	char ch = 'A';
	// int x = a > b;

	// printf("El valor de a es: %d - %ff - %ccpppp\\n", a, z, ch);

	if(!(a > b)) {
		a = a + 1;
		//printf("El valor de a es: %d\\n", a);
	} else if(b == 31 || a == 1) {
		b = b ^ 2;
	// 	printf("%d\\n", b);
	} else {
		int x = a + b;
	// 	x = x + 1;
	// 	printf("%d\\n", x);
	}

	// if (!(a > b && a >= 1) && !!(z == 10)) {
	// 	a = a + b;
    // }
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
	}

	getSource(): void {
		let input:string = this.code.getValue();

		// se crea el parser
		const parser = new Parser();
		parser.setInput(input);
	}
}
