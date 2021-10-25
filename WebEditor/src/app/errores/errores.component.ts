import { Component, Input, OnInit } from '@angular/core';
import { Error } from 'src/control/error';

@Component({
	selector: 'app-errores',
	templateUrl: './errores.component.html',
	styleUrls: ['./errores.component.css']
})
export class ErroresComponent implements OnInit {

	@Input() errors: Error[];

	constructor() {
		this.errors = [];
	}

	ngOnInit(): void {
	}

}
