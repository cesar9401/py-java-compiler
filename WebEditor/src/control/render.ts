import { Project } from "src/model/project";
import { Package } from "src/model/package";
import { File } from "src/model/file";
import { CompilerService } from 'src/service/compiler.service';

declare var TreeNode: any;
declare var TreeView: any;

export class Render {
	compilerService: CompilerService;

	root: any;
	tree: any;
	code: any;
	projects: Project[];
	// parent: object;
	// pckg: object;
	// leaf: object;
	current?: File;
	currentNode?: typeof TreeNode;

	constructor(private compilerServie: CompilerService, code: any, projects: Project[]) {
		// this.root = root;
		// this.tree = tree;
		this.compilerService = compilerServie;

		this.code = code; // editor de codigo
		this.projects = projects;
	}

	/* renderizar proyectos */
	render() {
		// treeview
		this.root = new TreeNode("root", {icon: '<span>&#128449;</span>' });
		this.tree = new TreeView(this.root, document.querySelector('.folders-container'));

		this.projects.forEach(pro => {
			/* agregar proyecto */
			const n = new TreeNode(pro.name, {icon: '<span>&#128449;</span>', allowsChildren: true, forceParent: true, type: 'project', file: pro });

			/* agregar archivos sueltos */
			pro.files.forEach(f => {
				const p = new TreeNode(f.name, {icon: '<span>&#128441;</span>', allowsChildren: false, forceParent: false, type: 'file', file: f });

				/* agruegar evento para mostrar codigo */
				p.on('click', (event: any, node: any) => {
					this.current = f;
					this.currentNode = node;
					this.code.setValue(f.code);
				});

				n.addChild(p);
			});

			/* agregar paquetes */
			pro.content.forEach(pack => {
				this.renderPackage(n, pack);
			});

			this.root.addChild(n);
			this.tree.reload();
		});
	}

	/* renderizar paquetes de un proyecto o de otros paquetes */
	renderPackage(n: typeof TreeNode, package_: Package) {
		/* agregar paquete */
		const p = new TreeNode(package_.name, {icon: '<span>&#128449;</span>', allowsChildren: true, forceParent: true, type: 'package', file: package_ });

		/* agregar archivos del paquete */
		package_.files.forEach(f => {
			const file = new TreeNode(f.name, {icon: '<span>&#128441;</span>', allowsChildren: false, forceParent: false, type: 'file', file: f });

			/* agruegar evento para mostrar codigo */
			file.on('click', (event: any, node: any) => {
				this.current = f;
				this.currentNode = node;
				this.code.setValue(f.code);
			});

			p.addChild(file);
		});

		/* agregar paquetes del paquete */
		package_.content.forEach(pack => {
			this.renderPackage(p, pack);
		});

		n.addChild(p);
	}

	set setProjects(projects: Project[]) {
		this.projects = projects;
	}

	/* guardar cambios en el fichero actual */
	saveCurrent() {
		if(this.current) {
			this.current.code = this.code.getValue();

			/* enviar cambios */
			this.sendChanges();
		}
	}

	/* agregar proyectos */
	addProject(name: string) {
		/* verificar que no exista proyectos con el mismo nombre */
		const isPresent = this.projects.some(pro => pro.name === name);
		if(!isPresent) {
			const project = new Project(name, [], []);
			this.projects.push(project);

			/* renderizar */
			this.render();

			/* enviar cambios */
			this.sendChanges();
		}
	}

	/* agregar paquetes */
	addPackage(name: string) {
		const n = this.tree.getSelectedNodes();
		if(n.length === 1) {
			if(n[0] !== this.root) {
				const options = n[0].getOptions();
				if(options.type === 'project' || options.type === 'package') {
					const father: Project | Package = options.file;
					/* revisar que father no tenga hijos/paquetes con el mismo nombre */
					const present = father.content.some(p => p.name === name);

					if(!present) {
						const pckg = new Package(name, [], []);
						father.content.push(pckg);

						/* renderizar */
						this.render();

						/* enviar cambios */
						this.sendChanges();
					}
				}
			}
		}
	}

	/* agregar archivos de codigo mlg */
	addFile(name: string) {
		const n = this.tree.getSelectedNodes();
		if(n.length === 1) {
			if(n[0] !== this.root) {
				const options = n[0].getOptions();
				if(options.type === 'project' || options.type === 'package') {
					const father: Project | Package = options.file;
					const present = father.files.some(p => p.name === `${name}.mlg`);

					if(!present) {
						const pckg = this.getPackage(n[0]);
						let line = pckg ? `paquete ${pckg};\n/* write your code here */` : `/* write your code here */`;
						line += `\n\n%%PY\n\n\n%%JAVA\n\n\n%%PROGRAMA\n\n`;
						const file = new File(`${name}.mlg`, line);
						father.files.push(file);

						/* renderizar */
						this.render();

						/* enviar cambios */
						this.sendChanges();
					}
				}
			}
		}
	}

	private getPackage(father: typeof TreeNode): string {
		let result = ``;
		let aux = father;

		while(aux.getOptions().type !== 'project') {
			result = aux.toString() + (result ? `.${result}` : ``);
			aux = aux.parent;
		}

		return result;
	}

	public get getProject(): Project | undefined {
		if(this.currentNode) {
			let aux = this.currentNode;
			while(aux.getOptions().type !== 'project') {
				aux = aux.parent;
			}

			const project: Project = aux.getOptions().file;
			return project;
		}

		return;
	}

	delete() {
		const n = this.tree.getSelectedNodes();
		if(n.length === 1){
			if(n[0] !== this.root) {
				const element = n[0].getOptions().file;
				if(element instanceof Project) {
					const index = this.projects.indexOf(element);
					const projectDel: Project[] = this.projects.splice(index, 1);
					console.log(projectDel)
				} else if(element instanceof Package) {
					const father: Project | Package = n[0].parent.getOptions().file;
					const index = father.content.indexOf(element);
					const pckgDel: Package[] = father.content.splice(index, 1);
					console.log(pckgDel);
				} else if(element instanceof File) {
					const father: Project | Package = n[0].parent.getOptions().file;
					const index = father.files.indexOf(element);
					const fileDel: File[] = father.files.splice(index, 1);
					console.log(fileDel);
				}

				/* renderizar */
				this.render();
				/* enviar cambios */
				this.sendChanges();
			}
		}
	}

	/* enviar cambios hacia base de datos en servidor */
	private sendChanges() {
		this.compilerService.sendChangesOnProjects(this.projects)
		.then(console.log)
		.catch(console.log);
	}
}
