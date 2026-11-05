"use client";

import { useState } from "react";

export function DiwaliAccent({ className = "" }: { className?: string }) {
  const [isLit, setIsLit] = useState(false);

  return (
    <div className={`diwali-accent ${className}`}>
      <div aria-hidden="true" className="diwali-accent__lights">
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>
      <button
        type="button"
        aria-label={isLit ? "Extinguish the Diwali diya" : "Light the Diwali diya"}
        aria-pressed={isLit}
        onClick={() => setIsLit((lit) => !lit)}
        className={`diwali-accent__button${isLit ? " is-lit" : ""}`}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 48 48"
          fill="none"
          className="diwali-accent__icon"
        >
          <path
            d="M24 5c-1.6 3.8-5.8 7.3-5.8 11.7A5.8 5.8 0 0 0 24 22.5a5.8 5.8 0 0 0 5.8-5.8C29.8 12.3 25.6 8.8 24 5Z"
            className="diwali-accent__flame"
          />
          <path
            d="M9 25.5c2.6 7.8 7.7 12 15 12s12.4-4.2 15-12H9Z"
            className="diwali-accent__bowl"
          />
          <path d="M14 31h20" className="diwali-accent__bowl-detail" />
          <path d="M24 22.5v4" className="diwali-accent__wick" />
        </svg>
        <span className="diwali-accent__spark diwali-accent__spark--one" />
        <span className="diwali-accent__spark diwali-accent__spark--two" />
        <span className="diwali-accent__spark diwali-accent__spark--three" />
      </button>
      <span className="diwali-accent__copy">
        <span className="diwali-accent__title">Happy Diwali</span>
        <span className="diwali-accent__hint">
          {isLit ? "A little festive sparkle" : "Tap to light the diya"}
        </span>
      </span>
      <span aria-hidden="true" className="diwali-accent__star">
        ✦
      </span>
    </div>
  );
}
