import * as dotenv from "dotenv";
import { performance } from "perf_hooks"

import { Logger } from "./logger.js";
import { RepositoryUrlData, UrlFileParser } from './urlFileParser.js'
import { writeOutput } from './output.js'
import { checkLicense } from './api_access.js'

import { Octokit } from "octokit";


// Abstract metric class
abstract class Metric {
  readonly logger: Logger;

  readonly repoName: string;       // Name of the repository the metric belongs to
  readonly repoOwner: string;      // Owner of the repository the metric belongs to

  name: string;           // Name of the metric. Required to match syntax checker
  value: number | string; // URL name or metric score
  latencyValue: number    // How long it takes to calculate the metric

  constructor(repoOwner: string, repoName: string) {
    this.logger = new Logger();

    this.repoOwner = repoOwner;
    this.repoName = repoName;

    this.name = "name not assigned"
    this.value = 0;
    this.latencyValue = 0;
  }

  // Implement a function for calculating the value of the metric 
  
  // Normalizes a number to a value between 0 and 1 depending on the min and max
  minMax(inputValue: number, max: number, min: number): number {
    var normalizedInputValue;
    this.logger.add(2, "min max input: " + String(inputValue));
    normalizedInputValue = (inputValue - min) / (max - min);
    this.logger.add(2, "min max result: " + String(normalizedInputValue));
    if (normalizedInputValue < 0) {       // Less than or equal to minimum
      return 0
    }
    else if (normalizedInputValue > 1) {  // Maximum value isn't large enough
      return 2;
    }
    else {                                // All is well
      return normalizedInputValue;
    }
  }
}

// URL metric
export class Url extends Metric {
  value: string;

  constructor(repoOwner: string, repoName: string) {
    super(repoOwner, repoName);

    this.name = "URL";
    this.value = "testtest";
  }

  calculateValue(): string {
    return this.name;
  }
}

// NetScore metric
export class NetScore extends Metric {
  value: number;

  constructor(repoOwner: string, repoName: string) {
    super(repoOwner, repoName);
    this.name = "NetScore";
    this.value = 0;
  }

  async calculateValue(
  rampUp: RampUp, 
  /*skipping correctness for now*/
  busFactor: BusFactor,
  responsiveMaintainer: ResponsiveMaintainer,
  license: License) {

    const startTime = performance.now();
    this.logger.add(2, "Calculating NetScore for " + this.repoName);

    const rampUpWeight = 1;
    // const correctnessWeight = 1;
    const busFactorWeight = 1;
    const responsiveMaintainerWeight = 1;

    const weightedRampUp = rampUpWeight * rampUp.value;
    // const weightedCorrectness
    const weightedBusFactor = busFactorWeight * busFactor.value;
    const weightedResponsiveMaintainer = responsiveMaintainerWeight * responsiveMaintainer.value;

    const weightedSum = weightedRampUp + /* weightedCorrectness */ + weightedBusFactor + weightedResponsiveMaintainer;    
    const normalizedWeightedSum = this.minMax(weightedSum, 4, 0);
    this.value = license.value * normalizedWeightedSum;
    if (normalizedWeightedSum === 2) {
      console.error("Maximum too low for NetScore metric");
      process.exit(1);
    }

    this.logger.add(1, this.repoName + this.name + "Calculated successfully");

    const endTime = performance.now();
    this.latencyValue = endTime - startTime;
  }
}


// Readme Length metric
export class ReadmeLength extends Metric {
  value: number;
  private octokit: Octokit; // Octokit object for API access

  constructor(repoOwner: string, repoName: string) {
    super(repoOwner, repoName);
    this.name = "Readme Length";
    this.value = 0;

    this.octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
  }

  async calculateValue(): Promise<void> {
    const startTime = performance.now();
    this.logger.add(2, "Calculating Readme Length for " + this.repoName);

    try {
      const response = await this.octokit.request('GET /repos/{owner}/{repo}', {
        owner: this.repoOwner,
        repo: this.repoName
      });

      const readmeContent = await this.octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
        owner: this.repoOwner,
        repo: this.repoName,
        path: 'README.md'
      });

      const readmeBuffer = Buffer.from(readmeContent.data.content, 'base64');
      const readmeContentString = readmeBuffer.toString('utf-8');

