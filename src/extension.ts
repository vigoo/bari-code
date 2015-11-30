import * as vscode from 'vscode'; 
import * as proc from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

import Goals from './goals';
import Products from './products';

export interface AddonInfo {
	products: Array<string>;
	goals: Array<string>;
}

export function activate(context: vscode.ExtensionContext) {

	console.log('bari extension activated');
	
	getAddonInfo(
		(info) => {
			console.log("Got addon info: ");
			console.log(info);
			
			var goals = new Goals(context, info);
			var products = new Products(context, info);
			
			createBuildCommand(context, goals, products);
			createTestCommand(context, goals, products);
			createVsCommand(context, goals, products);
		},
		() => vscode.window.showWarningMessage("Failed to get bari suite information")
	);
	
	createOpenSuiteYamlCommand(context);			
	createSelfUpdateCommand(context);			
}

function createBuildCommand(context: vscode.ExtensionContext, goals: Goals, products: Products): void {
	var bariBuild = vscode.commands.registerCommand('bari.build', () => {
		console.log('Building the suite with bari');		
		runBari(
			withProduct(products.getCurrent(), withGoal(goals.getCurrent(), withVerbosity(["build"]))),
			() => vscode.window.showErrorMessage("Failed to build the suite"),
			() => vscode.window.showInformationMessage("bari build succesful!")
		);
	});
	context.subscriptions.push(bariBuild);
}

function createTestCommand(context: vscode.ExtensionContext, goals: Goals, products: Products): void {
	var bariTest = vscode.commands.registerCommand('bari.test', () => {
		console.log('Running the tests of the suite with bari');
		runBari(
			withProduct(products.getCurrent(), withGoal(goals.getCurrent(), withVerbosity(["test"]))),
			() => vscode.window.showErrorMessage("Failed to run the tests of the suite"),
			() => vscode.window.showInformationMessage("bari test succesful!")
		);
	});
	context.subscriptions.push(bariTest);	
}

function createVsCommand(context: vscode.ExtensionContext, goals: Goals, products: Products): void {
	var bariVs = vscode.commands.registerCommand('bari.vs', () => {
		console.log('Regenerating the solution file with bari');
		runBari(
			withProduct(products.getCurrent(), withGoal(goals.getCurrent(), withVerbosity(["vs"]))),
			() => vscode.window.showErrorMessage("Failed to generate the solution file"),
			() => vscode.window.showInformationMessage("bari vs succesful!")
		);
	});
	context.subscriptions.push(bariVs);
}

function createOpenSuiteYamlCommand(context: vscode.ExtensionContext): void {
	var bariOpenSuiteYaml = vscode.commands.registerCommand('bari.openSuiteYaml', () => {
		console.log('Opening bari suite.yaml');
				
		var yaml = path.join(vscode.workspace.rootPath, 'suite.yaml');
		if (fs.existsSync(yaml)) {
			vscode.workspace.openTextDocument(yaml).then(doc => {
				vscode.window.showTextDocument(doc);	
			});			
		} else {
			vscode.window.showErrorMessage("No suite.yaml in the current workspace!")
		}
	});
	context.subscriptions.push(bariOpenSuiteYaml);
}

function createSelfUpdateCommand(context: vscode.ExtensionContext): void {
	var bariSelfUpdate = vscode.commands.registerCommand('bari.selfUpdate', () => {
		console.log('Updating bari');
		runBari(
			withVerbosity(["selfupdate"]),
			() => vscode.window.showErrorMessage("Failed to update bari"),
			() => vscode.window.showInformationMessage("bari selfupdate succesful!")
		);
	});
	context.subscriptions.push(bariSelfUpdate);
}

function runBari(args: Array<string>, onFailure: ()=>void, onSuccess: ()=>void): void {
	var channel = vscode.window.createOutputChannel('bari');
	channel.show();
	var bari = proc.spawn(
		bariCmd(),
		args,
		{ cwd: vscode.workspace.rootPath,
		  stdio: 'pipe' 
		}
	);
		
	bari.stdout.on('data', buffer => {
		channel.append(buffer.toString());
	});
		
	bari.stderr.on('data', buffer => {
		channel.append(buffer.toString());
	});
		
	bari.on('close', exitCode => {
		if (exitCode) {
			onFailure();	
		}
		else {
			onSuccess();
		}	
	});		
}

function getAddonInfo(onSuccess: (AddonInfo)=>void, onFailure: ()=>void): void {
	var bari = proc.spawn(
		bariCmd(),
		["-q", "addon-info"],
		{ cwd: vscode.workspace.rootPath,
		  stdio: 'pipe'
		}
	);
	
	var output = ""
	bari.stdout.on('data', buffer => {
		output += buffer.toString();
	});

		
	bari.on('close', exitCode => {
		if (exitCode) {
			onFailure();
		} else {
			var info = JSON.parse(output);
			onSuccess(info);
		}
	});
}

function bariCmd(): string {
	var config = vscode.workspace.getConfiguration("bari");
	return config["commandLine"];
}

function verbose(): boolean {
	var config = vscode.workspace.getConfiguration("bari");
	return config["verboseOutput"];
}

function withVerbosity(args: Array<string>): Array<string> {
	if (verbose()) {
		return ["-v"].concat(args);
	} else {
		return args;
	}
}

function withGoal(goal: string, args: Array<string>): Array<string> {
	return ["--target", goal].concat(args);
}

function withProduct(product: string, args: Array<string>): Array<string> {
	if (product) {
		return args.concat([product]);
	} else {
		return args;
	}
}