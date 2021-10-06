import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

@Injectable({
	providedIn: 'root'
})
export class CompilerService {
	url1: string = "https://api.github.com/users/cesar9401/repos";
	local: string = "http://localhost:3001/api/operation/";

	constructor(private http: HttpClient) {
	}

	getRepos(): Promise<any> {
		return this.http.get(this.url1).toPromise();
	}

	getLocal(): Promise<any> {
		return this.http.get(this.local).toPromise();
	}
}
