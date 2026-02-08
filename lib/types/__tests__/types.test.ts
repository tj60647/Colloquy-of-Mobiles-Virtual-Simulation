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
        id: 'male-1',
        type: 'Male',
        position: { x: 0, y: 0, z: 0 },
        orientation: { x: 1, y: 0, z: 0 },
        behavioralState: 'SatisfactionSearch',
        drives: { O: 75, P: 50 },
        dominantDrive: 'O',
      };

      expect(mobile.type).toBe('Male');
      expect(mobile.behavioralState).toBe('SatisfactionSearch');
      expect(mobile.dominantDrive).toBe('O');
    });

    it('should create a valid Bar mobile state without drives', () => {
      const bar: MobileState = {
        id: 'bar-1',
        type: 'Bar',
        position: { x: 0, y: 0, z: 0 },
        orientation: { x: 1, y: 0, z: 0 },
        behavioralState: 'SatisfactionSearch',
      };

      expect(bar.type).toBe('Bar');
      expect(bar.drives).toBeUndefined();
      expect(bar.dominantDrive).toBeUndefined();
    });
  });
});
