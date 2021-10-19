import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Quadruple } from "src/table/quadruple";
import { CodeBlock } from "src/control/code_block";
import { Project } from "src/model/project";

@Injectable({
	providedIn: 'root'
})
export class CompilerService {
	api: string = 'http://localhost:3000/api/compiler/';

	constructor(private http: HttpClient) {
	}

	/* obtener todos los proyectos */
	getCompiler(): Promise<any> {
		return this.http.get(this.api).toPromise();
	}

	/* post de prueba para escribir un archivo con codigo 3d en c */
	postCompiler(quads: Quadruple[]): Promise<any> {
		const data = { quads: quads }
		return this.http.post(this.api, data).toPromise();
	}

	/* enviar bloques de codigo para compilar */
	sendCodeBlocks(blocks: CodeBlock[]): Promise<any> {
		const data = { blocks: blocks }
		return this.http.post(`${this.api}blocks/`, data).toPromise();
	}

	/* enviar cambios en los proyectos */
	sendChangesOnProjects(projects: Project[]): Promise<any> {
		const data = { projects: projects };
		return this.http.put(this.api, data).toPromise();
	}

	getBinaryFile() {
		// /project.out
		return this.http.get(`${this.api}project.out`);
	}
}
