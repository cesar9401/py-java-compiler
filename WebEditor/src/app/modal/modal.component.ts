import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
	selector: 'app-modal',
	templateUrl: './modal.component.html',
	styleUrls: ['./modal.component.css'],
})
export class ModalComponent implements OnInit {
	@Input() title: string = 'Titulo modal';
	@Input() element = 'Nombre elemento';
	@Input() id = 'id';

	@Output() name_element = new EventEmitter<string>();

	constructor() { }

	ngOnInit(): void { }

	sendInfo(name: HTMLInputElement) {
		this.name_element.emit(name.value);
		name.value = '';
	}
}
