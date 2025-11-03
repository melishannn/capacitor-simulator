'use client';

import { useEffect, useRef, useState } from 'react';


const COLOR_PALETTE = {
  pale_azure: { DEFAULT: '#97dffc', 100: '#02394e', 200: '#05719c', 300: '#07aaea', 400: '#49c7f9', 500: '#97dffc', 600: '#ace6fc', 700: '#c1ecfd', 800: '#d5f2fe', 900: '#eaf9fe' },
  tropical_indigo: { DEFAULT: '#858ae3', 100: '#0d103b', 200: '#1b1f76', 300: '#282fb1', 400: '#4b52d6', 500: '#858ae3', 600: '#9fa2e9', 700: '#b7b9ef', 800: '#cfd1f4', 900: '#e7e8fa' },
  iris: { DEFAULT: '#613dc1', 100: '#130c27', 200: '#27184e', 300: '#3a2574', 400: '#4d319b', 500: '#613dc1', 600: '#8064ce', 700: '#a08bda', 800: '#c0b1e7', 900: '#dfd8f3' },
  indigo: { DEFAULT: '#4e148c', 100: '#0f041c', 200: '#1f0837', 300: '#2e0c53', 400: '#3e106f', 500: '#4e148c', 600: '#6f1dc8', 700: '#9346e5', 800: '#b784ed', 900: '#dbc1f6' },
  russian_violet: { DEFAULT: '#2c0735', 100: '#09010b', 200: '#120316', 300: '#1b0420', 400: '#24062b', 500: '#2c0735', 600: '#6e1186', 700: '#b01cd5', 800: '#cf60ea', 900: '#e7b0f5' }
};

const DIELECTRICS = [
  { name: "Vacuum", k: 1.0 },
  { name: "Air", k: 1.0006 },
  { name: "Glass", k: 5.0 },
  { name: "Water", k: 80.0 },
  { name: "Paper", k: 3.0 },
  { name: "Polyethylene", k: 2.25 },
];

const EPSILON_0 = 8.854e-12;

const round = (val, digits = 2) => Math.round(val * Math.pow(10, digits)) / Math.pow(10, digits);

