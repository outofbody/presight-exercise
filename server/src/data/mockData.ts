import { faker } from '@faker-js/faker';
import type { Person } from '../types';

const NATIONALITIES = [
  'American', 'British', 'Canadian', 'French', 'German', 'Italian',
  'Spanish', 'Japanese', 'Chinese', 'Indian', 'Australian', 'Brazilian',
  'Mexican', 'Russian', 'Korean', 'Dutch', 'Swedish', 'Norwegian',
  'Polish', 'Greek'
];

const HOBBIES = [
  'Reading', 'Writing', 'Swimming', 'Cycling', 'Running', 'Cooking',
  'Photography', 'Painting', 'Music', 'Dancing', 'Gaming', 'Traveling',
  'Hiking', 'Yoga', 'Gardening', 'Chess', 'Fishing', 'Skiing',
  'Surfing', 'Tennis', 'Basketball', 'Soccer', 'Volleyball', 'Golf',
  'Boxing', 'Martial Arts', 'Knitting', 'Sewing', 'Woodworking', 'Pottery'
];

let cachedData: Person[] | null = null;

export function generateMockData(count: number = 1000): Person[] {
  if (cachedData) {
    return cachedData;
  }

  const data: Person[] = [];
  for (let i = 0; i < count; i++) {
    const hobbyCount = faker.number.int({ min: 0, max: 10 });
    const hobbies = faker.helpers.arrayElements(HOBBIES, hobbyCount);
    
    data.push({
      avatar: faker.image.avatar(),
      first_name: faker.person.firstName(),
      last_name: faker.person.lastName(),
      age: faker.number.int({ min: 18, max: 80 }),
      nationality: faker.helpers.arrayElement(NATIONALITIES),
      hobbies
    });
  }

  cachedData = data;
  return data;
}

export function getTopHobbies(data: Person[], limit: number = 20): string[] {
  const hobbyCounts = new Map<string, number>();
  
  data.forEach(person => {
    person.hobbies.forEach(hobby => {
      hobbyCounts.set(hobby, (hobbyCounts.get(hobby) || 0) + 1);
    });
  });

  return Array.from(hobbyCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([hobby]) => hobby);
}

export function getTopNationalities(data: Person[], limit: number = 20): string[] {
  const nationalityCounts = new Map<string, number>();
  
  data.forEach(person => {
    nationalityCounts.set(
      person.nationality,
      (nationalityCounts.get(person.nationality) || 0) + 1
    );
  });

  return Array.from(nationalityCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([nationality]) => nationality);
}
