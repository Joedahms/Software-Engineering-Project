import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { Url, NetScore, RampUp, Correctness, BusFactor, ResponsiveMaintainer, License } from '../src/metric';
import { Logger } from '../src/logger.js';
jest.mock('./logger.js');
const mockLogger = Logger;
describe('Metrics', () => {
    let loggerInstance;
    beforeEach(() => {
        loggerInstance = new mockLogger();
        loggerInstance.add = jest.fn();
        loggerInstance.clear = jest.fn();
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    describe('Url', () => {
        it('should initialize with correct values', () => {
            const url = new Url('owner', 'repo');
            expect(url.name).toBe('URL');
            expect(url.value).toBe('testtest');
        });
        it('should calculate value correctly', () => {
            const url = new Url('owner', 'repo');
            expect(url.calculateValue()).toBe('URL');
        });
    });
    describe('NetScore', () => {
        it('should initialize with correct values', () => {
            const netScore = new NetScore('owner', 'repo');
            expect(netScore.name).toBe('NetScore');
            expect(netScore.value).toBe(0);
        });
        it('should calculate value correctly', async () => {
            const netScore = new NetScore('owner', 'repo');
            const rampUp = new RampUp('owner', 'repo');
            const busFactor = new BusFactor('owner', 'repo');
            const responsiveMaintainer = new ResponsiveMaintainer('owner', 'repo');
            const license = new License('owner', 'repo');
            rampUp.value = 1;
            busFactor.value = 1;
            responsiveMaintainer.value = 1;
            license.value = 1;
            await netScore.calculateValue(rampUp, busFactor, responsiveMaintainer, license);
            expect(netScore.value).toBe(1);
        });
    });
    describe('RampUp', () => {
        it('should initialize with correct values', () => {
            const rampUp = new RampUp('owner', 'repo');
            expect(rampUp.name).toBe('RampUp');
            expect(rampUp.value).toBe(0);
        });
        it('should calculate value correctly', async () => {
            const rampUp = new RampUp('owner', 'repo');
            await rampUp.calculateValue(1000);
            expect(rampUp.value).toBeGreaterThan(0);
        });
    });
    describe('Correctness', () => {
        it('should initialize with correct values', () => {
            const correctness = new Correctness('owner', 'repo');
            expect(correctness.name).toBe('Correctness');
            expect(correctness.value).toBe(0);
        });
        it('should calculate value correctly', async () => {
            const correctness = new Correctness('owner', 'repo');
            await correctness.calculateValue();
            expect(correctness.latencyValue).toBeGreaterThan(0);
        });
    });
    describe('BusFactor', () => {
        it('should initialize with correct values', () => {
            const busFactor = new BusFactor('owner', 'repo');
            expect(busFactor.name).toBe('BusFactor');
            expect(busFactor.value).toBe(0);
        });
        it('should calculate value correctly', async () => {
            const busFactor = new BusFactor('owner', 'repo');
            await busFactor.calculateValue();
            expect(busFactor.latencyValue).toBeGreaterThan(0);
        });
    });
    describe('ResponsiveMaintainer', () => {
        it('should initialize with correct values', () => {
            const responsiveMaintainer = new ResponsiveMaintainer('owner', 'repo');
            expect(responsiveMaintainer.name).toBe('ResponsiveMaintainer');
            expect(responsiveMaintainer.value).toBe(0);
        });
        it('should calculate value correctly', async () => {
            const responsiveMaintainer = new ResponsiveMaintainer('owner', 'repo');
            await responsiveMaintainer.calculateValue(30, 100);
            expect(responsiveMaintainer.value).toBeGreaterThan(0);
        });
    });
    describe('License', () => {
        it('should initialize with correct values', () => {
            const license = new License('owner', 'repo');
            expect(license.name).toBe('License');
            expect(license.value).toBe(0);
        });
        it('should calculate value correctly', async () => {
            const license = new License('owner', 'repo');
            await license.calculateValue('MIT', 'MIT');
            expect(license.value).toBe(1);
        });
    });
});