const CapacitorVisualization = ({ d, A, V, k, dielectricName, isClient }) => {
  if (!isClient) {
    return (
      <div className="flex flex-col items-center">
        <div className="w-80 h-80 flex items-center justify-center">
          <div style={{ color: COLOR_PALETTE.pale_azure[600] }}>
            Loading visualization...
          </div>
        </div>
      </div>
    );
  }

  const C = k * EPSILON_0 * A / d;
  const Q = C * V;
  
  const nDots = Math.max(6, Math.min(24, Math.round(Q / (1e-8) * 8)));
  const svgWidth = 350;
  const svgHeight = 320;
  
  const plateWidth = Math.max(180, Math.min(280, 180 + (A - 0.002) * 5000));
  const plateHeight = Math.max(30, Math.min(50, 30 + (A - 0.002) * 1000));
  
  const gap = 40 + (d - 0.01) * 800;
  const startY = (svgHeight - 2 * plateHeight - gap - 60) / 2;
  
  const dots = [];
  for (let i = 0; i < nDots; i++) {
    const x = (svgWidth - plateWidth) / 2 + (i + 1) * (plateWidth / (nDots + 1));
    dots.push(
      { x, y: startY + plateHeight / 2, sign: "+", color: COLOR_PALETTE.pale_azure[400] },
      { x, y: startY + plateHeight + gap + plateHeight / 2, sign: "-", color: COLOR_PALETTE.tropical_indigo[400] }
    );
  }

  return (
    <div className="flex flex-col items-center">
      <svg width={svgWidth} height={svgHeight} style={{ touchAction: 'none' }}>
        <defs>
          <linearGradient id="topPlate" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={COLOR_PALETTE.pale_azure[500]} />
            <stop offset="100%" stopColor={COLOR_PALETTE.pale_azure[300]} />
          </linearGradient>
          <linearGradient id="bottomPlate" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={COLOR_PALETTE.tropical_indigo[500]} />
            <stop offset="100%" stopColor={COLOR_PALETTE.tropical_indigo[300]} />
          </linearGradient>
          <filter id="shadow">
            <feDropShadow dx="4" dy="4" stdDeviation="3" floodOpacity="0.3"/>
          </filter>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        <rect
          x={(svgWidth - plateWidth) / 2} y={startY}
          width={plateWidth} height={plateHeight}
          rx={12} fill="url(#topPlate)"
          filter="url(#shadow)"
        />
        
        <rect
          x={(svgWidth - plateWidth) / 2} y={startY + plateHeight + gap}
          width={plateWidth} height={plateHeight}
          rx={12} fill="url(#bottomPlate)"
          filter="url(#shadow)"
        />

        {Array.from({ length: 6 }).map((_, i) => {
          const x = (svgWidth - plateWidth) / 2 + plateWidth * 0.15 + i * (plateWidth * 0.7 / 5);
          return (
            <line
              key={i}
              x1={x} y1={startY + plateHeight}
              x2={x} y2={startY + plateHeight + gap}
              stroke={COLOR_PALETTE.iris[600]}
              strokeWidth={2}
              strokeDasharray="4,4"
              opacity={0.6}
              filter="url(#glow)"
            />
          );
        })}

        <rect
          x={(svgWidth - plateWidth) / 2 + 2} y={startY + plateHeight + 4}
          width={plateWidth - 4} height={gap - 8}
          rx={8} fill={COLOR_PALETTE.iris[700]}
          opacity={0.15 + 0.1 * (k - 1)}
        />

        {dots.map((dot, i) => (
          <g key={i}>
            <circle
              cx={dot.x} cy={dot.y} r={6 + V/100}
              fill={dot.color}
              filter="url(#shadow)"
            />
            <text
              x={dot.x} y={dot.y + 3}
              fontSize={10 + V/50} fill="white"
              textAnchor="middle" fontWeight="bold"
            >
              {dot.sign}
            </text>
          </g>
        ))}

        <text
          x={svgWidth - 30} y={startY + plateHeight + gap / 2}
          fill={COLOR_PALETTE.pale_azure[600]}
          fontSize={14} textAnchor="middle"
          fontWeight="bold"
          filter="url(#glow)"
        >
          d
        </text>

        <text
          x={20} y={startY + plateHeight + gap / 2}
          fill={COLOR_PALETTE.tropical_indigo[600]}
          fontSize={12} textAnchor="middle"
          fontWeight="bold"
          filter="url(#glow)"
        >
          {V}V
        </text>

        <text
          x={svgWidth / 2} y={startY - 10}
          fill={COLOR_PALETTE.pale_azure[600]}
          fontSize={12} textAnchor="middle"
          fontWeight="bold"
          filter="url(#glow)"
        >
          A = {round(A * 1000, 1)} cm²
        </text>
      </svg>
      
      <div 
        className="mt-2 text-center font-semibold"
        style={{ 
          color: COLOR_PALETTE.iris[600],
          textShadow: `0 0 8px ${COLOR_PALETTE.iris[400]}50`
        }}
      >
        Dielectric: {dielectricName} (κ = {k})
      </div>
    </div>
  );
};

const CustomSlider = ({ label, value, min, max, step, unit, onChange, isClient }) => {
  const sliderStyle = {
    width: '100%',
    height: '12px',
    borderRadius: '6px',
    background: `linear-gradient(145deg, ${COLOR_PALETTE.russian_violet[300]}, ${COLOR_PALETTE.russian_violet[500]})`,
    boxShadow: `inset 4px 4px 8px ${COLOR_PALETTE.russian_violet[200]}, inset -4px -4px 8px ${COLOR_PALETTE.russian_violet[600]}`,
    outline: 'none',
    appearance: 'none',
    cursor: 'pointer',
  };

  const thumbStyle = `
    input[type="range"]::-webkit-slider-thumb {
      appearance: none;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: linear-gradient(145deg, ${COLOR_PALETTE.pale_azure[500]}, ${COLOR_PALETTE.pale_azure[300]});
      box-shadow: 4px 4px 8px ${COLOR_PALETTE.russian_violet[200]}, -4px -4px 8px ${COLOR_PALETTE.russian_violet[600]};
      cursor: pointer;
      transition: all 0.2s ease;
    }
    input[type="range"]::-webkit-slider-thumb:hover {
      transform: scale(1.05);
      box-shadow: 6px 6px 12px ${COLOR_PALETTE.russian_violet[200]}, -6px -6px 12px ${COLOR_PALETTE.russian_violet[600]};
    }
    input[type="range"]::-webkit-slider-thumb:active {
      transform: scale(0.95);
      box-shadow: 2px 2px 4px ${COLOR_PALETTE.russian_violet[200]}, -2px -2px 4px ${COLOR_PALETTE.russian_violet[600]};
    }
    input[type="range"]::-moz-range-thumb {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: linear-gradient(145deg, ${COLOR_PALETTE.pale_azure[500]}, ${COLOR_PALETTE.pale_azure[300]});
      box-shadow: 4px 4px 8px ${COLOR_PALETTE.russian_violet[200]}, -4px -4px 8px ${COLOR_PALETTE.russian_violet[600]};
      cursor: pointer;
      border: none;
    }
  `;

  return (
    <div className={`mb-6 transition-opacity duration-800 ${isClient ? 'opacity-100' : 'opacity-0'}`}>
      <style>{thumbStyle}</style>
      <div className="flex justify-between items-center mb-2">
        <div className="text-lg font-semibold" style={{ color: COLOR_PALETTE.pale_azure[700] }}>
          {label}
        </div>
        <div 
          className="text-lg font-bold text-xl"
          style={{ 
            color: COLOR_PALETTE.tropical_indigo[600],
            textShadow: `0 0 10px ${COLOR_PALETTE.tropical_indigo[400]}`
          }}
        >
          {round(value, 3)} {unit}
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={sliderStyle}
        className="mt-2"
      />
    </div>
  );
};