      const wordCount = readmeContentString.split(/\s+/).filter(word => word.length > 0).length;
      this.logger.add(2, "Word count: " + wordCount);
      this.value = wordCount;
      this.logger.add(1, this.repoName + this.name + " calculated successfully");
      const endTime = performance.now();
      this.latencyValue = endTime - startTime;

    } catch (error) {
      this.logger.add(2, "Error fetching readme: " + error);
    }
  }
}


// RampUp metric
export class RampUp extends Metric {
  value: number;
  //private octokit: Octokit; // Octokit object for API access

  constructor(repoOwner: string, repoName: string) {
    super(repoOwner, repoName);
    this.name = "RampUp";
    this.value = 0;

    //this.octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
  }

  // Fetch the README file length from the repository
  // async fetchReadmelength(): Promise<number> {
  //   try {
  //     const response = await this.octokit.request('GET /repos/{owner}/{repo}/readme', {
  //       owner: this.repoOwner,
  //       repo: this.repoName
  //     });

  //     const readmeContent = Buffer.from(response.data.content, 'base64').toString('utf-8');

  //     const wordCount = readmeContent.split(/\s+/).filter(word => word.length > 0).length;
  //     this.logger.add(2, "Word count: " + wordCount);
  //     return wordCount;
  //   } catch (error) {
  //     this.logger.add(2, "Error fetching README: " + error);
  //     return 0;

  //     //return readmeContent.length;
  //   }
  // }

  // Calculate RampUp Based on Readme length
  async calculateValue(readmeLength: number) {
    const startTime = performance.now();

    // fetch readme length from github in words
    //readmeLength = await this.fetchReadmelength();
    this.logger.add(2, "Calculating RampUp for " + this.repoName);
    const normalizedMetric = this.minMax(readmeLength, 27000, 500);
    this.logger.add(2, this.repoName + " " + this.name + ": " + String(normalizedMetric))
    if (normalizedMetric === 2) {
      console.error("Maximum too low for RampUp metric");
      process.exit(1);
    }
    //this.value = normalizedMetric; // 

    this.logger.add(1, this.repoName + this.name + "Calculated successfully");

    const endTime = performance.now();
    this.latencyValue = endTime - startTime;
  }
}

// Correctness metric
export class Correctness extends Metric {
  value: number;

  constructor(repoOwner: string, repoName: string) {
    super(repoOwner, repoName);
    this.name = "Correctness";
    this.value = 0;
  }

  async calculateValue() {
    const startTime = performance.now();
    // Put calculation code here
    // this.value = 
    const endTime = performance.now();
    this.latencyValue = endTime - startTime;
  }
}

// BusFactor metric
export class BusFactor extends Metric {
  value: number;

  constructor(repoOwner: string, repoName: string) {
    super(repoOwner, repoName);
    this.name = "BusFactor";
    this.value = 0;
  }

  async calculateValue() {
    const startTime = performance.now();
    // Put calculation code here
    // this.value = 
    const endTime = performance.now();
    this.latencyValue = endTime - startTime;
  }
}

// ResponsiveMaintainer metric
export class ResponsiveMaintainer extends Metric {
  value: number;

  constructor(repoOwner: string, repoName: string) {
    super(repoOwner, repoName);
    this.name = "ResponsiveMaintainer";
    this.value = 0;
  }

  async calculateValue(daysActive: number, totalCommits: number) {
    const startTime = performance.now();

    this.logger.add(2, "Calculating ResponsiveMaintainer for " + this.repoName);
    var months = daysActive / 30;
    var normalizedMetric = this.minMax(totalCommits / months, 303, 0); //arbitrary max and min values picked.
    this.logger.add(2, this.repoName + " " + this.name + ": " + String(normalizedMetric));
    if (normalizedMetric === 2) {
      console.error("Maximum too low for ResponsiveMaintainer metric");
      process.exit(1);
    }
    this.value = normalizedMetric;

    this.logger.add(1, this.repoName + this.name + "Calculated successfully");

    const endTime = performance.now();
    this.latencyValue = endTime - startTime;
  }
}

// License metric
export class License extends Metric {
  value: number;

  constructor(repoOwner: string, repoName: string) {
    super(repoOwner, repoName);
    this.name = "License";
    this.value = 0;
  }
  async calculateValue(desiredLicenseName: string, licenseName: string) {
    const startTime = performance.now();
    
    if (desiredLicenseName === licenseName) {
      this.value = 1;
    } 
    else {
      this.value = 0;
    }

    const endTime = performance.now();
    this.latencyValue = endTime - startTime;
  }
}
