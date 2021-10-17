export class File {
	name: string;
	code: string;

	constructor(obj: any) {
		this.name = obj.name;
		this.code = obj.code;
	}
}
