/*
  SectionHeader.jsx — Reusable section header with tag, title, description
*/
import React from 'react';
import { Sparkles } from 'lucide-react';
import RevealSection from './RevealSection';

const SectionHeader = ({ tag, title, description }) => (
  <div className="text-center max-w-3xl mx-auto mb-20">
    {tag && (
      <RevealSection>
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-display font-bold tracking-widest uppercase mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          {tag}
        </span>
      </RevealSection>
    )}
    <RevealSection delay={0.1}>
      <h2 className="text-4xl md:text-6xl font-display font-bold text-text leading-[1.1] mb-6">
        {title}
      </h2>
    </RevealSection>
    <RevealSection delay={0.2}>
      <p className="text-lg text-muted leading-relaxed max-w-2xl mx-auto">
        {description}
      </p>
    </RevealSection>
  </div>
);

export default SectionHeader;
