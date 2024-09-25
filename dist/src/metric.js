import { performance } from "perf_hooks";
import { Logger } from "./logger.js";
// Shouldn't make any API calls here, do in Repository class
// Abstract metric class
class Metric {
    constructor(repoOwner, repoName) {
        this.logger = new Logger();
        this.repoOwner = repoOwner;
        this.repoName = repoName;
        this.name = "name not assigned";
        this.value = 0;
        this.latencyValue = 0;
    }
    // Implement a function for calculating the value of the metric 
    // Normalizes a number to a value between 0 and 1 depending on the min and max
    minMax(inputValue, max, min) {
        this.logger.add(2, "Running min max normalization on " + inputValue + " max/min = " + max + "/" + min);
        var normalizedInputValue;
        normalizedInputValue = (inputValue - min) / (max - min);
        this.logger.add(2, "min max result: " + String(normalizedInputValue));
        if (normalizedInputValue < 0) { // Less than or equal to minimum
            this.logger.add(2, "Normalized value less than 0, returning 0");
            return 0;
        }
        else if (normalizedInputValue > 1) { // Maximum value isn't large enough
            this.logger.add(2, "Normalized value greater than 1, returning 2");
            return 2;
        }
        else { // All is well
            this.logger.add(2, "min max normalization successful, returning normalized value");
            return normalizedInputValue;
        }
    }
}
// URL metric
export class Url extends Metric {
    constructor(repoOwner, repoName) {
        super(repoOwner, repoName);
        this.name = "URL";
        this.value = "testtest";
    }
    calculateValue() {
        return this.name;
    }
}
// NetScore metric
export class NetScore extends Metric {
    constructor(repoOwner, repoName) {
        super(repoOwner, repoName);
        this.name = "NetScore";
        this.value = 0;
    }
    async calculateValue(rampUp, 
    /*skipping correctness for now*/
    busFactor, responsiveMaintainer, license) {
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
        const weightedSum = weightedRampUp + /* weightedCorrectness */ +weightedBusFactor + weightedResponsiveMaintainer;
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
// RampUp metric
export class RampUp extends Metric {
    constructor(repoOwner, repoName) {
        super(repoOwner, repoName);
        this.name = "RampUp";
        this.value = 0;
    }
    // Calculate RampUp
    // Based on Readme length
    async calculateValue(readmeLength) {
        const startTime = performance.now();
        this.logger.add(2, "Calculating RampUp for " + this.repoName);
        const normalizedMetric = this.minMax(readmeLength, 27000, 500);
        this.logger.add(2, this.repoName + " " + this.name + ": " + String(normalizedMetric));
        if (normalizedMetric === 2) {
            console.error("Maximum too low for RampUp metric");
            process.exit(1);
        }
        this.value = normalizedMetric;
        this.logger.add(1, this.repoName + this.name + "Calculated successfully");
        const endTime = performance.now();
        this.latencyValue = endTime - startTime;
    }
}
// Correctness metric
export class Correctness extends Metric {
    constructor(repoOwner, repoName) {
        super(repoOwner, repoName);
        this.name = "Correctness";
        this.value = 0;
    }
    async calculateValue(openIssues, totalIssues) {
        const startTime = performance.now();
        this.logger.add(2, "Calculating Correctness for " + this.repoName);
        var normalizedMetric = (1 - (openIssues / totalIssues)); //arbitrary max and min values picked.
        this.logger.add(2, this.repoName + " " + this.name + ": " + String(normalizedMetric));
        this.value = normalizedMetric;
        this.logger.add(1, this.repoName + this.name + "Calculated successfully");
        const endTime = performance.now();
        this.latencyValue = endTime - startTime;
    }
}
// BusFactor metric
export class BusFactor extends Metric {
    constructor(repoOwner, repoName) {
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
    constructor(repoOwner, repoName) {
        super(repoOwner, repoName);
        this.name = "ResponsiveMaintainer";
        this.value = 0;
    }
    async calculateValue(daysActive, totalCommits) {
        const startTime = performance.now();
        this.logger.add(2, "Calculating ResponsiveMaintainer for " + this.repoName);
        var months = daysActive / 30;
        var normalizedMetric = this.minMax(totalCommits / months, 330, 0); //arbitrary max and min values picked.
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
    constructor(repoOwner, repoName) {
        super(repoOwner, repoName);
        this.name = "License";
        this.value = 0;
    }
    async calculateValue(desiredLicenseName, licenseName, readme) {
        const startTime = performance.now();
        this.logger.add(2, "Checking " + this.repoName + " for " + desiredLicenseName + " license...");
        if (desiredLicenseName === licenseName) { // Perfect match
            this.value = 1;
            this.logger.add(1, "License found");
            this.logger.add(2, "License found at license API endpoint");
        }
        else if (licenseName === readme || licenseName === "Other") { // 404 error when checking license, readme returned
            this.logger.add(2, "License not found at API endpoint, checking README...");
            const licenseNameRegexString = "(" + desiredLicenseName + ")";
            const licenseNameRegex = new RegExp(licenseNameRegexString, "gmi"); // i -> case insensitive
            const readmeLicenseName = readme.match(licenseNameRegex);
            if (readmeLicenseName != null) {
                this.value = 1;
                this.logger.add(1, "License found");
                this.logger.add(2, "License found in README");
            }
            else {
                this.logger.add(1, "License not found");
                this.logger.add(2, "License not found in README");
            }
        }
        else {
            this.logger.add(1, "License not found");
            this.logger.add(2, "License not found. Did not scan README for license");
            this.value = 0;
        }
        const endTime = performance.now();
        this.latencyValue = endTime - startTime;
    }
}
