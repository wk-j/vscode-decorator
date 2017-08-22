## Decorator

- https://github.com/Microsoft/vscode/blob/master/extensions/fsharp/syntaxes/fsharp.json

```
    "prettifySymbolsMode.substitutions": [{
        "language": "fsharp",
        "substitutions": [
            { "ugly": "fun", "pretty": "🌶 ", "scope": "keyword.other.function-definition.fsharp" },
            { "ugly": "let", "pretty": "🥕 ", "pre": "\\b", "post": "\\b" }
        ]
    }]
```