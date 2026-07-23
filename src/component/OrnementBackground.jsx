import { useEffect, useState } from 'react';
import ornements_clair from '../assets/images/ornements_clair.png';

export default function OrnementBackground({
    containerRef,
    opacity     = 1,
    duration    = 6,
    image       = ornements_clair,
    useAbsolute = false,
}) {
    const [rect, setRect] = useState(null);

    useEffect(() => {
        if (useAbsolute) return;
        const update = () => {
            if (containerRef?.current)
                setRect(containerRef.current.getBoundingClientRect());
        };
        update();
        window.addEventListener('resize', update);
        window.addEventListener('scroll', update, true);
        return () => {
            window.removeEventListener('resize', update);
            window.removeEventListener('scroll', update, true);
        };
    }, [containerRef, useAbsolute]);

    const wrapStyle = useAbsolute
        ? { position: 'absolute', inset: 0 }
        : rect
            ? { position: 'fixed', top: rect.top, left: rect.left, width: rect.width, height: rect.height }
            : { position: 'fixed', inset: 0 };

    return (
        <>
            <style>{`
                @keyframes ornReveal {
                    0%   { -webkit-mask-position: -30% 0; mask-position: -30% 0; }
                    100% { -webkit-mask-position: 130% 0; mask-position: 130% 0; }
                }
                .orn-bg {
                    pointer-events: none;
                    z-index: 0;
                    overflow: hidden;
                }
                .orn-bg-img {
                    position: absolute;
                    inset: 0;
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    opacity: ${opacity};

                    -webkit-mask-image: linear-gradient(
                        105deg,
                        transparent         0%,
                        transparent        44%,
                        rgba(255,255,255,1) 48%,
                        rgba(255,255,255,1) 52%,
                        transparent        56%,
                        transparent       100%
                    );
                    mask-image: linear-gradient(
                        105deg,
                        transparent         0%,
                        transparent        44%,
                        rgba(255,255,255,1) 48%,
                        rgba(255,255,255,1) 52%,
                        transparent        56%,
                        transparent       100%
                    );
                    -webkit-mask-size: 200% 100%;
                    mask-size: 200% 100%;
                    -webkit-mask-repeat: no-repeat;
                    mask-repeat: no-repeat;

                    animation: ornReveal ${duration}s linear infinite;
                    animation-delay: -${duration * 0.15}s;
                    will-change: mask-position;
                }
            `}</style>

            <div className="orn-bg" style={wrapStyle}>
                <img
                    className="orn-bg-img"
                    src={image}
                    alt=""
                    aria-hidden="true"
                />
            </div>
        </>
    );
}