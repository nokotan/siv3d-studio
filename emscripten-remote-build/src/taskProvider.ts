import * as vscode from 'vscode';
import { File, FileType } from './wasm-studio/models';
import { Language, Service } from './wasm-studio/service';

interface EmscriptenBuildTaskDefinition extends vscode.TaskDefinition {
	/**
     * Files to build
     */
	files?: string[];

    /**
     * Compiler Flags
     */
    flags: string[];

	/**
     * Output file name
     */
	outputName?: string;
}

export class CustomBuildTaskProvider implements vscode.TaskProvider {
	static CustomBuildScriptType = 'emcc';
	private tasks: vscode.Task[] | undefined;

	// We use a CustomExecution task when state needs to be shared across runs of the task or when 
	// the task requires use of some VS Code API to run.
	// If you don't need to share state between runs and if you don't need to execute VS Code API in your task, 
	// then a simple ShellExecution or ProcessExecution should be enough.
	// Since our build has this shared state, the CustomExecution is used below.
	private sharedState: string | undefined;

	constructor(private workspaceRoot: vscode.Uri) { }

	public async provideTasks(): Promise<vscode.Task[]> {
		return this.getTasks();
	}

	public resolveTask(_task: vscode.Task): vscode.Task | undefined {
		const definition: EmscriptenBuildTaskDefinition = <any>_task.definition;
		return this.getTask(definition);
	}

	private getTasks(): vscode.Task[] {
		if (this.tasks !== undefined) {
			return this.tasks;
		}
		this.tasks = [ this.getTask() ];
		return this.tasks;
	}

	private getTask(definition?: EmscriptenBuildTaskDefinition): vscode.Task {
		let redifined = definition || {
			type: "emcc",
			flags: []
		};
		
		return new vscode.Task(redifined, vscode.TaskScope.Workspace, "emcc build",
			CustomBuildTaskProvider.CustomBuildScriptType, new vscode.CustomExecution(async (): Promise<vscode.Pseudoterminal> => {
				// When the task is executed, this callback will run. Here, we setup for running the task.
				return new CustomBuildTaskTerminal(this.workspaceRoot, redifined, () => this.sharedState, (state: string) => this.sharedState = state);
			}));
	}
}

export class CustomBuildTaskTerminal implements vscode.Pseudoterminal {
	private writeEmitter = new vscode.EventEmitter<string>();
	onDidWrite: vscode.Event<string> = this.writeEmitter.event;
	private closeEmitter = new vscode.EventEmitter<number>();
	onDidClose?: vscode.Event<number> = this.closeEmitter.event;
	private textDecoder: TextDecoder;

	constructor(private workspaceRoot: vscode.Uri, private definition: EmscriptenBuildTaskDefinition, private getSharedState?: () => string | undefined, private setSharedState?: (state: string) => void) {
		this.textDecoder = new TextDecoder();
	}

	open(initialDimensions: vscode.TerminalDimensions | undefined): void {
		this.doBuild();
	}

	close(): void {

	}

	private async doBuild(): Promise<void> {
		if (!this.definition.files) {
			this.definition.files = [ "**/*.cpp" ]
		}

		console.log(`do build`);

		const fileURLsPromise = this.definition.files.map(async filePattern => {
			return await vscode.workspace.findFiles(filePattern);
		});
        const fileURLs = (await Promise.all(fileURLsPromise)).flat();
		const outputFileName = this.definition.outputName || "main.wasm"; 

        const filePromises = fileURLs.map(async url => {
            const content = await vscode.workspace.fs.readFile(url);
            const text = this.textDecoder.decode(content);
            const file = new File(url.toString(), FileType.Cpp);
            file.setData(text);
            return file;
        });

		this.writeEmitter.fire(`Executing 'emcc ${this.definition.files.join(" ")} ${this.definition.flags.join(" ")} -o ${outputFileName}'...\r\n`);

        const files = await Promise.all(filePromises);

        const outputs = await Service.compileFiles(files, Language.Cpp, Language.Wasm, this.definition.flags.join(" "));
		const outputFile = vscode.Uri.parse(`${this.workspaceRoot.toString()}/${outputFileName}`);
		this.writeEmitter.fire(outputs.console.replace(/\n/g, "\r\n"));
		await vscode.workspace.fs.writeFile(outputFile, new Uint8Array(outputs.files["a.wasm"] as ArrayBuffer));
			
		if (outputs.success) {
			this.writeEmitter.fire(`'${outputFileName}' is successfully emitted.\r\n`);
			this.closeEmitter.fire(0);
		} else {
			this.closeEmitter.fire(-1);
		}
	}
}