const CustomSelect = ({ label, value, options, onChange, isClient }) => (
  <div className={`mb-6 transition-opacity duration-1000 ${isClient ? 'opacity-100' : 'opacity-0'}`}>
    <label className="block text-lg font-semibold mb-2" style={{ color: COLOR_PALETTE.pale_azure[700] }}>
      {label}
    </label>
    <select
      value={value}
      onChange={(e) => onChange(parseInt(e.target.value))}
      className="w-full p-4 text-lg font-medium rounded-2xl outline-none"
      style={{
        background: `linear-gradient(145deg, ${COLOR_PALETTE.russian_violet[300]}, ${COLOR_PALETTE.russian_violet[500]})`,
        boxShadow: `inset 4px 4px 8px ${COLOR_PALETTE.russian_violet[200]}, inset -4px -4px 8px ${COLOR_PALETTE.russian_violet[600]}`,
        color: COLOR_PALETTE.pale_azure[700],
        border: 'none',
      }}
    >
      {options.map((option, i) => (
        <option 
          key={i} 
          value={i}
          style={{ 
            backgroundColor: COLOR_PALETTE.russian_violet[400],
            color: COLOR_PALETTE.pale_azure[700]
          }}
        >
          {option.name} (κ = {option.k})
        </option>
      ))}
    </select>
  </div>
);

