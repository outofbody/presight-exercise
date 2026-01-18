import { describe, it, expect } from '@jest/globals';
import { generateMockData, getTopHobbies, getTopNationalities } from './mockData';

describe('mockData', () => {
  describe('generateMockData', () => {
    it('should generate the specified number of people', () => {
      const data = generateMockData(1000);
      expect(data).toHaveLength(1000);
    });

    it('should generate people with all required fields', () => {
      const data = generateMockData(10);
      data.forEach(person => {
        expect(person).toHaveProperty('avatar');
        expect(person).toHaveProperty('first_name');
        expect(person).toHaveProperty('last_name');
        expect(person).toHaveProperty('age');
        expect(person).toHaveProperty('nationality');
        expect(person).toHaveProperty('hobbies');
        expect(Array.isArray(person.hobbies)).toBe(true);
      });
    });

    it('should generate hobbies between 0 and 10', () => {
      const data = generateMockData(50);
      data.forEach(person => {
        expect(person.hobbies.length).toBeGreaterThanOrEqual(0);
        expect(person.hobbies.length).toBeLessThanOrEqual(10);
      });
    });

    it('should cache data on subsequent calls', () => {
      const data1 = generateMockData(1000);
      const data2 = generateMockData(1000);
      expect(data1).toBe(data2);
    });
  });

  describe('getTopHobbies', () => {
    it('should return top hobbies', () => {
      const data = generateMockData(1000);
      const topHobbies = getTopHobbies(data, 20);
      expect(topHobbies).toHaveLength(20);
      expect(Array.isArray(topHobbies)).toBe(true);
    });
  });

  describe('getTopNationalities', () => {
    it('should return top nationalities', () => {
      const data = generateMockData(1000);
      const topNationalities = getTopNationalities(data, 20);
      expect(topNationalities).toHaveLength(20);
      expect(Array.isArray(topNationalities)).toBe(true);
    });
  });
});
