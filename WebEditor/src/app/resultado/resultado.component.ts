import { Component, Input, OnInit } from '@angular/core';
import { CompilerService } from 'src/service/compiler.service';

declare var CodeMirror:any;

@Component({
	selector: 'app-resultado',
	templateUrl: './resultado.component.html',
	styleUrls: ['./resultado.component.css']
})
export class ResultadoComponent implements OnInit {

	code: any;
	private data: string;

	@Input() set setData(data:string) {
		this.data = data;
		if(this.code) {
			this.code.setValue(this.data);
		}
	}

	constructor(private compilerService: CompilerService) {
		this.data = '';
	}

	ngOnInit(): void {
		/* code mirror */
		this.code = new CodeMirror(document.querySelector('.result'), {
			lineNumbers: true,
			tabSize: 4,
			mode: "javascript",
			theme: "monokai"
		});
	}

	downloadData() {
		this.compilerService.getBinaryFile().subscribe(response => {
			this.manageBlobFile(response);
		})
	}

	manageBlobFile(response: any) {
		const dataType = response.type;
		const binaryData = [];
		binaryData.push(response);
		console.log(binaryData);
		const filtePath = window.URL.createObjectURL(new Blob(binaryData, {type: dataType}));
		const downloadlink = document.createElement('a');
		downloadlink.href = filtePath;
		downloadlink.setAttribute('download', "project.out");
		document.body.appendChild(downloadlink);
		downloadlink.click();
	}

	downloadCode() {
		this.compilerService.getCFile().subscribe(response => {
			// console.log(response);
			this.manageCFile(response);
		});
	}

	manageCFile(response: any) {
		const dataType = response.type;
		const binaryData = [];
		binaryData.push(response);
		console.log(binaryData);
		const filtePath = window.URL.createObjectURL(new Blob(binaryData, {type: dataType}));
		const downloadlink = document.createElement('a');
		downloadlink.href = filtePath;
		downloadlink.setAttribute('download', "project.c");
		document.body.appendChild(downloadlink);
		downloadlink.click();
	}
}
