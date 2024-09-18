import { Url, NetScore, RampUp, Correctness, BusFactor, ResponsiveMaintainer, License} from './metric.js'
import { writeOutput } from './output.js'
import { RepoStats } from './api_access.js'
export class Repository {
  owner: string;          // GitHub username of repository owner
  name: string;           // Name of the repository
  desiredLicense: string; // License the repos should have

  // Metrics
  url: Url;
  netScore: NetScore;
  rampUp: RampUp;
  correctness: Correctness;
  busFactor: BusFactor;
  responsiveMaintainer: ResponsiveMaintainer
  license: License;

  repoStats: RepoStats;

  // Must pass url, owner, and name
  constructor(url: string, owner: string, name: string) {
    this.owner = owner;
    this.name = name;
    this.desiredLicense = "MIT License";  // Requirements say LGPLv2.1 but all the examples have MIT

    this.repoStats = new RepoStats(this.owner, this.name);

    this.url = new Url(owner, name);
    this.url.value = url;
    this.netScore = new NetScore(owner, name);
    this.rampUp = new RampUp(owner, name);
    this.correctness = new Correctness(owner, name);
    this.busFactor = new BusFactor(owner, name);
    this.responsiveMaintainer = new ResponsiveMaintainer(owner, name);
    this.license = new License(owner, name);
  }

  // Call all metric's calculateValue() method to calculate all metrics for a Repository
  // These methods should set the value within themselves
  async calculateAllMetrics() {
    await this.repoStats.fetchRepoData();
    await this.repoStats.fetchData();
    await this.netScore.calculateValue();
    await this.rampUp.calculateValue();
    await this.correctness.calculateValue();
    await this.busFactor.calculateValue();
    await this.responsiveMaintainer.calculateValue(this.repoStats.totalCommits, this.repoStats.daysActive);
    await this.license.calculateValue(this.desiredLicense, this.repoStats.licenseName);
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
      "\"" + "netscore_latency" + "\"" + ": " + this.netScore.latencyValue + ", " +
      "\"" + "rampup_latency" + "\"" + ": " + this.rampUp.latencyValue + ", " +
      "\"" + "correctness_latency" + "\"" + ": " + this.correctness.latencyValue + ", " +
      "\"" + "busfactor_latency" + "\"" + ": " + this.busFactor.latencyValue + ", " +
      "\"" + "responsiveMaintainer_latency" + "\"" + ": " + this.responsiveMaintainer.latencyValue + ", " +
      "\"" + "license_latency" + "\"" + ": " + this.license.latencyValue +
      "}" + '\n'
    );
    return str;
  }
}
