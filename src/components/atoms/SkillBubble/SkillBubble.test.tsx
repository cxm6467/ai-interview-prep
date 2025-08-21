import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SkillBubble } from './SkillBubble';

describe('SkillBubble Component', () => {
  it('renders with default props', () => {
    render(<SkillBubble>React</SkillBubble>);
    const bubble = screen.getByText('React');
    expect(bubble).toBeInTheDocument();
  });

  it('applies default success variant styles', () => {
    render(<SkillBubble>JavaScript</SkillBubble>);
    const bubble = screen.getByText('JavaScript');
    
    expect(bubble).toHaveStyle({
      background: 'rgb(34, 197, 94)',
      color: 'rgb(255, 255, 255)',
      padding: '0.25rem 0.5rem'
    });
  });

  it('applies warning variant styles', () => {
    render(<SkillBubble variant="warning">TypeScript</SkillBubble>);
    const bubble = screen.getByText('TypeScript');
    
    expect(bubble).toHaveStyle({
      background: 'rgb(249, 115, 22)',
      color: 'rgb(255, 255, 255)'
    });
  });

  it('applies success variant styles explicitly', () => {
    render(<SkillBubble variant="success">Node.js</SkillBubble>);
    const bubble = screen.getByText('Node.js');
    
    expect(bubble).toHaveStyle({
      background: 'rgb(34, 197, 94)',
      color: 'rgb(255, 255, 255)'
    });
  });

  it('applies custom className', () => {
    render(<SkillBubble className="custom-bubble">Python</SkillBubble>);
    const bubble = screen.getByText('Python');
    expect(bubble).toHaveClass('custom-bubble');
  });

  it('renders as a span element', () => {
    render(<SkillBubble>HTML</SkillBubble>);
    const bubble = screen.getByText('HTML');
    expect(bubble.tagName.toLowerCase()).toBe('span');
  });

  it('applies responsive text styles', () => {
    render(<SkillBubble>Very Long Skill Name That Should Break</SkillBubble>);
    const bubble = screen.getByText('Very Long Skill Name That Should Break');
    
    expect(bubble).toHaveStyle({
      wordBreak: 'break-word',
      overflowWrap: 'break-word',
      maxWidth: '100%',
      display: 'inline-block'
    });
  });

  it('renders complex children correctly', () => {
    render(
      <SkillBubble>
        <span>React</span> & <span>Redux</span>
      </SkillBubble>
    );
    
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Redux')).toBeInTheDocument();
    expect(screen.getByText('&')).toBeInTheDocument();
  });

  it('handles empty className gracefully', () => {
    render(<SkillBubble className="">CSS</SkillBubble>);
    const bubble = screen.getByText('CSS');
    expect(bubble).toBeInTheDocument();
    expect(bubble.className).toBe('');
  });

  it('maintains consistent styling across variants', () => {
    const { rerender } = render(<SkillBubble variant="success">Test</SkillBubble>);
    let bubble = screen.getByText('Test');
    
    // Common styles should be present
    expect(bubble).toHaveStyle({
      padding: '0.25rem 0.5rem',
      color: 'rgb(255, 255, 255)'
    });

    rerender(<SkillBubble variant="warning">Test</SkillBubble>);
    bubble = screen.getByText('Test');
    
    // Common styles should still be present
    expect(bubble).toHaveStyle({
      padding: '0.25rem 0.5rem',
      color: 'rgb(255, 255, 255)'
    });
  });

  it('renders multiple skill bubbles with different variants', () => {
    render(
      <div>
        <SkillBubble variant="success">Skill 1</SkillBubble>
        <SkillBubble variant="warning">Skill 2</SkillBubble>
        <SkillBubble>Skill 3</SkillBubble>
      </div>
    );

    const skill1 = screen.getByText('Skill 1');
    const skill2 = screen.getByText('Skill 2');
    const skill3 = screen.getByText('Skill 3');

    expect(skill1).toHaveStyle({ background: 'rgb(34, 197, 94)' });
    expect(skill2).toHaveStyle({ background: 'rgb(249, 115, 22)' });
    expect(skill3).toHaveStyle({ background: 'rgb(34, 197, 94)' }); // default
  });
});