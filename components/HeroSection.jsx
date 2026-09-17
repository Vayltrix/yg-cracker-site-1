'use client';

import { useRef } from 'react';
import Link from 'next/link';
import HeroBanner3D from './HeroBanner3D';

export default function HeroSection() {
  const fireworksTriggerRef = useRef(null);

  const handleLaunchShow = () => {
    if (fireworksTriggerRef.current) {
      fireworksTriggerRef.current();
    }
  };

  return (
    <section className="hero-3d-section">
      <HeroBanner3D onFireworksLaunch={fireworksTriggerRef} />

      <div className="wrap hero-content-grid">
        <div className="hero-text-block">
          <div className="eyebrow-container">
            <span className="eyebrow">DIWALI 2026 • YOGA GANAPATHY CRACKERS</span>
            <span className="live-sparkle-pill">✦ 3D Festive Edition</span>
          </div>

          <h1>
            Light up your celebrations with <em>joy &amp; colour</em>
          </h1>

          <p>
            Explore our premier festive collection of crackers directly from Sivakasi.
            Experience authentic quality, transparent wholesale pricing, and instant WhatsApp ordering.
          </p>

          <div className="hero-highlights">
            <span className="highlight-tag">⚡ Sivakasi Direct Wholesale</span>
            <span className="highlight-tag">🪔 100% Genuine Quality</span>
            <span className="highlight-tag">📦 Instant Order Slip</span>
          </div>

          <div className="actions hero-actions">
            <Link className="btn btn-yellow glow-hover" href="/products">
              View Products
            </Link>
            <Link className="btn btn-white" href="/contact">
              Contact Us
            </Link>
            <button
              type="button"
              className="btn btn-firework-burst"
              onClick={handleLaunchShow}
              title="Ignite a festive fireworks show in 3D"
            >
              🎆 Launch 3D Fireworks
            </button>
          </div>
        </div>

        <div className="hero-interactive-zone" onClick={() => fireworksTriggerRef.current && fireworksTriggerRef.current()}>
          <div className="interactive-3d-card">
            <div className="card-top-tag">Interactive 3D Stage</div>
            <div className="card-hint-text">
              Hover &amp; move cursor to rotate 3D Rocket &amp; Chakra.
              <br />
              <strong>Tap anywhere</strong> to detonate colourful sky bursts!
            </div>
            <button type="button" className="btn-mini-ignite">
              ✨ Tap to Burst
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

