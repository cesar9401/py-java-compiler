export class File {
	name: string;
	code: string;

	constructor(name: string, code: string);
	constructor(obj: any);

	constructor(...args: Array<any>) {
		if(args.length === 1) {
			this.name = args[0].name;
			this.code = args[0].code;
		} else  {
			this.name = args[0];
			this.code = args[1];
		}
	}
}
