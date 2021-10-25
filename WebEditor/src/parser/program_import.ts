import { File } from 'src/model/file';

export class ProgramImports {
	file: File;
	type: string;
	imports: string[];
	all: boolean;

	constructor(type: string, file: File, imports: string[], all: boolean) {
		this.type = type;
		this.file = file;
		this.imports = imports;
		this.all = all;
	}
}
