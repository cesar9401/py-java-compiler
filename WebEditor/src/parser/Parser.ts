declare var python:any;
declare var java:any;
declare var program:any;

export class Parser {
	input: string;
	regx: RegExp;

	constructor(input: string) {
		this.input = input;
		this.regx = /(([^\n\r]|\n)*)(%%PY([^\n\r]|\n)*)(%%JAVA([^\n\r]|\n)*)(%%PROGRAMA([^\n\r]|\n)*)/;
	}
}
