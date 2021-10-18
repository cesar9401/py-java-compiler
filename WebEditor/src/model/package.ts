import { File } from "./file";

export class Package {
	name: string;
	files: File[];
	content: Package[];

	constructor(name: string, files: File[], content: Package[]);
	constructor(obj: any);

	constructor(...args: Array<any>) {
		if(args.length === 1) {
			this.name = args[0].name;
			this.files = [];
			this.content = [];

			for(let i = 0; i < args[0].files.length; i++) {
				this.files.push(new File(args[0].files[i]));
			}

			for(let i = 0; i < args[0].content.length; i++) {
				this.content.push(new Package(args[0].content[i]));
			}
		} else {
			this.name = args[0];
			this.files = args[1];
			this.content = args[2];
		}
	}
}
