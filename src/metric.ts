import * as dotenv from "dotenv";
import { performance } from "perf_hooks"

import { Logger } from "./logger.js";
import { RepositoryUrlData, UrlFileParser } from './urlFileParser.js'

// Shouldn't make any API calls here, do in Repository class

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
    this.logger.add(2, "Running min max normalization on " + inputValue + " max/min = " + max + "/" + min);
    var normalizedInputValue;
    normalizedInputValue = (inputValue - min) / (max - min);
    this.logger.add(2, "min max result: " + String(normalizedInputValue));
    if (normalizedInputValue < 0) {       // Less than or equal to minimum
      this.logger.add(2, "Normalized value less than 0, returning 0");
      return 0
    }
    else if (normalizedInputValue > 1) {  // Maximum value isn't large enough
      this.logger.add(2, "Normalized value greater than 1, returning 2");
      return 2;
    }
    else {                                // All is well
      this.logger.add(2, "min max normalization successful, returning normalized value");
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
  correctness: Correctness,
  busFactor: BusFactor,
  responsiveMaintainer: ResponsiveMaintainer,
  license: License) {

    const startTime = performance.now();
    this.logger.add(1, "Calculating NetScore for " + this.repoName);
    this.logger.add(2, "Calculating NetScore for " + this.repoName);

    const rampUpWeight = 1;
    const correctnessWeight = 1;
    const busFactorWeight = 1;
    const responsiveMaintainerWeight = 2;

    const weightedRampUp = rampUpWeight * rampUp.value;
    const weightedCorrectness = correctnessWeight * correctness.value;
    const weightedBusFactor = busFactorWeight * busFactor.value;
    const weightedResponsiveMaintainer = responsiveMaintainerWeight * responsiveMaintainer.value;

    const weightedSum = weightedRampUp + weightedCorrectness + weightedBusFactor + weightedResponsiveMaintainer;    
    const normalizedWeightedSum = this.minMax(weightedSum, 4, 0);
    this.value = license.value * normalizedWeightedSum;
    if (normalizedWeightedSum === 2) {
      console.error("Maximum too low for NetScore metric");
      process.exit(1);
    }

    this.logger.add(1, this.repoName + " " + this.name + " calculated successfully");

    const endTime = performance.now();
    this.latencyValue = endTime - startTime;
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
  }

  // Calculate RampUp Based on Readme length
  async calculateValue(readmeLength: number) {
    const startTime = performance.now();

    // fetch readme length from github in words
    this.logger.add(1, "Calculating RampUp for " + this.repoName + "...");
    this.logger.add(2, "Calculating RampUp for " + this.repoName + "...");

    const normalizedMetric = this.minMax(readmeLength, 27000, 500);
    this.logger.add(2, this.repoName + " " + this.name + ": " + String(normalizedMetric))
    if (normalizedMetric === 2) {
      console.error("Maximum too low for RampUp metric");
      process.exit(1);
    }
    this.value = normalizedMetric; 

    this.logger.add(1, this.repoName + " " + this.name + " calculated successfully");

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

  async calculateValue(hasTestFolder: boolean) {
    const startTime = performance.now();

    this.logger.add(2, "Calculating Correctness for " + this.repoName);
  
    var normalizedMetric = hasTestFolder; //arbitrary max and min values picked.
    this.logger.add(2, this.repoName + " " + this.name + ": " + String(normalizedMetric));
    if(normalizedMetric = false){
      this.value = 0;
    }else if(normalizedMetric = true){
      this.value = 1;
    }
    this.logger.add(1, this.repoName + this.name + "Calculated successfully");

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

  async calculateValue(busFactor: number, totalContributors: number) {
    const startTime = performance.now();
    //bus factor is scored a 1.0 if it takes at least 40% of the team size to reach 50% of the commits. 
    //Lowest score would be if 1 person has made at least 50% of commits.
    this.logger.add(2, "Calculating BusFactor for " + this.repoName);
    if (busFactor >= totalContributors*.4){
      this.logger.add(2, "Calculated BusFactor is greater than 40% of team size.");
      this.value = 1;
    }
    else if(busFactor < 1){
      //error. Should never be less than 1 person
      this.logger.add(2, "Calculated BusFactor is less than 1, ERROR.");
      this.value = 2;
    }
    else{
      this.value = this.minMax(busFactor,totalContributors * .4, 1);
    }
    this.logger.add(2, this.repoName + " " + this.name + ": " + String(this.value));
    this.logger.add(1, this.repoName + this.name + "Calculated successfully");
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

    this.logger.add(1, "Calculating ResponsiveMaintainer for " + this.repoName + "...");
    this.logger.add(2, "Calculating ResponsiveMaintainer for " + this.repoName + "...");

    var months = daysActive / 30;
    var normalizedMetric = this.minMax(totalCommits / months, 70, 0); //arbitrary max and min values picked.
    this.logger.add(2, this.repoName + " " + this.name + ": " + String(normalizedMetric));
    if (normalizedMetric === 2) {
      console.error("Maximum too low for ResponsiveMaintainer metric");
      process.exit(1);
    }
    this.value = normalizedMetric;

    this.logger.add(1, this.repoName + " " + this.name + " calculated successfully");

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
  async calculateValue(desiredLicenseName: string, licenseName: string, readme: string) {
    const startTime = performance.now();

    this.logger.add(1, "Checking " + this.repoName + " for " + desiredLicenseName + " license...");
    this.logger.add(2, "Checking " + this.repoName + " for " + desiredLicenseName + " license...");

    if (desiredLicenseName === licenseName) { // Perfect match
      this.value = 1;
      this.logger.add(1, "Correct license found");
      this.logger.add(2, "Correct license found at license API endpoint");
    } 
    else if(licenseName === readme || licenseName === "Other") {       // 404 error when checking license, readme returned
      this.logger.add(2, "Correct license not found at API endpoint, checking README...");

      const licenseNameRegexString = "(" + desiredLicenseName + ")";
      const licenseNameRegex = new RegExp(licenseNameRegexString, "gmi"); // i -> case insensitive
      const readmeLicenseName = readme.match(licenseNameRegex);

      if (readmeLicenseName != null) {
        this.value = 1;
        this.logger.add(1, "Correct license found");
        this.logger.add(2, "Correct license found in README");
      }
      else {
        this.logger.add(1, "Correct license not found");
        this.logger.add(2, "Correct license not found in README");
      }
    }
    else {
      this.logger.add(1, "Correct license not found");
      this.logger.add(2, "Correct license not found. Did not scan README for correct license");
      this.value = 0;
    }

    const endTime = performance.now();
    this.latencyValue = endTime - startTime;
  }
}
