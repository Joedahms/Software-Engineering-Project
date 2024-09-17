import * as dotenv from "dotenv";
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

  constructor(repoOwner: string, repoName: string) {
    this.repoOwner = repoOwner;
    this.repoName = repoName;

    this.name = "name not assigned"
    this.value = 0;
  }

  // Calculate the value of the metric 
  abstract calculateValue(): Promise<number> | number | string;
  
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
    return "s";
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
    const license = await checkLicense("MIT License", this.repoOwner, this.repoName);
    //console.log(license);
    return 0;
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

  calculateValue(): number {
    return 0;
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

  calculateValue(): number {
    return 0;
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

  calculateValue(): number {

    return 0;
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

  calculateValue(): number {
    return 0;
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

  calculateValue(): number {
    return 0;
  }
}
