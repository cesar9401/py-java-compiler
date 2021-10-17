import { File } from "./file";
import { Package } from "./package";

export class Project {
	name: string;
	files: File[];
	content: Package[];

	constructor(obj: any) {
		this.name = obj.name;
		this.files = [];
		this.content = [];

		for(let i = 0; i < obj.files.length; i++) {
			this.files.push(new File(obj.files[i]));
		}

		for(let i = 0; i < obj.content.length; i++) {
			this.content.push(new Package(obj.content[i]));
		}
	}
}
