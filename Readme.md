# atom-standard

A linter and formatter for atom using [standard](https://github.com/feross/standard). Supports all the options that standard supports.

The goal of this package is to stay current with the latest standard and support all of standard's package.json configuration.

The scope of this package will be limited to javascript files (not markdown, html, etc.) and the standard format (not happiness, semi-standard, etc.)

Configuration for this package is done inside your package.json. Here's an example of how to configure [Flow](https://github.com/feross/standard#can-i-use-a-javascript-language-variant-like-flow).

We take standard's formatting one step more by preprocessing with prettier before passing it into `standard --fix`. If you'd like to disable this feature, you can set `{ standard: { prettier: false }}` in your `package.json`.

## Installation

```bash
apm install atom-standard
```

## Why?

I found myself in a pit of despair when trying facebook's flow. While standard properly supports flow via babel-eslint and eslint-plugin-flowtype, I found that the tooling around it was not up-to-date, specifically [linter-js-standard](https://github.com/ricardofbarros/linter-js-standard) & [atom-standard-formatter](https://github.com/stephenkubovic/atom-standard-formatter).

More fundamentally, I wanted a single package that supports linting and formatting and stays current with Standard.
