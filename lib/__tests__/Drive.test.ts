import { Drive } from '../subsystems/Drive';

describe('Drive', () => {
  let drive: Drive;
  const INITIAL = 50;
  const FLOOR = 0;
  const MIN_LIMIT = 20;
  const MAX_LIMIT = 80;
  const MAX = 100;

  beforeEach(() => {
    drive = new Drive(INITIAL, FLOOR, MIN_LIMIT, MAX_LIMIT, MAX);
  });

  describe('Initialization', () => {
    it('should initialize with correct values', () => {
      expect(drive.currentValue).toBe(INITIAL);
      expect(drive.floor).toBe(FLOOR);
      expect(drive.lowerLimit).toBe(MIN_LIMIT);
      expect(drive.upperLimit).toBe(MAX_LIMIT);
      expect(drive.max).toBe(MAX);
    });
  });

  describe('Value Modification', () => {
    it('should increment value', () => {
      drive.increment(10);
      expect(drive.currentValue).toBe(60);
    });

    it('should decrement value', () => {
      drive.decrement(10);
      expect(drive.currentValue).toBe(40);
    });

    it('should constrain value to max', () => {
      drive.increment(100);
      expect(drive.currentValue).toBe(MAX);
    });

    it('should constrain value to floor', () => {
      drive.decrement(100);
      expect(drive.currentValue).toBe(FLOOR);
    });
  });

  describe('Serialization', () => {
    it('should convert to JSON', () => {
      const json = drive.toJSON();
      expect(json).toEqual({
        initialValue: INITIAL,
        currentValue: INITIAL,
        floor: FLOOR,
        lowerLimit: MIN_LIMIT,
        upperLimit: MAX_LIMIT,
        max: MAX,
      });
    });

    it('should create from JSON', () => {
      const json = drive.toJSON();
      const newDrive = Drive.fromJSON(json);
      expect(newDrive.currentValue).toBe(drive.currentValue);
      expect(newDrive.max).toBe(drive.max);
    });
  });
});
