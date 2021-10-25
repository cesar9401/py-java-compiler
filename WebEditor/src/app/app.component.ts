import { Component } from '@angular/core';
import { Error } from 'src/control/error';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css']
})
export class AppComponent {
	title = 'WebEditor';
	editor: boolean = true;
	errores: boolean = false;
	resultado: boolean = false;
	errors: Error[];
	data: string;

	constructor() {
		this.errors = [];
		this.data = '';
	}

	setEditor() {
		this.editor = true;
		this.errores = false;
		this.resultado = false;
	}

	setErrores() {
		this.errores = true;
		this.editor = false;
		this.resultado = false;
	}

	setResultado() {
		this.resultado = true;
		this.editor = false;
		this.errores = false;
	}

	getErrors(errors: Error[]) {
		this.errors = [];
		this.errors = errors;
		this.setErrores();
	}

	getResponse(data: string) {
		this.data = data;
		this.setResultado();
	}
}
