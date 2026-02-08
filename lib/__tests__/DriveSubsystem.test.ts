import { DriveSubsystem } from '../subsystems/DriveSubsystem';
import { DriveSystemConfig, LegacyDriveState } from '../types/drives';

describe('DriveSubsystem', () => {
    let subsystem: DriveSubsystem;
    let config: DriveSystemConfig;

    beforeEach(() => {
        config = {
            O: {
                initialValue: 50,
                floor: 0,
                lowerLimit: 20,
                upperLimit: 80,
                max: 100,
                increment: 1,
                decrement: 10
            },
            P: {
                initialValue: 50,
                floor: 0,
                lowerLimit: 20,
                upperLimit: 80,
                max: 100,
                increment: 1,
                decrement: 10
            },
            interval: 1000, // Slow interval for testing
            maxHistorySamples: 5
        };

        subsystem = new DriveSubsystem(config);
        // Stop the internal timer so tests are deterministic
        subsystem.stopTimer();
    });

    afterEach(() => {
        subsystem.stopTimer();
    });

    describe('Initialization', () => {
        it('should initialize with config values', () => {
            expect(subsystem.ODrive.currentValue).toBe(50);
            expect(subsystem.PDrive.currentValue).toBe(50);
            expect(subsystem.ODriveMax).toBe(100);
        });

        it('should have initial history entry', () => {
            expect(subsystem.history.length).toBe(1);
            expect(subsystem.history[0].O).toBe(50);
        });
    });

    describe('State Logic', () => {
        it('should be SatisfiedAndIndifferent when both low', () => {
            subsystem.ODrive.currentValue = 10;
            subsystem.PDrive.currentValue = 10;
            // 10 < 20 (lowerLimit)
            expect(subsystem.getDriveState()).toBe(LegacyDriveState.SATISFIED_AND_INDIFFERENT);
        });

        it('should be O_Satisfaction_Search when O is high and O > P', () => {
            subsystem.ODrive.currentValue = 60; // > 20
            subsystem.PDrive.currentValue = 30; // > 20
            // 60 > 30, so O dominates
            expect(subsystem.getDriveState()).toBe(LegacyDriveState.O_SATISFACTION_SEARCH);
        });

        it('should be P_Satisfaction_Search when P is high and P > O', () => {
            subsystem.ODrive.currentValue = 30;
            subsystem.PDrive.currentValue = 60;
            expect(subsystem.getDriveState()).toBe(LegacyDriveState.P_SATISFACTION_SEARCH);
        });

        it('should be Either_O_or_P when both very high', () => {
            subsystem.ODrive.currentValue = 90; // > 80 (upperLimit)
            subsystem.PDrive.currentValue = 90; // > 80
            expect(subsystem.getDriveState()).toBe(LegacyDriveState.EITHER_O_OR_P_SATISFACTION_SEARCH);
        });
    });

    describe('Entropy & Interaction', () => {
        it('should increment drives (Entropy)', () => {
            subsystem.incrementDrives();
            // 50 + 1 = 51
            expect(subsystem.ODrive.currentValue).toBe(51);
            expect(subsystem.PDrive.currentValue).toBe(51);
            expect(subsystem.history.length).toBe(2);
        });

        it('should decrement O drive (Satisfy)', () => {
            subsystem.decrementODrive();
            // 50 - 10 = 40
            expect(subsystem.ODrive.currentValue).toBe(40);
        });
    });
});
