import {Repository, UrlFileParser} from './urlFileParser.js'
export class Main {
    
    readonly urlFileParser: UrlFileParser;

constructor(){
    this.urlFileParser = new UrlFileParser();
    var testRepo: Repository[];
    testRepo = this.urlFileParser.githubRepos();
    console.log(testRepo);
}




}

function main(): void{
    new Main();
}

main();