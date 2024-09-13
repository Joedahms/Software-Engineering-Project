import { Url, NetScore, RampUp, Correctness, BusFactor, ResponsiveMaintainer, License} from './metric.js'
import { writeOutput } from './output.js'

export class Repository {
  owner: string;
  name: string;

  url: Url;
  netScore: NetScore;
  rampUp: RampUp;
  correctness: Correctness;
  busFactor: BusFactor;
  responsiveMaintainer: ResponsiveMaintainer
  license: License;

  constructor(url: string, owner: string, name: string) {
    this.owner = owner;
    this.name = name;

    this.url = new Url();
    this.url.value = url;
    this.netScore = new NetScore();
    this.rampUp = new RampUp();
    this.correctness = new Correctness();
    this.busFactor = new BusFactor();
    this.responsiveMaintainer = new ResponsiveMaintainer();
    this.license = new License();
  }

  jsonMetrics(): string {
    var str: string = String(
      "{" + 
      "\"" + this.url.name + "\"" + ": " + "\"" + this.url.value + "\"" + ", " +
      //NetScore_Latency: 1,
      "\"" + this.netScore.name + "\"" + ": " + this.netScore.value + ", " +
      //RampUp_Latency: 1,
      "\"" + this.correctness.name + "\"" + ": " + this.correctness.value + ", " +
      //Correctness_Latency: 1,
      "\"" + this.busFactor.name + "\"" + ": " + this.busFactor.value + ", " +
      //BusFactor_Latency: 1,
      "\"" + this.responsiveMaintainer.name + "\"" + ": " + this.responsiveMaintainer.value + ", " +
      //ResponsiveMaintainer_Latency: 1,
      "\"" + this.license.name + "\"" + ": " + this.license.value +
      //License_Latency: 1,
      "}" + '\n'
    );
    return str;
  }
}
