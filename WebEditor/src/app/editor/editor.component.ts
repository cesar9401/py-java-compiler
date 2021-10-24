import { Component, OnInit } from '@angular/core';
import { Parser } from '../../parser/parser';
import { CompilerService } from 'src/service/compiler.service';
import { Project } from 'src/model/project';
import { Render } from 'src/control/render';

declare var CodeMirror:any;
declare var TreeNode: any;
declare var TreeView: any;

@Component({
	selector: 'app-editor',
	templateUrl: './editor.component.html',
	styleUrls: ['./editor.component.css'],
})
export class EditorComponent implements OnInit {
	code: any;
	root: any;
	tree: any;
	info: string;
	projects: Project[];
	render?: Render;

	constructor(private compilerService: CompilerService) {
		this.info = `Linea: 1, Columna: 0`;
		this.projects = [];
	}

	ngOnInit(): void {
		// code mirror
		this.code = new CodeMirror(document.querySelector('.code'), {
			lineNumbers: true,
			tabSize: 4,
			mode: "javascript",
			theme: "monokai"
		});

		// evento del cursor
		this.code.on("cursorActivity", () => {
			const result = this.code.getCursor();
			this.info = `Linea: ${result.line + 1}, Columna: ${result.ch}`;
		});

		// treeview
		//this.root = new TreeNode("root", {icon: '<span>&#128449;</span>' });
		//this.tree = new TreeView(this.root, document.querySelector('.folders-container'));

		/* obtenter proyectos */
		this.compilerService.getCompiler()
			.then(data => {
				this.projects = [];
				for(let i = 0; i < data.projects.length; i++) {
					this.projects.push(new Project(data.projects[i]))
				}

				/* renderizar proyectos :V */
				this.render = new Render(this.compilerService, this.code, this.projects);
				this.render.setProjects = this.projects;
				this.render.render();
			})
			.catch(console.log);
	}

	getSource(): void {
		/* obtener proyecto */
		if(this.render) {
			/* enviar cambios? */

			const project: Project | undefined = this.render.getProject;
			const current = this.render.current;
			if(project && current) {
				const parser = new Parser(this.compilerService, current, project);
				parser.getSources();
				// let input:string = this.code.getValue();
			}
		}
	}

	addProject(name: string) {
		this.render?.addProject(name);
	}

	addPackage(name: string) {
		this.render?.addPackage(name);
	}

	addFile(name: string) {
		this.render?.addFile(name);
	}

	saveCurrent() {
		this.render?.saveCurrent();
	}

	delete() {
		this.render?.delete();
	}

	getFile() {
		// this.compilerService.getBinaryFile()
		// 	.subscribe(response => {
		// 		console.log(response);
		// 	})
	}
}
