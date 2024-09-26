import { Url, NetScore, RampUp, Correctness, BusFactor, ResponsiveMaintainer, License} from './metric.js'
import { RepoStats } from './api_access.js'
import { Logger } from './logger.js'

export class Repository {
  logger: Logger;

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
    this.logger = new Logger();

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
    this.logger.add(1, "Calculating all metrics for " + this.name);
    this.logger.add(2, "Calculating all metrics for " + this.name);
    await this.repoStats.getRepoCreatedUpdated();
    await this.repoStats.getRepoStats();
    await this.rampUp.calculateValue(this.repoStats.readmeLength);
    await this.correctness.calculateValue();
    await this.busFactor.calculateValue();
    await this.responsiveMaintainer.calculateValue(this.repoStats.totalCommits, this.repoStats.daysActive);
    await this.license.calculateValue(this.desiredLicense, this.repoStats.licenseName, this.repoStats.readme);
    await this.netScore.calculateValue(this.rampUp, /* correctness */ this.busFactor, this.responsiveMaintainer, this.license);
    this.logger.add(1, "All metrics calculated for " + this.name + '\n');
    this.logger.add(2, "All metrics calculated for " + this.name + '\n');
  }

  // This could be cleaned up but it works for now
  jsonMetrics(): string {
    this.logger.add(2, "Constructing NDJSON string of metrics for " + this.name);
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
    this.logger.add(2, "NDJSON string of metrics for constructed successfully for " + this.name + ", returning said string");
    return str;
  }
}
