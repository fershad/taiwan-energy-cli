# Taiwan Energy Generation CLI

This CLI tool provides a breakdown of the latest energy generation data for Taiwan. Results are displayed by:

- Current low-carbon energy generation
- Current renewable energy generation
- Current dirty energy generation

A more granular breakdown of renewable energy generation is also provided.

Data is updated every 10 minutes, and is sourced from Taipower's open data api: [https://www.taipower.com.tw/d006/loadGraph/loadGraph/data/genary_eng.json](https://www.taipower.com.tw/d006/loadGraph/loadGraph/data/genary_eng.json).

## Installation

1. Clone this repository
2. `cd` into the repository & run `npm install`
3. In your terminal run the `npm link` command

## Getting data

In your terminal type the command `energy` and press the <kbd>enter</kbd> key.

## Customise

You can customise the command by editing the `package.json` file.

```json
"bin": {
    "tw-energy": "index.js",
    "energy": "index.js",
    "YOUR-CUSTOM-COMMAND": "index.js"
},
```