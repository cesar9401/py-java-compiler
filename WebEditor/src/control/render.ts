import { Project } from "src/model/project";
import { Package } from "src/model/package";
import { File } from "src/model/file";

declare var TreeNode: any;
declare var TreeView: any;

export class Render {
	root: any;
	tree: any;
	code: any;
	projects: Project[];
	parent: object;
	pckg: object;
	leaf: object;
	current?: File;

	constructor(root:any, tree: any, code: any, projects: Project[]) {
		this.root = root;
		this.tree = tree;
		this.code = code; // editor de codigo
		this.projects = projects;
		this.parent = {icon: '<span>&#128449;</span>', allowsChildren: true, forceParent: true, type: 'project' };
		this.pckg = {icon: '<span>&#128449;</span>', allowsChildren: true, forceParent: true, type: 'package' };
		this.leaf = {icon: '<span>&#128441;</span>', allowsChildren: false, forceParent: false, type: 'file' };
	}

	/* renderizar proyectos */
	render() {
		this.projects.forEach(pro => {
			/* agregar proyecto */
			const n = new TreeNode(pro.name, this.parent);

			/* agregar archivos sueltos */
			pro.files.forEach(f => {
				const p = new TreeNode(f.name, this.leaf);

				/* agruegar evento para mostrar codigo */
				p.on('click', (event: any, node: any) => {
					this.current = f;
					this.code.setValue(f.code);
				});

				n.addChild(p);
			});

			/* agregar paquetes */
			pro.content.forEach(pack => {
				this.renderPackage(n, pack);
			})

			this.root.addChild(n);
			this.tree.reload();
		});
	}

	/* renderizar paquetes de un proyecto o de otros paquetes */
	renderPackage(n: typeof TreeNode, package_: Package) {
		/* agregar paquete */
		const p = new TreeNode(package_.name, this.pckg);

		/* agregar archivos del paquete */
		package_.files.forEach(f => {
			const file = new TreeNode(f.name, this.leaf);

			/* agruegar evento para mostrar codigo */
			file.on('click', (event: any, node: any) => {
				this.current = f;
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

	saveCurrent() {
		if(this.current) {
			this.current.code = this.code.getValue();
		}
	}
}
