import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PersonCard } from './PersonCard';
import type { Person } from '../types';

const mockPerson: Person = {
  avatar: 'https://example.com/avatar.jpg',
  first_name: 'John',
  last_name: 'Doe',
  age: 30,
  nationality: 'American',
  hobbies: ['Reading', 'Swimming', 'Cooking', 'Gaming']
};

describe('PersonCard', () => {
  it('renders person information correctly', () => {
    render(<PersonCard person={mockPerson} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('American')).toBeInTheDocument();
    expect(screen.getByText(/30 years/)).toBeInTheDocument();
  });

  it('displays top 2 hobbies and remaining count', () => {
    render(<PersonCard person={mockPerson} />);

    expect(screen.getByText('Reading')).toBeInTheDocument();
    expect(screen.getByText('Swimming')).toBeInTheDocument();
    expect(screen.getByText('+2')).toBeInTheDocument();
  });

  it('handles person with no hobbies', () => {
    const personWithoutHobbies: Person = {
      ...mockPerson,
      hobbies: []
    };

    render(<PersonCard person={personWithoutHobbies} />);
    expect(screen.queryByText('+')).not.toBeInTheDocument();
  });

  it('displays avatar image', () => {
    render(<PersonCard person={mockPerson} />);
    const avatar = screen.getByAltText('John Doe');
    expect(avatar).toHaveAttribute('src', mockPerson.avatar);
  });
});
