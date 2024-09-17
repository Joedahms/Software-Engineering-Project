import { Url, NetScore, RampUp, Correctness, BusFactor, ResponsiveMaintainer, License} from './metric.js'
import { writeOutput } from './output.js'

export class Repository {
  owner: string;  // GitHub username of repository owner
  name: string;   // Name of the repository

  // Metrics
  url: Url;
  netScore: NetScore;
  rampUp: RampUp;
  correctness: Correctness;
  busFactor: BusFactor;
  responsiveMaintainer: ResponsiveMaintainer
  license: License;

  // Must pass url, owner, and name
  constructor(url: string, owner: string, name: string) {
    this.owner = owner;
    this.name = name;

    this.url = new Url(owner, name);
    this.url.value = url;
    this.netScore = new NetScore(owner, name);
    this.rampUp = new RampUp(owner, name);
    this.correctness = new Correctness(owner, name);
    this.busFactor = new BusFactor(owner, name);
    this.responsiveMaintainer = new ResponsiveMaintainer(owner, name);
    this.license = new License(owner, name);
  }

  async calculateAllMetrics() {
    await this.url.calculateValue();
    await this.netScore.calculateValue();
    await this.rampUp.calculateValue();
    await this.correctness.calculateValue();
    await this.busFactor.calculateValue();
    await this.responsiveMaintainer.calculateValue();
    await this.license.calculateValue();
  }

  // This could be cleaned up but it works for now
  jsonMetrics(): string {
    var str: string = String(
      "{" + 
      "\"" + this.url.name + "\"" + ": " + "\"" + this.url.value + "\"" + ", " +
      "\"" + this.netScore.name + "\"" + ": " + this.netScore.value + ", " +
      "\"" + this.rampUp.name + "\"" + ": " + this.rampUp.value + ", " +
      "\"" + this.correctness.name + "\"" + ": " + this.correctness.value + ", " +
      "\"" + this.busFactor.name + "\"" + ": " + this.busFactor.value + ", " +
      "\"" + this.responsiveMaintainer.name + "\"" + ": " + this.responsiveMaintainer.value + ", " +
      "\"" + this.license.name + "\"" + ": " + this.license.value + ", " +
      "\"" + "netscore_latency" + "\"" + ": " + "0" + ", " +
      "\"" + "rampup_latency" + "\"" + ": " + "0" + ", " +
      "\"" + "correctness_latency" + "\"" + ": " + "0" + ", " +
      "\"" + "busfactor_latency" + "\"" + ": " + "0" + ", " +
      "\"" + "responsiveMaintainer_latency" + "\"" + ": " + "0" + ", " +
      "\"" + "license_latency" + "\"" + ": " + "0" +
      "}" + '\n'
    );
    return str;
  }
}
