/**
 * Aurora Background - Cinema-grade animated mesh gradient
 * Slow breathing blobs with disciplined motion (42s/58s loops)
 */


export function AuroraBackground() {
  return (
    <div className="aurora-bg-wrapper">
      <style jsx>{`
        .aurora-bg-wrapper {
          position: absolute;
          inset: -20%;
          pointer-events: none;
          filter: saturate(1.2) contrast(1.05);
          transform: translateZ(0);
          overflow: hidden;
        }

        .aurora-layer-1,
        .aurora-layer-2 {
          position: absolute;
          inset: 0;
          background-repeat: no-repeat;
          mix-blend-mode: screen;
          opacity: 0.95;
          will-change: transform;
        }

        .aurora-layer-1 {
          background-image:
            radial-gradient(closest-side at 22% 28%, rgba(36,255,215,0.75), transparent 62%),
            radial-gradient(closest-side at 68% 22%, rgba(138,92,255,0.70), transparent 60%),
            radial-gradient(closest-side at 55% 72%, rgba(255,59,212,0.62), transparent 62%);
          filter: blur(28px);
          animation: aurora-drift-1 42s ease-in-out infinite alternate;
        }

        .aurora-layer-2 {
          background-image:
            radial-gradient(closest-side at 30% 75%, rgba(36,255,215,0.40), transparent 64%),
            radial-gradient(closest-side at 78% 60%, rgba(138,92,255,0.45), transparent 62%),
            radial-gradient(closest-side at 40% 40%, rgba(255,59,212,0.38), transparent 66%);
          filter: blur(46px);
          animation: aurora-drift-2 58s ease-in-out infinite alternate;
        }

        @keyframes aurora-drift-1 {
          0%   { transform: translate3d(-2%, -1%, 0) scale(1.02) rotate(-2deg); }
          50%  { transform: translate3d( 2%,  3%, 0) scale(1.06) rotate( 1deg); }
          100% { transform: translate3d(-1%,  1%, 0) scale(1.03) rotate(-1deg); }
        }

        @keyframes aurora-drift-2 {
          0%   { transform: translate3d( 2%,  1%, 0) scale(1.04) rotate( 1deg); }
          50%  { transform: translate3d(-2%, -2%, 0) scale(1.08) rotate(-1deg); }
          100% { transform: translate3d( 1%,  2%, 0) scale(1.05) rotate( 2deg); }
        }

        @media (prefers-reduced-motion: reduce) {
          .aurora-layer-1,
          .aurora-layer-2 {
            animation: none !important;
          }
        }
      `}</style>
      
      <div className="aurora-layer-1" />
      <div className="aurora-layer-2" />
    </div>
  );
}

export default AuroraBackground;