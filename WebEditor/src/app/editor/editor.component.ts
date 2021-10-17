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
		this.root = new TreeNode("root", {icon: '<span>&#128449;</span>' });
		this.tree = new TreeView(this.root, document.querySelector('.folders-container'));

		/* obtenter proyectos */
		this.compilerService.getCompiler()
			.then(data => {
				this.projects = [];
				for(let i = 0; i < data.projects.length; i++) {
					this.projects.push(new Project(data.projects[i]))
				}

				/* renderizar proyectos :V */
				this.render = new Render(this.root, this.tree, this.code, this.projects);
				this.render.setProjects = this.projects;
				this.render.render();
			})
			.catch(console.log);
	}

	newProject(name: string) {
		let n = new TreeNode(name, {icon: '<span>&#128449;</span>' });
		this.root.addChild(n);
		this.tree.reload();
	}

	getSource(): void {
		let input:string = this.code.getValue();
		// se crea el parser
		const parser = new Parser(this.compilerService);
		parser.setInput(input);
	}

	addProject(name: string) {
		/* verificar que no exista proyectos con el mismo nombre */
		let n = new TreeNode(name, {icon: '<span>&#128449;</span>', allowsChildren: true, forceParent: true, type: 'project' });
		this.root.addChild(n);
		this.tree.reload();
	}

	addPackage(name: string) {
		console.log(`new package ${name}`);
	}

	addFile(name: string) {
		const n = this.tree.getSelectedNodes();
		if(n.length === 1) {
			if(n[0] !== this.root) {
				const father = n[0];
				const options = father.getOptions();
				if(options.type === 'project' || options.type === 'package') {
					/* verificar que no existe mismo nombre en el archivo */
					father.addChild(new TreeNode(name, {icon: '<span>&#128441;</span>', allowsChildren: false, forceParent: false, type: 'file' }));
					this.tree.reload();
				}
			}
		}
	}

	saveCurrent() {
		this.render?.saveCurrent();
	}
}
