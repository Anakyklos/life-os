import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { Button } from '../Button';
import '@testing-library/jest-dom';

describe('Button Component', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders correctly with default props', () => {
        render(<Button>Click me</Button>);
        const button = screen.getByRole('button', { name: /click me/i });
        expect(button).toBeInTheDocument();
        expect(button).toHaveClass('bg-primary-cta');
    });

    it('renders with different variants', () => {
        const { rerender } = render(<Button variant="secondary">Secondary</Button>);
        expect(screen.getByRole('button', { name: /secondary/i })).toHaveClass('bg-zinc-800');

        rerender(<Button variant="destructive">Destructive</Button>);
        expect(screen.getByRole('button', { name: /destructive/i })).toHaveClass('bg-red-500/10');

        rerender(<Button variant="outline">Outline</Button>);
        expect(screen.getByRole('button', { name: /outline/i })).toHaveClass('border-white/10');
    });

    it('renders with different sizes', () => {
        const { rerender } = render(<Button size="sm">Small</Button>);
        expect(screen.getByRole('button', { name: /small/i })).toHaveClass('h-9');

        rerender(<Button size="lg">Large</Button>);
        expect(screen.getByRole('button', { name: /large/i })).toHaveClass('h-11');
    });

    it('applies custom className', () => {
        render(<Button className="custom-class">Custom</Button>);
        expect(screen.getByRole('button', { name: /custom/i })).toHaveClass('custom-class');
    });
});
/** @vitest-environment jsdom */
