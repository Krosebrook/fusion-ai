/**
 * Test for ErrorBoundaryWrapper component
 * Safe refactor: Adding test for existing error boundary functionality
 */

import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundaryWrapper } from './ErrorBoundaryWrapper';

// Component that throws an error
const ThrowError = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

describe('ErrorBoundaryWrapper', () => {
  // Suppress console.error for these tests
  const originalError = console.error;
  beforeAll(() => {
    console.error = vi.fn();
  });
  afterAll(() => {
    console.error = originalError;
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundaryWrapper>
        <div>Test content</div>
      </ErrorBoundaryWrapper>
    );
    
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('renders error UI when child component throws', () => {
    render(
      <ErrorBoundaryWrapper title="Test Error">
        <ThrowError shouldThrow={true} />
      </ErrorBoundaryWrapper>
    );
    
    expect(screen.getByText('Test Error')).toBeInTheDocument();
    // Use getByRole to find the button specifically
    expect(screen.getByRole('button', { name: /Try Again/i })).toBeInTheDocument();
  });

  it('uses default title when not provided', () => {
    render(
      <ErrorBoundaryWrapper>
        <ThrowError shouldThrow={true} />
      </ErrorBoundaryWrapper>
    );
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('displays custom message when provided', () => {
    render(
      <ErrorBoundaryWrapper message="Custom error message">
        <ThrowError shouldThrow={true} />
      </ErrorBoundaryWrapper>
    );
    
    expect(screen.getByText('Custom error message')).toBeInTheDocument();
  });
});
