import { cn } from './cn';

describe('cn', () => {
  it('merges classnames and resolves tailwind conflicts', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
    expect(cn('text-red-500', false && 'hidden', 'font-bold')).toBe(
      'text-red-500 font-bold',
    );
  });
});