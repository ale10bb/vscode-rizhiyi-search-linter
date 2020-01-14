// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { returnCompletionItemfromJSON } from './splunkParser';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "vscode-splunk-search-linter" is now active!');
	
	// Define document selector
	let splunkSelector:vscode.DocumentSelector = {
		scheme: 'file',
		language: 'splunk'
	};
	const mainFunctions = returnCompletionItemfromJSON(context, 'Command_description_Related_table3');
	const evalFunctions = returnCompletionItemfromJSON(context, 'eval_functions-syntax_description_type');
	const statsFunctions = returnCompletionItemfromJSON(context, 'stats_functions-syntax_description_type');
	const operators = returnCompletionItemfromJSON(context, 'operators-syntax_description_type');

	console.log("Start providing completion items");
	// Here we will start our Completion provider
	let splunkProvider = vscode.languages.registerCompletionItemProvider(splunkSelector, {
		provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext) {
			console.log("Providing base completion items");
			return mainFunctions.concat(evalFunctions, statsFunctions, operators);
		}
	});

	// Here we suggest new commands after eval functions
	let evalSplunkProvider = vscode.languages.registerCompletionItemProvider(
		splunkSelector,
		{
			provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
				console.log("Providing eval completion items");
				// matches: pipe followed by 0 or more space followed by "eval" 0 or more space
				// followed by 1 or more word-types followed by 0 or more space followed by "="
				// followed by 0 or more space
				let regexp = new RegExp('eval[\\s]+[\\w\\-\\_]+[\\s]*=[\\s]*');
				let linePrefix = document.lineAt(position).text.substr(0, position.character);

				console.log(linePrefix.match(regexp));
				if (!(linePrefix.match(regexp))) {
					return undefined;
				}
				return evalFunctions;
			}
		},
		' ', '='
	);

	// Here we try and suggest new commands after stats functions
	let statsSplunkProvider = vscode.languages.registerCompletionItemProvider(
		splunkSelector,
		{
			provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
				console.log("Providing stats completion items");
				let regexp = new RegExp('[a-z]*stats[\\s]+');
				let linePrefix = document.lineAt(position).text.substr(0, position.character);

				if (!linePrefix.match(regexp)) {
					return undefined;
				}
				return statsFunctions;
			}
		},
		' '
	);

	// Here we try and suggest new commands after pipe
	let pipeSplunkProvider = vscode.languages.registerCompletionItemProvider(
		splunkSelector,
		{
			provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
				console.log("Providing main completion items");
				let regexp = new RegExp('\\\\|[\\s]*');
				let linePrefix = document.lineAt(position).text.substr(0, position.character);

				if (!(linePrefix.endsWith('| ') || linePrefix.endsWith('|'))) {
					return undefined;
				}
				return mainFunctions;
			}
		},
		' ', '|'
	);

	// Here we try and suggest operators after stats functions
	let operatorSplunkProvider = vscode.languages.registerCompletionItemProvider(
		splunkSelector,
		{
			provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
				console.log("Providing operator completion items");
				let regexp = new RegExp('(avg\\s|count\\s|distinct_count\\s|estdc\\s|estdc_error\\s|max\\s|mean\\s|median\\s|min\\s|mode\\s|percentile\\s|range\\s|stdev\\s|stdevp\\s|sum\\s|sumsq\\s|var\\s|varp\\s|first\\s|last\\s|list\\s|values\\s|earliest\\s|earliest_time\\s|latest\\s|latest_time\\s|per_day\\s|per_hour\\s|per_minute\\s|per_second\\s|rate\\s)');
				let linePrefix = document.lineAt(position).text.substr(0, position.character);

				if (!(linePrefix.match(regexp))) {
					return undefined;
				}
				return operators;
			}
		},
		' '
	);

	context.subscriptions.push(splunkProvider, evalSplunkProvider, statsSplunkProvider, pipeSplunkProvider, operatorSplunkProvider);
}

// this method is called when your extension is deactivated
export function deactivate() {}