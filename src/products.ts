import * as vscode from 'vscode'; 
import * as ext from './extension';

export default class Products {
	
	private products: vscode.StatusBarItem;
	private currentProduct: string;
	
	constructor(context: vscode.ExtensionContext, info: ext.AddonInfo) {
		this.products = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);

		if (info.products.length > 0) {
			this.setCurrent(info.products[0]);
		} 
		
		var changeCurrentGoal = vscode.commands.registerCommand('bari.goal.changeCurrentProduct', () => {
			console.log('Changing current bari product');
			vscode.window.showQuickPick(info.products).then(result => {
				if (result) {
					this.setCurrent(result);
				}
			});
		});
	
		context.subscriptions.push(changeCurrentGoal);
		this.products.command = 'bari.goal.changeCurrentProduct';
		this.products.show();
	}
	
	public getCurrent(): string {
		return this.currentProduct;
	}
	
	private setCurrent(product: string): void {
		this.currentProduct = product;
		this.products.text = this.currentProduct || "default"; 
	}
}