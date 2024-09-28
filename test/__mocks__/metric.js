// __mocks__/metric.js
export class Url {
    constructor(repoOwner, repoName) {
      this.name = "URL";
      this.value = "";
      this.latencyValue = 0;
    }
    calculateValue() {
      return this.name;
    }
  }
  
  export class NetScore {
    constructor(repoOwner, repoName) {
      this.name = "NetScore";
      this.value = 0;
      this.latencyValue = 0;
    }
    async calculateValue(rampUp, correctness, busFactor, responsiveMaintainer, license) {
      this.value = 100; // Mock value
    }
  }
  
  export class RampUp {
    constructor(repoOwner, repoName) {
      this.name = "RampUp";
      this.value = 0;
      this.latencyValue = 0;
    }
    async calculateValue(readmeLength) {
      this.value = 0.5; // Mock value
    }
  }
  
  export class Correctness {
    constructor(repoOwner, repoName) {
      this.name = "Correctness";
      this.value = 0;
      this.latencyValue = 0;
    }
    async calculateValue(openIssues, totalIssues) {
      this.value = 0.8; // Mock value
    }
  }
  
  export class BusFactor {
    constructor(repoOwner, repoName) {
      this.name = "BusFactor";
      this.value = 0;
      this.latencyValue = 0;
    }
    async calculateValue() {
      this.value = 0.7; // Mock value
    }
  }
  
  export class ResponsiveMaintainer {
    constructor(repoOwner, repoName) {
      this.name = "ResponsiveMaintainer";
      this.value = 0;
      this.latencyValue = 0;
    }
    async calculateValue(totalCommits, daysActive) {
      this.value = 0.9; // Mock value
    }
  }
  
  export class License {
    constructor(repoOwner, repoName) {
      this.name = "License";
      this.value = 1;
      this.latencyValue = 0;
    }
    async calculateValue(desiredLicenseName, licenseName, readme) {
      this.value = 1; // Mock value
    }
  }
  