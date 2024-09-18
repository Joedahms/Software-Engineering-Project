import * as dotenv from "dotenv";
import { performance } from "perf_hooks"

import { Logger } from "./logger.js";
import { RepositoryUrlData, UrlFileParser } from './urlFileParser.js'
import { writeOutput } from './output.js'
import { checkLicense } from './api_access.js'

// Abstract metric class
abstract class Metric {
  repoName: string;       // Name of the repository the metric belongs to
  repoOwner: string;      // Owner of the repository the metric belongs to

  name: string;           // Name of the metric. Required to match syntax checker
  value: number | string; // URL name or metric score
  latencyValue: number    // How long it takes to calculate the metric

  constructor(repoOwner: string, repoName: string) {
    this.repoOwner = repoOwner;
    this.repoName = repoName;

    this.name = "name not assigned"
    this.value = 0;
    this.latencyValue = 0;
  }

  // Implement a function for calculating the value of the metric 
  
  // Normalizes a number to a value between 0 and 1 depending on the min and max
  minMax(inputValue: number, max: number, min: number): number {
    var scaledInputValue;
    scaledInputValue = (inputValue - min) / (max - min);
    if (scaledInputValue < 0) {
      return 0
    }
    else {
      return scaledInputValue;
    }
  }
}

// URL metric
export class Url extends Metric {
  name: string;
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
  name: string;
  value: number;

  constructor(repoOwner: string, repoName: string) {
    super(repoOwner, repoName);
    this.name = "NetScore";
    this.value = 0;
  }

  async calculateValue(): Promise<number> {
    const startTime = performance.now();
    // Put calculation code here
    // this.value = 
    const endTime = performance.now();
    this.latencyValue = endTime - startTime;

    return 0; // this.value
  }
}

// RampUp metric
export class RampUp extends Metric {
  name: string;
  value: number;

  constructor(repoOwner: string, repoName: string) {
    super(repoOwner, repoName);
    this.name = "RampUp";
    this.value = 0;
  }

  async calculateValue(): Promise<number> {
    const startTime = performance.now();
    // Put calculation code here
    // this.value = 
    const endTime = performance.now();
    this.latencyValue = endTime - startTime;

    return 0; // this.value
  }
}

// Correctness metric
export class Correctness extends Metric {
  name: string;
  value: number;

  constructor(repoOwner: string, repoName: string) {
    super(repoOwner, repoName);
    this.name = "Correctness";
    this.value = 0;
  }

  async calculateValue(): Promise<number> {
    const startTime = performance.now();
    // Put calculation code here
    // this.value = 
    const endTime = performance.now();
    this.latencyValue = endTime - startTime;

    return 0; // this.value
  }
}

// BusFactor metric
export class BusFactor extends Metric {
  name: string;
  value: number;

  constructor(repoOwner: string, repoName: string) {
    super(repoOwner, repoName);
    this.name = "BusFactor";
    this.value = 0;
  }

  async calculateValue(): Promise<number> {
    const startTime = performance.now();
    // Put calculation code here
    // this.value = 
    const endTime = performance.now();
    this.latencyValue = endTime - startTime;
    
    return 0; // this.value
  }
}

// ResponsiveMaintainer metric
export class ResponsiveMaintainer extends Metric {
  name: string;
  value: number;

  constructor(repoOwner: string, repoName: string) {
    super(repoOwner, repoName);
    //this.name = "RESPONSIVE_MAINTAINER_SCORE";
    this.name = "ResponsiveMaintainer";
    this.value = 0;
  }

  async calculateValue(daysActive: number, totalCommits: number) {
    const startTime = performance.now();

    var months = daysActive / 30;
    this.value = this.minMax(totalCommits / months, 100, 0); //arbitrary max and min values picked.

    const endTime = performance.now();
    this.latencyValue = endTime - startTime;
  }
}

// License metric
export class License extends Metric {
  name: string;
  value: number;

  constructor(repoOwner: string, repoName: string) {
    super(repoOwner, repoName);
    //this.name = "LICENSE_SCORE";
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
