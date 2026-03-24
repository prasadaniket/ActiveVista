
import React from 'react';
import { cn } from '../lib/utils';

// Simple Perlin-like noise implementation
function NoiseGenerator() {
  const perm = Array(512);
  const p = Array(256).fill(0).map((_, i) => i);
  
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [p[i], p[j]] = [p[j], p[i]];
  }
  
  for (let i = 0; i < 256; i++) {
    perm[i] = perm[i + 256] = p[i];
  }
  
  function fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }
  
  function lerp(a, b, t) {
    return a + t * (b - a);
  }
  
  function grad(hash, x, y, z) {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }
  
  function noise3D(x, y, z) {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const Z = Math.floor(z) & 255;
    
    x -= Math.floor(x);
    y -= Math.floor(y);
    z -= Math.floor(z);
    
    const u = fade(x);
    const v = fade(y);
    const w = fade(z);
    
    const A = perm[X] + Y;
    const AA = perm[A] + Z;
    const AB = perm[A + 1] + Z;
    const B = perm[X + 1] + Y;
    const BA = perm[B] + Z;
    const BB = perm[B + 1] + Z;
    
    return lerp(
      lerp(
        lerp(grad(perm[AA], x, y, z), grad(perm[BA], x - 1, y, z), u),
        lerp(grad(perm[AB], x, y - 1, z), grad(perm[BB], x - 1, y - 1, z), u),
        v
      ),
      lerp(
        lerp(grad(perm[AA + 1], x, y, z - 1), grad(perm[BA + 1], x - 1, y, z - 1), u),
        lerp(grad(perm[AB + 1], x, y - 1, z - 1), grad(perm[BB + 1], x - 1, y - 1, z - 1), u),
        v
      ),
      w
    );
  }
  
  return { noise3D };
}

const createNoise3D = () => {
    const noiseGenerator = NoiseGenerator();
    return noiseGenerator.noise3D;
};

const WavyBackground = ({
    children,
    className,
    containerClassName,
    colors,
    waveWidth,
    backgroundFill,
    blur = 10,
    speed = "fast",
    waveOpacity = 0.5,
    ...props
}) => {
    const canvasRef = React.useRef(null);
    const [isSafari, setIsSafari] = React.useState(false);
    
    const noise = React.useMemo(() => createNoise3D(), []);
    let w, h, nt, i, x, ctx, canvas;

    const getSpeed = () => {
        switch (speed) {
            case "slow":
                return 0.0015;
            case "fast":
                return 0.003;
            default:
                return 0.0015;
        }
    };

    const waveColors = colors ?? [
        "#38bdf8",
        "#818cf8",
        "#c084fc",
        "#e879f9",
        "#22d3ee",
    ];

    const drawWave = (n) => {
        nt += getSpeed();
        for (i = 0; i < n; i++) {
            ctx.beginPath();
            ctx.lineWidth = waveWidth || 50;
            ctx.strokeStyle = waveColors[i % waveColors.length];
            
            const verticalOffset = (i - Math.floor(n/2)) * 15;
            const frequencyFactor = 0.7 + (i * 0.15);
            const phaseOffset = Math.PI * i / 1.5;
            
            for (x = 0; x < w; x += 5) {
                var y = noise(x / (800 * frequencyFactor), 0.3 * i, nt + i * 0.25) * 150;
                y += Math.sin((x / (300 + i * 20)) + phaseOffset + nt) * 25;
                ctx.lineTo(x, y + h * 0.5 + verticalOffset);
            }
            ctx.stroke();
            ctx.closePath();
        }
    };

    let animationId;
    const render = () => {
        ctx.fillStyle = backgroundFill || "black";
        ctx.globalAlpha = waveOpacity || 0.5;
        ctx.fillRect(0, 0, w, h);
        drawWave(5);
        animationId = requestAnimationFrame(render);
    };

    const init = () => {
        canvas = canvasRef.current;
        if (!canvas) return;
        ctx = canvas.getContext("2d");
        w = ctx.canvas.width = window.innerWidth;
        h = ctx.canvas.height = window.innerHeight;
        ctx.filter = `blur(${blur}px)`;
        nt = 0;
        
        window.onresize = function () {
            w = ctx.canvas.width = window.innerWidth;
            h = ctx.canvas.height = window.innerHeight;
            ctx.filter = `blur(${blur}px)`;
        };
        render();
    };

    React.useEffect(() => {
        init();
        return () => {
            cancelAnimationFrame(animationId);
            window.onresize = null;
        };
    }, [blur, speed]);

    React.useEffect(() => {
        setIsSafari(
            typeof window !== "undefined" &&
            navigator.userAgent.includes("Safari") &&
            !navigator.userAgent.includes("Chrome")
        );
    }, []);

    return (
        <div 
            className={cn(
                "relative flex flex-col items-center justify-center overflow-hidden", 
                containerClassName
            )}
        >
            <canvas
                className="absolute inset-0 z-0"
                ref={canvasRef}
                id="canvas"
                style={{
                    ...(isSafari ? { filter: `blur(${blur}px)` } : {}),
                }}
            ></canvas>
            <div 
                className={cn("relative z-10 w-full h-full", className)} 
                {...props}
            >
                {children}
            </div>
        </div>
    );
};

export default WavyBackground;
