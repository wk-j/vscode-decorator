import * as vscode from 'vscode';
const parseDuration = require('parse-duration')

// this method is called when vs code is activated
export function activate(context: vscode.ExtensionContext) {


    console.log('decorator sample is activated');

    let simpleAnimation = new SimpleAnimation();
    context.subscriptions.push(simpleAnimation);

	// create a decorator type that we use to decorate small numbers
	const smallNumberDecorationType = vscode.window.createTextEditorDecorationType({
		borderWidth: '1px',
		borderStyle: 'solid',
		overviewRulerColor: 'blue',
		overviewRulerLane: vscode.OverviewRulerLane.Right,
		light: {
			// this color will be used in light color themes
			borderColor: 'darkblue'
		},
		dark: {
			// this color will be used in dark color themes
			borderColor: 'lightblue'
		}
	});

	// create a decorator type that we use to decorate large numbers
	const largeNumberDecorationType = vscode.window.createTextEditorDecorationType({
		cursor: 'crosshair',
		backgroundColor: 'rgba(255,0,0,0.3)'
	});

	let activeEditor = vscode.window.activeTextEditor;
	if (activeEditor) {
		triggerUpdateDecorations();
	}

	vscode.window.onDidChangeActiveTextEditor(editor => {
		activeEditor = editor;
		if (editor) {
			triggerUpdateDecorations();
		}
	}, null, context.subscriptions);

	vscode.workspace.onDidChangeTextDocument(event => {
		if (activeEditor && event.document === activeEditor.document) {
			triggerUpdateDecorations();
		}
	}, null, context.subscriptions);

	var timeout = null;
	function triggerUpdateDecorations() {
		if (timeout) {
			clearTimeout(timeout);
		}
		timeout = setTimeout(updateDecorations, 500);
	}

	function updateDecorations() {
		if (!activeEditor) {
			return;
		}
		const regEx = /\d+/g;
		const text = activeEditor.document.getText();
		const smallNumbers: vscode.DecorationOptions[] = [];
		const largeNumbers: vscode.DecorationOptions[] = [];
		let match;
		while (match = regEx.exec(text)) {
			const startPos = activeEditor.document.positionAt(match.index);
			const endPos = activeEditor.document.positionAt(match.index + match[0].length);
			const decoration = { range: new vscode.Range(startPos, endPos), hoverMessage: 'Number **' + match[0] + '**' };
			if (match[0].length < 3) {
				smallNumbers.push(decoration);
			} else {
				largeNumbers.push(decoration);
			}
		}
		activeEditor.setDecorations(smallNumberDecorationType, smallNumbers);
		activeEditor.setDecorations(largeNumberDecorationType, largeNumbers);
	}
}

class SimpleAnimation {
    // consts
    private DelayThresholdInMs = 500 // reduce setDecorations() frequency

    // settings
    private enabled: boolean
    private showDurationInMs: number
    private changeColor: boolean

    private editor: vscode.TextEditor = null
    private disposable: vscode.Disposable = null
    private configSubscriptions: vscode.Disposable[] = null
    private lastMoveTime = 0
    private lastCursorPosition = new vscode.Position(0, 0)
    private currentHue = 0

    constructor() {
        vscode.workspace.onDidChangeConfiguration(this.changeConfig, this, this.configSubscriptions)
        this.changeConfig()
    }

    dispose() {
        if (this.disposable) {
            this.disposable.dispose()
            this.disposable = null
        }
        if (this.configSubscriptions) {
            this.configSubscriptions.forEach((disposable: vscode.Disposable) => {
                disposable.dispose()
            })
        }
    }

    private changeConfig() {
        let config = vscode.workspace.getConfiguration('simpleAnimation')
        this.enabled = config.get<boolean>('enabled', true)
        this.showDurationInMs = parseDuration(config.get<string>('showDuration', '500ms'))
        this.changeColor = config.get<boolean>('changeColor', true)
        if (this.enabled) {
            if (!this.disposable) {
                // subscribe to selection change and editor activation events
                let subscriptions: vscode.Disposable[] = []
                vscode.window.onDidChangeActiveTextEditor(this.updateEditor, this, subscriptions)
                vscode.window.onDidChangeTextEditorSelection(this.onCursorMoved, this, subscriptions)
                //vscode.workspace.onDidChangeTextDocument(this.onCursorMoved, this, subscriptions)
                this.disposable = vscode.Disposable.from(...subscriptions)
            }
        } else {
            if (this.disposable) {
                this.disposable.dispose()
                this.disposable = null
            }
        }
    }

    private updateEditor(e: vscode.TextEditor) {
        this.editor = e
    }

    private onCursorMoved() {
        //console.log('--', this.editor.selection.active.line, this.editor.selection.active.character)
        var now = Date.now()
        if (now - this.lastMoveTime < this.DelayThresholdInMs) {
            return
        }
        var decoOption = {
            textDecoration: `none;font-weight: bold`,
            light: {},
            dark: {}
        }
        if (this.changeColor) {
            var h = Math.round(Math.random() * 360)
            var s = Math.round(Math.random() * 100)
            var lr = Math.random()
            var ll = lr * 50
            var ld = lr * 50 + 50
            decoOption.light = {
                color: `hsl(${h},${s}%,${ll}%)`
            }
            decoOption.dark = {
                color: `hsl(${h},${s}%,${ld}%)`
            }
        }
        var deco = vscode.window.createTextEditorDecorationType(decoOption)
        let curPos = this.editor.selection.active
        let startPos = this.lastCursorPosition
        let endPos = new vscode.Position(curPos.line, curPos.character + 1)
        //console.log('start:', startPos.line, startPos.character)
        //console.log('end  :', endPos.line, endPos.character)
        let cursel = new vscode.Selection(startPos, endPos)
        let selections = [cursel]
        this.editor.setDecorations(deco, selections)
        setTimeout(function(
            thisarg: SimpleAnimation,
            dec: vscode.TextEditorDecorationType,
            sels: vscode.Selection[]) {
            if (thisarg.editor) {
                thisarg.editor.setDecorations(dec, [])
            }
            dec.dispose()
        }, this.showDurationInMs, this, deco, selections)
        this.lastMoveTime = now
        this.lastCursorPosition = new vscode.Position(endPos.line, endPos.character)
    }
}