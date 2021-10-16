import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Quadruple } from "src/table/quadruple";
import { CodeBlock } from "src/control/code_block";

@Injectable({
	providedIn: 'root'
})
export class CompilerService {
	url1: string = "https://api.github.com/users/cesar9401/repos";
	local: string = "http://localhost:3001/api/operation/";
	api: string = 'http://localhost:3000/api/compiler/';

	constructor(private http: HttpClient) {
	}

	getRepos(): Promise<any> {
		return this.http.get(this.url1).toPromise();
	}

	getLocal(): Promise<any> {
		return this.http.get(this.local).toPromise();
	}

	sendOperation() {
		const data = {
			ans: "10",
			operation: "10 ^ 2 + ans"
		};
		this.http.post(this.local, data).toPromise()
			.then(console.log)
			.catch(console.log);
	}

	getCompiler(): Promise<any> {
		return this.http.get(this.api).toPromise();
	}

	postCompiler(quads: Quadruple[]): Promise<any> {
		const data = { quads: quads }
		return this.http.post(this.api, data).toPromise();
	}

	sendCodeBlocks(blocks: CodeBlock[]): Promise<any> {
		const data = { blocks: blocks }
		return this.http.post(`${this.api}blocks/`, data).toPromise();
	}
}
