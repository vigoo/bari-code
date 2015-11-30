import * as vscode from 'vscode'; 
import * as ext from './extension';

export default class Goals {
	
	private goals: vscode.StatusBarItem;
	private currentGoal: string;
	
	constructor(context: vscode.ExtensionContext, info: ext.AddonInfo) {
		this.goals = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);

		this.setCurrent(info.goals[0]); 
		
		var changeCurrentGoal = vscode.commands.registerCommand('bari.goal.changeCurrentGoal', () => {
			console.log('Changing current bari goal');
			vscode.window.showQuickPick(info.goals).then(result => {
				if (result != undefined) {
					this.setCurrent(result);
				}
			});
		});
	
		context.subscriptions.push(changeCurrentGoal);
		this.goals.command = 'bari.goal.changeCurrentGoal';
		this.goals.show();
	}
	
	public getCurrent(): string {
		return this.currentGoal;
	}
	
	private setCurrent(goal: string): void {
		this.currentGoal = goal;
		this.goals.text = this.currentGoal; 
	}
}