import { Quadruple } from "src/table/quadruple";

export class QuadHandler {
	private quads: Quadruple[];
	private labels: number[];
	private tmps: number[];
	private isTrue: Quadruple[];
	private isFalse: Quadruple[];
	private map: Map<Quadruple, number>;
	labelTrue: string | undefined;
	labelFalse: string | undefined;

	constructor() {
		this.quads = [];
		this.labels = [];
		this.tmps = [];

		this.isTrue = [];
		this.isFalse = [];

		this.map = new Map();
	}

	public get getQuads(): Quadruple[] {
		return this.quads;
	}

	public addQuad(quad: Quadruple): void {
		this.quads.push(quad);
	}

	public addTrue(quad: Quadruple): void {
		this.isTrue.push(quad);
	}

	public addFalse(quad: Quadruple): void {
		this.isFalse.push(quad);
	}

	public switch(): void {
		const aux = [];
		for(const fl of this.isFalse) {
			if(!this.map.has(fl)) {
				this.map.set(fl, 1);
			} else {
				const n = this.map.get(fl);
				if(n) {
					this.map.set(fl, n + 1);
				}
			}
			aux.push(fl);
		}

		this.isFalse = [];
		for(const tr of this.isTrue) {
			if(!this.map.has(tr)) {
				this.map.set(tr, 1);
			} else {
				const n = this.map.get(tr);
				if(n) {
					this.map.set(tr, n + 1);
				}
			}
			this.isFalse.push(tr);
		}

		this.isTrue = [...aux];

		console.log(this.isTrue[0]);
		console.log(this.isFalse[0]);
		console.log(this.map);
	}

	public getTmp(): string {
		const size = this.tmps.length + 1;
		this.tmps.push(size);
		return `t${size}`;
	}

	public getLabel(): string {
		const label = this.labels.length + 1;
		this.labels.push(label);
		return `L${label}`;
	}

	public toTrue(label: string) {
		while(this.isTrue.length > 0) {
			const tmp = this.isTrue.pop();
			if(tmp) {
				tmp.result = label;
			}
		}
	}

	public toFalse(label: string) {
		while(this.isFalse.length > 0) {
			const tmp = this.isFalse.pop();
			if(tmp) {
				tmp.result = label;
			}
		}
	}
}
