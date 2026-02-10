import { DriveValues, MobileState } from '../index';

describe('Type Definitions', () => {
  describe('DriveValues', () => {
    it('should create valid drive values', () => {
      const drives: DriveValues = {
        O: 50,
        P: 75,
      };

      expect(drives.O).toBe(50);
      expect(drives.P).toBe(75);
    });
  });

  describe('MobileState', () => {
    it('should create a valid Male mobile state', () => {
      const mobile: MobileState = {
        id: 1,
        name: 'Male-1',
        localPosition: { x: 0, y: 0, z: 0 },
        localOrientation: { yaw: 0, pitch: 0, roll: 0 },
        parentId: null,
        drives: { O: 75, P: 50 },
        horizontalControl: {},
        sensors: [],
        actuators: [],
        type: 'Male',
        behavioralState: 'SatisfactionSearch',
        dominantDrive: 'O',
      };

      expect(mobile.type).toBe('Male');
      expect(mobile.behavioralState).toBe('SatisfactionSearch');
      expect(mobile.dominantDrive).toBe('O');
    });

    it('should create a valid Bar mobile state without drives', () => {
      const bar: MobileState = {
        id: 2,
        name: 'Bar-1',
        localPosition: { x: 0, y: 0, z: 0 },
        localOrientation: { yaw: 0, pitch: 0, roll: 0 },
        parentId: null,
        drives: {},
        horizontalControl: {},
        sensors: [],
        actuators: [],
        type: 'Bar',
        behavioralState: 'SatisfactionSearch',
      };

      expect(bar.type).toBe('Bar');
    });
  });
});
