import { Octokit, App } from "octokit";
import * as dotenv from "dotenv";
import { Logger } from "./logger.js";
import { RepositoryUrlData, UrlFileParser } from './urlFileParser.js'
import { writeOutput } from './output.js'

const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // for GitHub token: export GITHUB_TOKEN="your_token_here"

// Abstract metric class
abstract class Metric {
  name: string;           // Name of the metric. Required to match syntax checker
  value: number | string; // URL name or metric score

  constructor() {
    this.name = "name not assigned"
    this.value = 0;
  }

  // Calculate the value of the metric 
  abstract calculateValue(): number | string;
}

// URL metric
export class Url extends Metric {
  name: string;
  value: string;

  constructor() {
    super();
    this.name = "URL";
    this.value = "testtest";
  }

  calculateValue(): string {
    console.log("test");
    return "s";
  }
}

// NetScore metric
export class NetScore extends Metric {
  name: string;
  value: number;

  constructor() {
    super();
    this.name = "NetScore";
    this.value = 0;
  }

  calculateValue(): number {
    console.log("test");
    return 0;
  }
}

// RampUp metric
export class RampUp extends Metric {
  name: string;
  value: number;

  constructor() {
    super();
    this.name = "RampUp";
    this.value = 0;
  }

  calculateValue(): number {
    console.log("test");
    return 0;
  }
}

// Correctness metric
export class Correctness extends Metric {
  name: string;
  value: number;

  constructor() {
    super();
    this.name = "Correctness";
    this.value = 0;
  }

  calculateValue(): number {
    console.log("test");
    return 0;
  }
}

// BusFactor metric
export class BusFactor extends Metric {
  name: string;
  value: number;

  constructor() {
    super();
    this.name = "BusFactor";
    this.value = 0;
  }

  calculateValue(): number {
    console.log("test");
    return 0;
  }
}

// ResponsiveMaintainer metric
export class ResponsiveMaintainer extends Metric {
  name: string;
  value: number;

  constructor() {
    super();
    //this.name = "RESPONSIVE_MAINTAINER_SCORE";
    this.name = "ResponsiveMaintainer";
    this.value = 0;
  }

  calculateValue(): number {
    console.log("test");
    return 0;
  }
}

// License metric
export class License extends Metric {
  name: string;
  value: number;

  constructor() {
    super();
    //this.name = "LICENSE_SCORE";
    this.name = "License";
    this.value = 0;
  }

  calculateValue(): number {
    console.log("test");
    return 0;
  }
}
