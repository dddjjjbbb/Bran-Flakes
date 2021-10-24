![Logo of the project](https://raw.githubusercontent.com/jehna/readme-best-practices/master/sample-logo.png)

# Bran Flakes

> Create git branches from Jira tickets

Sick of creating git branches manually? Use bran-flakes to generate them for you.
Simply copy the generated git branch name to your command line.

Please note the default branch name follows

## Installing / Getting started

```shell
nvm use 14.17.6
npm i
npm build # generates dist dir
open chrome > extensions > "load unpacked" > point at the dist dir
```

## Developing

```shell
git clone https://github.com/dddjjjbbb/bran-flakes.git
cd bran-flakes/
npm install yarn
npm install
```

### Building

```shell
npm build # generates dist directory
```

This uses [parcel](https://www.npmjs.com/package/parcel) to compile ts files to js and prepare resulting dist dir for import in your browser.

## Features

- Tap icon on JIRA issue, generate branch name.

## Configuration

- Configuration rules will be offered in the future.

## Contributing

If you'd like to contribute, please fork the repository and use a feature
branch. Pull requests are warmly welcome.

## Licensing

The code in this project is licensed under GPLv3