const ResultCard = ({ title, value, unit, bgColor, textColor, delay = 0, isClient }) => (
  <div 
    className={`h-full transition-all duration-1000 transform ${isClient ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
    style={{ transitionDelay: `${delay}ms` }}
  >
    <div 
      className="h-full p-6 text-center rounded-3xl transition-all duration-300 hover:scale-105 hover:-translate-y-1"
      style={{
        background: `linear-gradient(145deg, ${COLOR_PALETTE.russian_violet[300]}, ${COLOR_PALETTE.russian_violet[500]})`,
        boxShadow: `8px 8px 16px ${COLOR_PALETTE.russian_violet[200]}, -8px -8px 16px ${COLOR_PALETTE.russian_violet[600]}`,
      }}
    >
      <div 
        className="text-lg font-semibold mb-2"
        style={{ 
          color: textColor,
          textShadow: `0 0 8px ${textColor}50`
        }}
      >
        {title}
      </div>
      <div 
        className="text-4xl font-bold"
        style={{ 
          color: bgColor,
          textShadow: `0 0 12px ${bgColor}80`
        }}
      >
        {isClient ? value : 0}
      </div>
      <div 
        className="text-lg font-medium mt-1"
        style={{ color: bgColor }}
      >
        {unit}
      </div>
    </div>
  </div>
);

const MobileMenu = ({ visualizationRef, controlsRef, resultsRef }) => {
  const [isOpen, setIsOpen] = useState(false);

  const scrollToSection = (ref) => {
    if (ref.current) {
      ref.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
      });
      setIsOpen(false);
    }
  };

  const menuItems = [
    { text: 'Visualization', onClick: () => scrollToSection(visualizationRef), icon: '🔬' },
    { text: 'Controls', onClick: () => scrollToSection(controlsRef), icon: '⚙️' },
    { text: 'Results', onClick: () => scrollToSection(resultsRef), icon: '📊' }
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-5 right-5 z-50 w-14 h-14 rounded-2xl font-bold text-2xl transition-all duration-200 hover:scale-105 active:scale-95"
        style={{
          background: `linear-gradient(145deg, ${COLOR_PALETTE.pale_azure[500]}, ${COLOR_PALETTE.pale_azure[300]})`,
          color: COLOR_PALETTE.russian_violet[200],
          boxShadow: `8px 8px 16px ${COLOR_PALETTE.russian_violet[200]}, -8px -8px 16px ${COLOR_PALETTE.russian_violet[600]}`,
        }}
      >
        {isOpen ? '✕' : '☰'}
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40"
            style={{ backgroundColor: `${COLOR_PALETTE.russian_violet[100]}80`, backdropFilter: 'blur(8px)' }}
            onClick={() => setIsOpen(false)}
          />
          
          <div 
            className="fixed top-0 right-0 w-80 h-full z-40 p-6 pt-20"
            style={{
              background: `linear-gradient(145deg, ${COLOR_PALETTE.russian_violet[300]}, ${COLOR_PALETTE.russian_violet[500]})`,
              boxShadow: `-20px 0 40px ${COLOR_PALETTE.russian_violet[100]}`,
              backdropFilter: 'blur(20px)',
              border: `1px solid ${COLOR_PALETTE.pale_azure[700]}20`,
            }}
          >
            <div className="mb-8 text-center">
              <div 
                className="text-2xl font-bold mb-2"
                style={{ 
                  color: COLOR_PALETTE.pale_azure[600],
                  textShadow: `0 0 12px ${COLOR_PALETTE.pale_azure[400]}50`
                }}
              >
                Navigation
              </div>
              <div style={{ color: COLOR_PALETTE.tropical_indigo[600] }}>
                Capacitor Simulator
              </div>
            </div>

            {menuItems.map((item, index) => (
              <div
                key={index}
                onClick={item.onClick}
                className="mb-4 p-5 rounded-3xl cursor-pointer transition-all duration-300 hover:-translate-x-2 hover:scale-105 active:translate-x-0 active:scale-100"
                style={{
                  background: `linear-gradient(145deg, ${COLOR_PALETTE.russian_violet[400]}, ${COLOR_PALETTE.russian_violet[600]})`,
                  boxShadow: `8px 8px 16px ${COLOR_PALETTE.russian_violet[200]}, -8px -8px 16px ${COLOR_PALETTE.russian_violet[700]}`,
                  border: `1px solid ${COLOR_PALETTE.pale_azure[700]}10`,
                }}
              >
                <div className="flex items-center gap-4">
                  <div 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl"
                    style={{
                      background: `linear-gradient(145deg, ${COLOR_PALETTE.pale_azure[500]}, ${COLOR_PALETTE.pale_azure[300]})`,
                      boxShadow: `4px 4px 8px ${COLOR_PALETTE.russian_violet[200]}, -4px -4px 8px ${COLOR_PALETTE.russian_violet[600]}`,
                    }}
                  >
                    {item.icon}
                  </div>
                  <div 
                    className="text-lg font-bold"
                    style={{ color: COLOR_PALETTE.pale_azure[700] }}
                  >
                    {item.text}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
};

export default function CapacitorSimulator() {
  const [d, setD] = useState(0.02);
  const [A, setA] = useState(0.008);
  const [V, setV] = useState(30);
  const [dielectricIdx, setDielectricIdx] = useState(0);
  const [isClient, setIsClient] = useState(false);
  
  const visualizationRef = useRef(null);
  const controlsRef = useRef(null);
  const resultsRef = useRef(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const k = DIELECTRICS[dielectricIdx].k;
  const C = k * EPSILON_0 * A / d;
  const Q = C * V;
  const U = 0.5 * C * V * V;

  return (
    <div 
      className="min-h-screen p-4 relative"
      style={{
        background: `linear-gradient(135deg, ${COLOR_PALETTE.russian_violet[200]} 0%, ${COLOR_PALETTE.russian_violet[400]} 100%)`,
      }}
    >
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 20% 50%, ${COLOR_PALETTE.pale_azure[900]}20 0%, transparent 50%), 
                      radial-gradient(circle at 80% 20%, ${COLOR_PALETTE.tropical_indigo[900]}20 0%, transparent 50%),
                      radial-gradient(circle at 40% 80%, ${COLOR_PALETTE.iris[900]}20 0%, transparent 50%)`
        }}
      />
      
      <MobileMenu 
        visualizationRef={visualizationRef}
        controlsRef={controlsRef}
        resultsRef={resultsRef}
      />

      <div className="max-w-md mx-auto relative z-10">
        <div 
          className={`text-center mb-6 pt-2 transition-opacity duration-1200 ${isClient ? 'opacity-100' : 'opacity-0'}`}
          ref={resultsRef}
        >
          <h1 
            className="text-5xl font-bold mb-2"
            style={{
              background: `linear-gradient(45deg, ${COLOR_PALETTE.pale_azure[500]}, ${COLOR_PALETTE.tropical_indigo[500]})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Capacitor Simulator
          </h1>
          <div 
            className="text-xl"
            style={{ 
              color: COLOR_PALETTE.tropical_indigo[600],
              textShadow: `0 0 10px ${COLOR_PALETTE.tropical_indigo[400]}50`
            }}
          >
            Interactive Physics Visualization
          </div>
        </div>

        <div 
          ref={visualizationRef}
          className={`p-6 mb-6 rounded-3xl transition-all duration-1000 ${isClient ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          style={{
            background: `linear-gradient(145deg, ${COLOR_PALETTE.russian_violet[300]}, ${COLOR_PALETTE.russian_violet[500]})`,
            boxShadow: `8px 8px 16px ${COLOR_PALETTE.russian_violet[200]}, -8px -8px 16px ${COLOR_PALETTE.russian_violet[600]}`,
          }}
        >
          <CapacitorVisualization 
            d={d} 
            A={A} 
            V={V} 
            k={k} 
            dielectricName={DIELECTRICS[dielectricIdx].name}
            isClient={isClient}
          />
        </div>

        <div 
          ref={controlsRef}
          className={`p-8 mb-6 rounded-3xl transition-all duration-1000 ${isClient ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          style={{
            background: `linear-gradient(145deg, ${COLOR_PALETTE.russian_violet[300]}, ${COLOR_PALETTE.russian_violet[500]})`,
            boxShadow: `8px 8px 16px ${COLOR_PALETTE.russian_violet[200]}, -8px -8px 16px ${COLOR_PALETTE.russian_violet[600]}`,
            transitionDelay: '400ms'
          }}
        >
          <CustomSlider
            label="Plate Separation"
            value={d}
            min={0.01}
            max={0.1}
            step={0.001}
            unit="m"
            onChange={setD}
            isClient={isClient}
          />
          
          <CustomSlider
            label="Plate Area"
            value={A}
            min={0.002}
            max={0.02}
            step={0.0005}
            unit="m²"
            onChange={setA}
            isClient={isClient}
          />
          
          <CustomSlider
            label="Voltage"
            value={V}
            min={1}
            max={500}
            step={1}
            unit="V"
            onChange={setV}
            isClient={isClient}
          />

          <CustomSelect
            label="Dielectric Material"
            value={dielectricIdx}
            options={DIELECTRICS}
            onChange={setDielectricIdx}
            isClient={isClient}
          />
        </div>

        <div className="mb-4">
          <ResultCard
            title="Capacitance"
            value={C > 1e-6 ? round(C * 1e6, 2) : round(C * 1e9, 2)}
            unit={C > 1e-6 ? "μF" : "nF"}
            bgColor={COLOR_PALETTE.pale_azure[500]}
            textColor={COLOR_PALETTE.pale_azure[700]}
            delay={600}
            isClient={isClient}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <ResultCard
            title="Charge"
            value={Q > 1e-6 ? round(Q * 1e6, 2) : round(Q * 1e9, 2)}
            unit={Q > 1e-6 ? "μC" : "nC"}
            bgColor={COLOR_PALETTE.tropical_indigo[500]}
            textColor={COLOR_PALETTE.tropical_indigo[700]}
            delay={800}
            isClient={isClient}
          />
          
          <ResultCard
            title="Energy"
            value={U > 1e-3 ? round(U * 1e3, 2) : round(U * 1e6, 2)}
            unit={U > 1e-3 ? "mJ" : "μJ"}
            bgColor={COLOR_PALETTE.iris[500]}
            textColor={COLOR_PALETTE.iris[700]}
            delay={1000}
            isClient={isClient}
          />
        </div>
      </div>
    </div>
  );
}