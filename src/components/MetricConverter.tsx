import React, { useState, useEffect } from 'react';
import { Ruler, Scale, RefreshCw, Layers, Wrench, CircleDot, Info, Copy, Check, X, Zap, ChevronDown } from 'lucide-react';
import { SharedHistoryProps } from '../types';

type ConversionType = 'length' | 'weight' | 'volume' | 'area' | 'bolt_drill' | 'pvc_pipes' | 'wire_sizes';

interface ToxMapping {
  plug: string;
  recommendedBit: string;
  typical: string;
}

const TOX_DATA: ToxMapping[] = [
  { plug: 'Tox #5 (Yellow)', recommendedBit: '3/16" masonry bit (5 mm)', typical: 'Visual paintings / Bathroom frames' },
  { plug: 'Tox #6 (Orange/Red)', recommendedBit: '1/4" masonry bit (6 mm)', typical: 'Heavy towel tubes / small cabinets' },
  { plug: 'Tox #8 (Blue)', recommendedBit: '5/16" masonry bit (8 mm)', typical: 'Medium TV brackets / heavy mirrors' },
  { plug: 'Tox #10 (Green)', recommendedBit: '3/8" masonry bit (10 mm)', typical: 'Wall consoles / split AC frames' }
];

interface UnitInfo {
  name: string;
  symbol: string;
  factor: number;
}

const MEASUREMENTS: Record<'length' | 'weight' | 'volume' | 'area', { label: string; icon: any; units: UnitInfo[] }> = {
  length: {
    label: 'Length',
    icon: Ruler,
    units: [
      { name: 'Millimeters', symbol: 'mm', factor: 0.001 },
      { name: 'Centimeters', symbol: 'cm', factor: 0.01 },
      { name: 'Meters', symbol: 'm', factor: 1.0 },
      { name: 'Kilometers', symbol: 'km', factor: 1000.0 },
      { name: 'Inches', symbol: 'in', factor: 0.0254 },
      { name: 'Feet', symbol: 'ft', factor: 0.3048 },
      { name: 'Yards', symbol: 'yd', factor: 0.9144 },
      { name: 'Miles', symbol: 'mi', factor: 1609.344 },
    ],
  },
  weight: {
    label: 'Weight & Mass',
    icon: Scale,
    units: [
      { name: 'Milligrams', symbol: 'mg', factor: 0.001 },
      { name: 'Grams', symbol: 'g', factor: 1.0 },
      { name: 'Kilograms', symbol: 'kg', factor: 1000.0 },
      { name: 'Pounds', symbol: 'lb', factor: 453.59237 },
      { name: 'Ounces', symbol: 'oz', factor: 28.34952 },
    ],
  },
  volume: {
    label: 'Volume',
    icon: RefreshCw,
    units: [
      { name: 'Milliliters', symbol: 'mL', factor: 0.001 },
      { name: 'Liters', symbol: 'L', factor: 1.0 },
      { name: 'Cups (US)', symbol: 'cup', factor: 0.236588 },
      { name: 'Pints (US)', symbol: 'pt', factor: 0.473176 },
      { name: 'Quarts (US)', symbol: 'qt', factor: 0.946353 },
      { name: 'Gallons (US)', symbol: 'gal', factor: 3.78541 },
      { name: 'Cubic Meters', symbol: 'm³', factor: 1000.0 },
    ],
  },
  area: {
    label: 'Area',
    icon: Layers,
    units: [
      { name: 'Square Centimeters', symbol: 'cm²', factor: 0.0001 },
      { name: 'Square Meters', symbol: 'm²', factor: 1.0 },
      { name: 'Square Feet', symbol: 'ft²', factor: 0.092903 },
      { name: 'Square Yards', symbol: 'yd²', factor: 0.836127 },
      { name: 'Acres', symbol: 'ac', factor: 4046.8564 },
      { name: 'Hectares', symbol: 'ha', factor: 10000.0 },
      { name: 'Square Kilometers', symbol: 'km²', factor: 1000000.0 },
    ],
  },
};

// Bolt / Drill standard fractions alignment data
interface DrillBitMapping {
  fraction: string;
  decimalInches: number;
  mm: number;
  note?: string;
}

const DRILL_BIT_DATA: DrillBitMapping[] = [
  { fraction: '1/16"', decimalInches: 0.0625, mm: 1.59 },
  { fraction: '5/64"', decimalInches: 0.0781, mm: 1.98 },
  { fraction: '3/32"', decimalInches: 0.0938, mm: 2.38 },
  { fraction: '7/64"', decimalInches: 0.1094, mm: 2.78 },
  { fraction: '1/8"', decimalInches: 0.1250, mm: 3.18, note: 'Common small size' },
  { fraction: '9/64"', decimalInches: 0.1406, mm: 3.57 },
  { fraction: '5/32"', decimalInches: 0.1563, mm: 3.97, note: 'Practically 4mm' },
  { fraction: '11/64"', decimalInches: 0.1719, mm: 4.37 },
  { fraction: '3/16"', decimalInches: 0.1875, mm: 4.76, note: 'Popular drill bit size' },
  { fraction: '13/64"', decimalInches: 0.2031, mm: 5.16 },
  { fraction: '7/32"', decimalInches: 0.2188, mm: 5.56 },
  { fraction: '15/64"', decimalInches: 0.2344, mm: 5.95, note: 'Close to 6mm' },
  { fraction: '1/4"', decimalInches: 0.2500, mm: 6.35, note: 'Standard anchor size' },
  { fraction: '17/64"', decimalInches: 0.2656, mm: 6.75 },
  { fraction: '9/32"', decimalInches: 0.2813, mm: 7.14 },
  { fraction: '19/64"', decimalInches: 0.2969, mm: 7.54 },
  { fraction: '5/16"', decimalInches: 0.3125, mm: 7.94, note: 'Practically 8mm' },
  { fraction: '21/64"', decimalInches: 0.3281, mm: 8.33 },
  { fraction: '11/32"', decimalInches: 0.3438, mm: 8.73 },
  { fraction: '23/64"', decimalInches: 0.3594, mm: 9.13 },
  { fraction: '3/8"', decimalInches: 0.3750, mm: 9.53, note: 'Common structural size' },
  { fraction: '25/64"', decimalInches: 0.3906, mm: 9.92 },
  { fraction: '13/32"', decimalInches: 0.4063, mm: 10.32 },
  { fraction: '27/64"', decimalInches: 0.4219, mm: 10.72 },
  { fraction: '7/16"', decimalInches: 0.4375, mm: 11.11 },
  { fraction: '29/64"', decimalInches: 0.4531, mm: 11.51 },
  { fraction: '15/32"', decimalInches: 0.4688, mm: 11.91, note: 'Practically 12mm' },
  { fraction: '1/2"', decimalInches: 0.5000, mm: 12.70, note: 'Heavy duty standard' },
  { fraction: '17/32"', decimalInches: 0.5313, mm: 13.49 },
  { fraction: '9/16"', decimalInches: 0.5625, mm: 14.29 },
  { fraction: '19/32"', decimalInches: 0.5938, mm: 15.08 },
  { fraction: '5/8"', decimalInches: 0.6250, mm: 15.88, note: 'Common 16mm alternative' },
  { fraction: '11/16"', decimalInches: 0.6875, mm: 17.46 },
  { fraction: '3/4"', decimalInches: 0.7500, mm: 19.05, note: 'Large hardware structural' },
  { fraction: '13/16"', decimalInches: 0.8125, mm: 20.64 },
  { fraction: '7/8"', decimalInches: 0.8750, mm: 22.23 },
  { fraction: '15/16"', decimalInches: 0.9375, mm: 23.81 },
  { fraction: '1"', decimalInches: 1.0000, mm: 25.40, note: '1 inch standard size' }
];

// PVC pipe dimension alignment (Metric ISO vs Imperial standard nominal equivalents in the Philippines)
interface PvcPipeField {
  inches: string;
  metricMm: string;
  internalDiameterApprox: string;
  typicalUse: string;
}

const PVC_PIPE_DATA: PvcPipeField[] = [
  { inches: '1/2"', metricMm: '20 mm', internalDiameterApprox: '15.0 mm', typicalUse: 'Residential water taps & inside lines' },
  { inches: '3/4"', metricMm: '25 mm', internalDiameterApprox: '20.0 mm', typicalUse: 'Main residential branch connections' },
  { inches: '1"', metricMm: '32 mm', internalDiameterApprox: '25.0 mm', typicalUse: 'Primary water manifold & high flow' },
  { inches: '1-1/4"', metricMm: '40 mm', internalDiameterApprox: '32.0 mm', typicalUse: 'Pump discharge / minor sink wastes' },
  { inches: '1-1/2"', metricMm: '50 mm', internalDiameterApprox: '40.0 mm', typicalUse: 'Kitchen sink wash basins & pool plumbing' },
  { inches: '2"', metricMm: '63 mm', internalDiameterApprox: '50.0 mm', typicalUse: 'Major building toilets / vent pipes' },
  { inches: '2-1/2"', metricMm: '75 mm', internalDiameterApprox: '65.0 mm', typicalUse: 'General storm water drainage pipelines' },
  { inches: '3"', metricMm: '90 mm', internalDiameterApprox: '80.0 mm', typicalUse: 'Main sewage ventilation & soil stacks' },
  { inches: '4"', metricMm: '110 mm', internalDiameterApprox: '100.0 mm', typicalUse: 'Underground building main sewer outlet' },
  { inches: '6"', metricMm: '160 mm', internalDiameterApprox: '150.0 mm', typicalUse: 'Civil/Municipal wastewater discharge' },
  { inches: '8"', metricMm: '200 mm', internalDiameterApprox: '200.0 mm', typicalUse: 'Industrial drainage & high-capacity systems' }
];

export interface WireSizingField {
  awg: string;
  metricMm2: string;
  solidDiameter: string;
  strandedDiameter: string;
  ampacity: string;
  breakerRating: string;
  conduitPairing: string;
  solidStrandedNote: string;
  idealUse: string;
}

export const WIRE_SIZE_DATA: WireSizingField[] = [
  {
    awg: '#18 AWG',
    metricMm2: '0.75 mm²',
    solidDiameter: '1.02 mm (often single solid)',
    strandedDiameter: '1.16 mm',
    ampacity: '7 A (Flatcord/Audio)',
    breakerRating: 'Appliance cord (typically uses max 10A fuse or outlet protection)',
    conduitPairing: 'Not permitted for permanent branch grid lines under Philippine Electrical Code (PEC)',
    solidStrandedNote: 'Extremely popular as "Duplex Flat Cord", drop lights, LED setups, and standard low-current extension strips.',
    idealUse: 'Low-powered home theater speaker wiring, table lamps, standby holiday light strings, electronic intercom buzzers, and minor decorative fixtures.'
  },
  {
    awg: '#16 AWG',
    metricMm2: '1.25 mm²',
    solidDiameter: '1.29 mm (common as twin solid)',
    strandedDiameter: '1.45 mm',
    ampacity: '10 A (Flatcord/Audio)',
    breakerRating: 'Not rated for heavy fixed wall branch circuits (use standard protected outlet plugs)',
    conduitPairing: 'Limited to temporary extension networks. Not allowed inside main structural conduits.',
    solidStrandedNote: 'Excellent for high-durability white/gray insulation flatcords and pro-audio speaker cable reels.',
    idealUse: 'Heavy-duty household extension cables, ceiling pedestal fans, high-fidelity cabinet speakers, decorative garden drop-lights, and DIY electrical tools.'
  },
  {
    awg: '#14 AWG',
    metricMm2: '2.0 mm²',
    solidDiameter: '1.63 mm',
    strandedDiameter: '1.85 mm',
    ampacity: '15 A',
    breakerRating: '15 Ampere',
    conduitPairing: 'Up to 6 wires in 1/2" PVC conduit; up to 10 in 3/4"',
    solidStrandedNote: 'Stranded is highly preferred for lighting switches/loops to pull through conduit bends easily.',
    idealUse: 'Lighting branch circuits, dynamic ceiling fixture loops, light switches, intercom system cables, and doorbell circuits.'
  },
  {
    awg: '#12 AWG',
    metricMm2: '3.5 mm²',
    solidDiameter: '2.05 mm',
    strandedDiameter: '2.32 mm',
    ampacity: '20 A',
    breakerRating: '20 Ampere',
    conduitPairing: 'Up to 4 wires in 1/2" PVC conduit; up to 8 in 3/4"',
    solidStrandedNote: 'Stranded is standard for power outlets. Solid causes extreme friction during long conduit runs.',
    idealUse: 'Standard household wall convenience power outlets (plugs), refrigerator sockets, kitchen counter outlets, small room ACs (under 1.0 HP).'
  },
  {
    awg: '#10 AWG',
    metricMm2: '5.5 mm²',
    solidDiameter: '2.59 mm',
    strandedDiameter: '2.95 mm',
    ampacity: '30 A',
    breakerRating: '30 Ampere',
    conduitPairing: 'Up to 3 wires in 1/2" PVC conduit; up to 5 in 3/4"',
    solidStrandedNote: 'Solid is extremely stiff at this size. Stranded is strictly recommended for conduit wiring.',
    idealUse: 'Medium to large single-room Air Conditioners (1.5 HP to 2.5 HP), bathroom storage water showers, centralized water pumps, microwave oven sockets.'
  },
  {
    awg: '#8 AWG',
    metricMm2: '8.0 mm²',
    solidDiameter: '3.26 mm (rare)',
    strandedDiameter: '3.70 mm',
    ampacity: '40 A (up to 55A for short run)',
    breakerRating: '40 Ampere or 50 Ampere',
    conduitPairing: 'Min 3/4" pipe required for standard 3-wire runs; up to 4 wires in 1" pipe',
    solidStrandedNote: 'Solid wire is rarely sold at #8 size due to extreme rigidity. Stranded is standard.',
    idealUse: 'Multi-point centralized water heaters, dual-burner induction cooktops, medium electric ovens, or sub-feeder links to secondary branch boards.'
  },
  {
    awg: '#6 AWG',
    metricMm2: '14.0 mm²',
    solidDiameter: '4.11 mm (rare)',
    strandedDiameter: '4.67 mm',
    ampacity: '55 A (up to 75A for short run)',
    breakerRating: '50 Ampere or 60 Ampere',
    conduitPairing: 'Min 3/4" PVC pipe for 2-wire setups; 1" PVC conduit for standard 3-wire feeders',
    solidStrandedNote: 'Exclusively sold and installed as Stranded wire for main panel board routing.',
    idealUse: 'Service entrance line for modest homes, primary feeder cables from main utility meter to breaker panel, heavy range cookers, central laundry systems.'
  },
  {
    awg: '#4 AWG',
    metricMm2: '22.0 mm²',
    solidDiameter: 'N/A (Stranded only)',
    strandedDiameter: '5.89 mm',
    ampacity: '70 A (up to 95A for short run)',
    breakerRating: '70 Ampere or 80 Ampere',
    conduitPairing: 'Minimum 1" PVC conduit required for standard residential 3-wire feeders',
    solidStrandedNote: 'Offered only in stranded copper format to permit safe routing around panel gutters.',
    idealUse: 'Main feeder lines for larger standard residential systems, service drop lines, high-demand industrial machinery supply.'
  },
  {
    awg: '#2 AWG',
    metricMm2: '30.0 mm²',
    solidDiameter: 'N/A',
    strandedDiameter: '7.42 mm',
    ampacity: '95 A (up to 115A for short run)',
    breakerRating: '90 Ampere or 100 Ampere',
    conduitPairing: 'Minimum 1-1/4" PVC conduit recommended for standard 3-wire feeders',
    solidStrandedNote: 'Extremely heavy-gauge stranded conductor requiring professional cable pulling grease.',
    idealUse: 'Service entrance feeders for large estates, multi-family apartment main feeds, commercial panel sub-station inputs.'
  }
];

// Interactive Screw vs Wrench Size Mapping Data
export interface ScrewWrenchField {
  screw: string;
  type: 'Metric (M-Thread)' | 'Imperial (Fractional)';
  openWrench: string; // Open / combination wrench size target
  allenKey: string;   // Allen Key / drive size target
  threadDiaMm: string; // Nominal diameter in mm
  typicalHexHead?: string; // Standard head type and typical bolt usage
}

export const SCREW_WRENCH_DATA: ScrewWrenchField[] = [
  // Metric (M-Thread) Sizing
  { screw: 'M3 Screw / Bolt', type: 'Metric (M-Thread)', openWrench: '5.5 mm', allenKey: '2.5 mm', threadDiaMm: '3.0 mm', typicalHexHead: 'Small electronic modules, hinges' },
  { screw: 'M4 Screw / Bolt', type: 'Metric (M-Thread)', openWrench: '7 mm', allenKey: '3 mm', threadDiaMm: '4.0 mm', typicalHexHead: 'Cabinet pulls, furniture accessories' },
  { screw: 'M5 Screw / Bolt', type: 'Metric (M-Thread)', openWrench: '8 mm', allenKey: '4 mm', threadDiaMm: '5.0 mm', typicalHexHead: 'Motorcycle fairings, appliance panels' },
  { screw: 'M6 Screw / Bolt', type: 'Metric (M-Thread)', openWrench: '10 mm', allenKey: '5 mm', threadDiaMm: '6.0 mm', typicalHexHead: 'Automotive frames, steel purlin brackets' },
  { screw: 'M8 Screw / Bolt', type: 'Metric (M-Thread)', openWrench: '13 mm (or 12 mm JIS)', allenKey: '6 mm', threadDiaMm: '8.0 mm', typicalHexHead: 'Gate pivots, concrete anchor sleeves' },
  { screw: 'M10 Screw / Bolt', type: 'Metric (M-Thread)', openWrench: '17 mm (or 14 mm JIS)', allenKey: '8 mm', threadDiaMm: '10.0 mm', typicalHexHead: 'Heavy scaffolding, engine mounts' },
  { screw: 'M12 Screw / Bolt', type: 'Metric (M-Thread)', openWrench: '19 mm (or 17 mm JIS)', allenKey: '10 mm', threadDiaMm: '12.0 mm', typicalHexHead: 'Structural steel columns, truss plates' },
  { screw: 'M14 Screw / Bolt', type: 'Metric (M-Thread)', openWrench: '22 mm (or 19 mm JIS)', allenKey: '12 mm', threadDiaMm: '14.0 mm', typicalHexHead: 'Trailer hitches, heavy industrial chassis' },
  { screw: 'M16 Screw / Bolt', type: 'Metric (M-Thread)', openWrench: '24 mm', allenKey: '14 mm', threadDiaMm: '16.0 mm', typicalHexHead: 'Bridges, structural steel joinery' },

  // Imperial (Fractional) Sizing
  { screw: '#10 Sheet Metal Screw', type: 'Imperial (Fractional)', openWrench: '5/16" (or 8mm) Hex Driver', allenKey: 'N/A (Phillips)', threadDiaMm: '4.8 mm', typicalHexHead: 'Metal studs, light gauge iron roofs' },
  { screw: '1/4" Hex Bolt (20tpi)', type: 'Imperial (Fractional)', openWrench: '7/16" Wrench', allenKey: '3/16"', threadDiaMm: '6.35 mm', typicalHexHead: 'Standard flange wood screws, DIY furniture' },
  { screw: '5/16" Hex Bolt (18tpi)', type: 'Imperial (Fractional)', openWrench: '1/2" Wrench', allenKey: '1/4"', threadDiaMm: '7.94 mm', typicalHexHead: 'Auto steering units, pipe braces' },
  { screw: '3/8" Hex Bolt (16tpi)', type: 'Imperial (Fractional)', openWrench: '9/16" Wrench', allenKey: '5/16"', threadDiaMm: '9.53 mm', typicalHexHead: 'Heavy machine assembly, concrete drop-ins' },
  { screw: '7/16" Hex Bolt (14tpi)', type: 'Imperial (Fractional)', openWrench: '5/8" Wrench', allenKey: '3/8"', threadDiaMm: '11.11 mm', typicalHexHead: 'Heavy construction, high-tensile fasteners' },
  { screw: '1/2" Hex Bolt (13tpi)', type: 'Imperial (Fractional)', openWrench: '3/4" Wrench', allenKey: '3/8"', threadDiaMm: '12.7 mm', typicalHexHead: 'Utility electrical poles, flange couplings' },
  { screw: '5/8" Hex Bolt (11tpi)', type: 'Imperial (Fractional)', openWrench: '15/16" Wrench', allenKey: '1/2"', threadDiaMm: '15.88 mm', typicalHexHead: 'Overhead cranes, high-capacity base bolts' },
  { screw: '3/4" Hex Bolt (10tpi)', type: 'Imperial (Fractional)', openWrench: '1-1/8" Wrench', allenKey: '5/8"', threadDiaMm: '19.05 mm', typicalHexHead: 'Bridge trusses, heavy maritime fittings' }
];

// Screw Length Trade Sizing Data (Philippine local trade definitions)
export interface ScrewLengthField {
  inches: string;
  decimalInches: number;
  exactMm: string;
  tradeMm: string; // Nearest trade sizing, e.g. 2 1/4" = 55mm, 1" = 25mm, etc.
  commonApp: string;
}

export const SCREW_LENGTH_DATA: ScrewLengthField[] = [
  { inches: '1/2"', decimalInches: 0.5, exactMm: '12.7 mm', tradeMm: '12 mm (or 13 mm)', commonApp: 'Drawer brackets / slim plywood joinery' },
  { inches: '5/8"', decimalInches: 0.625, exactMm: '15.88 mm', tradeMm: '16 mm', commonApp: 'Hinges, cabinet trim attachments' },
  { inches: '3/4"', decimalInches: 0.75, exactMm: '19.05 mm', tradeMm: '20 mm', commonApp: 'Wall clips, switches, electrical boxes' },
  { inches: '1" (Standard)', decimalInches: 1.0, exactMm: '25.40 mm', tradeMm: '25 mm', commonApp: 'Drywall boarding, gypsum to face frames' },
  { inches: '1-1/4"', decimalInches: 1.25, exactMm: '31.75 mm', tradeMm: '32 mm', commonApp: 'Single-layer gypsum wall systems' },
  { inches: '1-1/2"', decimalInches: 1.5, exactMm: '38.10 mm', tradeMm: '38 mm or 40 mm', commonApp: 'Wood frameworks & metal furring joints' },
  { inches: '2"', decimalInches: 2.0, exactMm: '50.80 mm', tradeMm: '50 mm', commonApp: 'Double standard lumber joins, wall frames' },
  { inches: '2-1/4"', decimalInches: 2.25, exactMm: '57.15 mm', tradeMm: '55 mm', commonApp: 'Drywall/metal partition screws (PH custom)' },
  { inches: '2-1/2"', decimalInches: 2.5, exactMm: '63.50 mm', tradeMm: '63 mm or 65 mm', commonApp: 'Wood studs to floor plates & load pillars' },
  { inches: '3"', decimalInches: 3.0, exactMm: '76.20 mm', tradeMm: '75 mm', commonApp: 'Heavy scaffolding, joist connections' },
  { inches: '3-1/2"', decimalInches: 3.5, exactMm: '88.90 mm', tradeMm: '90 mm', commonApp: 'Roofing trusses & construction scaffolding' },
  { inches: '4"', decimalInches: 4.0, exactMm: '101.60 mm', tradeMm: '100 mm', commonApp: 'Extra thick joist links & load poles' }
];

export default function MetricConverter({ layoutMode = 'scroll', onAddHistory }: { layoutMode?: 'scroll' | 'fit' } & SharedHistoryProps) {
  const [currentType, setCurrentType] = useState<ConversionType>('length');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showAllEquivalents, setShowAllEquivalents] = useState<boolean>(false);

  const handleCopy = (text: string, key: string, customFormula?: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);

    const titleMap: Record<ConversionType, string> = {
      length: 'Length Conversion',
      weight: 'Weight Conversion',
      volume: 'Volume Conversion',
      area: 'Area Conversion',
      bolt_drill: 'Bolt & Drill Sizing',
      pvc_pipes: 'PVC Pipe Reference',
      wire_sizes: 'Wire Sizing Reference'
    };

    onAddHistory?.(
      'CONVERSION',
      titleMap[currentType] || 'Metric Converter',
      customFormula || `Measurement / Lookup row: ${key}`,
      `Copied result: ${text}`
    );

    setTimeout(() => {
      setCopiedKey(null);
    }, 1500);
  };
  
  // Standard metric values
  const [inputValue, setInputValue] = useState<string>('1');
  const [sourceUnit, setSourceUnit] = useState<string>('');
  const [targetUnit, setTargetUnit] = useState<string>('');
  const [specificResult, setSpecificResult] = useState<string>('0');

  // Bolt/Drill state
  const [boltSubTab, setBoltSubTab] = useState<'drill_match' | 'screw_wrench' | 'screw_lengths'>('drill_match');
  const [drillInput, setDrillInput] = useState<string>('12'); // target 12mm example
  const [drillInputType, setDrillInputType] = useState<'mm' | 'fraction'>('mm');
  const [drillSearchQuery, setDrillSearchQuery] = useState<string>('');
  const [selectedScrewIndex, setSelectedScrewIndex] = useState<number>(3); // Default to M6 or so
  const [selectedLengthIndex, setSelectedLengthIndex] = useState<number>(7); // Default to 2-1/4" (55mm)
  const [screwSearchFilter, setScrewSearchFilter] = useState<string>('');
  const [lengthSearchFilter, setLengthSearchFilter] = useState<string>('');
  const [showDrillChart, setShowDrillChart] = useState<boolean>(false);
  const [showWrenchChart, setShowWrenchChart] = useState<boolean>(false);
  const [showWireDetails, setShowWireDetails] = useState<boolean>(false);

  // PVC pipe state
  const [selectedPvcIndex, setSelectedPvcIndex] = useState<number>(0);

  // Wire size state
  const [selectedWireIndex, setSelectedWireIndex] = useState<number>(3); // Default to #12 AWG (now index 3 with #18/#16 added)
  const [selectedWireDictTab, setSelectedWireDictTab] = useState<string>('all');

  // Sync default units when standard metric category changes
  useEffect(() => {
    if (currentType !== 'bolt_drill' && currentType !== 'pvc_pipes' && currentType !== 'wire_sizes') {
      const list = MEASUREMENTS[currentType as keyof typeof MEASUREMENTS].units;
      setSourceUnit(list[2]?.symbol || list[0].symbol); 
      setTargetUnit(list[4]?.symbol || list[1].symbol); 
    }
  }, [currentType]);

  // Handle calculation for standard physical units
  useEffect(() => {
    if (currentType === 'bolt_drill' || currentType === 'pvc_pipes' || currentType === 'wire_sizes') return;
    
    const val = parseFloat(inputValue);
    const units = MEASUREMENTS[currentType as keyof typeof MEASUREMENTS].units;
    if (!isNaN(val)) {
      const src = units.find((u) => u.symbol === sourceUnit);
      const tgt = units.find((u) => u.symbol === targetUnit);
      if (src && tgt) {
        const valueInBase = val * src.factor;
        const valueInTarget = valueInBase / tgt.factor;
        
        if (valueInTarget === 0) {
          setSpecificResult('0');
        } else if (Math.abs(valueInTarget) < 0.0001) {
          setSpecificResult(valueInTarget.toExponential(4));
        } else {
          setSpecificResult(
            valueInTarget.toLocaleString('en-PH', {
              minimumFractionDigits: 0,
              maximumFractionDigits: 6,
            })
          );
        }
      }
    } else {
      setSpecificResult('0');
    }
  }, [inputValue, sourceUnit, targetUnit, currentType]);

  const handleTypeChange = (type: ConversionType) => {
    setCurrentType(type);
  };

  const getFullListConversions = () => {
    if (currentType === 'bolt_drill' || currentType === 'pvc_pipes' || currentType === 'wire_sizes') return [];
    
    const val = parseFloat(inputValue);
    if (isNaN(val)) return [];
    const units = MEASUREMENTS[currentType as keyof typeof MEASUREMENTS].units;
    const src = units.find((u) => u.symbol === sourceUnit);
    if (!src) return [];

    const valueInBase = val * src.factor;

    return units.map((u) => {
      const resultVal = valueInBase / u.factor;
      let displayRes = '';
      if (resultVal === 0) {
        displayRes = '0';
      } else if (Math.abs(resultVal) < 0.001) {
        displayRes = resultVal.toExponential(3);
      } else {
        displayRes = resultVal.toLocaleString('en-PH', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 4,
        });
      }
      return {
        ...u,
        value: displayRes,
      };
    });
  };

  // Safe helper to find closest matched drill bit size
  const getClosestDrillBits = () => {
    const parsedVal = parseFloat(drillInput);
    if (isNaN(parsedVal) || parsedVal <= 0) return [];

    if (drillInputType === 'mm') {
      // Find drill bits sorted by how close they are to inputted millimeters
      return [...DRILL_BIT_DATA]
        .map(b => ({
          ...b,
          diff: Math.abs(b.mm - parsedVal)
        }))
        .sort((a, b) => a.diff - b.diff)
        .slice(0, 3);
    } else {
      // Input is treated as decimal inches (e.g. 0.5)
      return [...DRILL_BIT_DATA]
        .map(b => ({
          ...b,
          diff: Math.abs(b.decimalInches - parsedVal)
        }))
        .sort((a, b) => a.diff - b.diff)
        .slice(0, 3);
    }
  };

  // Filtered list of drill bits by search query (e.g. "1/2" or "12")
  const filteredDrillBits = DRILL_BIT_DATA.filter(b => {
    const q = drillSearchQuery.toLowerCase();
    if (!q) return true;
    return (
      b.fraction.toLowerCase().includes(q) ||
      b.mm.toString().includes(q) ||
      (b.note && b.note.toLowerCase().includes(q))
    );
  });

  return (
    <div className="bg-white dark:bg-stone-900 p-4 xs:p-6 rounded-3xl shadow-lg border border-gray-250/90 dark:border-stone-800">
      
      {/* Category selector */}
      <div className="grid grid-cols-4 gap-1 mb-5 select-none bg-yellow-50/40 dark:bg-stone-850 p-1 rounded-xl border border-yellow-101/40 dark:border-stone-800/60">
        {/* Tab 1: Unit Converter */}
        <button
          onClick={() => {
            if (currentType === 'bolt_drill' || currentType === 'pvc_pipes' || currentType === 'wire_sizes') {
              setCurrentType('length');
            }
          }}
          className={`flex flex-col sm:flex-row items-center justify-center gap-1 font-extrabold transition-all outline-none text-center ${
            layoutMode === 'scroll'
              ? 'py-3.5 px-2 rounded-xl text-xs sm:text-xs md:text-sm font-black'
              : 'py-2 rounded-lg text-[9px] xs:text-[10px]'
          } ${
            currentType !== 'bolt_drill' && currentType !== 'pvc_pipes' && currentType !== 'wire_sizes'
              ? 'bg-yellow-400 text-white dark:bg-yellow-405 dark:text-stone-900 shadow-sm'
              : 'bg-white dark:bg-stone-900 hover:bg-yellow-50 dark:hover:bg-stone-800/60 text-yellow-905 dark:text-stone-300 border border-yellow-101/40 dark:border-stone-800/60'
          }`}
        >
          <RefreshCw size={layoutMode === 'scroll' ? 14 : 11} />
          <span>Units</span>
        </button>

        {/* Tab 2: Bolts & Nuts */}
        <button
          onClick={() => setCurrentType('bolt_drill')}
          className={`flex flex-col sm:flex-row items-center justify-center gap-1 font-extrabold transition-all outline-none text-center ${
            layoutMode === 'scroll'
              ? 'py-3.5 px-2 rounded-xl text-xs sm:text-xs md:text-sm font-black'
              : 'py-2 rounded-lg text-[9px] xs:text-[10px]'
          } ${
            currentType === 'bolt_drill'
              ? 'bg-yellow-400 text-white dark:bg-yellow-405 dark:text-stone-900 shadow-sm'
              : 'bg-white dark:bg-stone-900 hover:bg-yellow-50 dark:hover:bg-stone-800/60 text-yellow-905 dark:text-stone-300 border border-yellow-101/40 dark:border-stone-800/60'
          }`}
        >
          <Wrench size={layoutMode === 'scroll' ? 14 : 11} />
          <span>Bolt & Nuts</span>
        </button>

        {/* Tab 3: PVC Pipes */}
        <button
          onClick={() => setCurrentType('pvc_pipes')}
          className={`flex flex-col sm:flex-row items-center justify-center gap-1 font-extrabold transition-all outline-none text-center ${
            layoutMode === 'scroll'
              ? 'py-3.5 px-2 rounded-xl text-xs sm:text-xs md:text-sm font-black'
              : 'py-2 rounded-lg text-[9px] xs:text-[10px]'
          } ${
            currentType === 'pvc_pipes'
              ? 'bg-yellow-400 text-white dark:bg-yellow-405 dark:text-stone-900 shadow-sm'
              : 'bg-white dark:bg-stone-900 hover:bg-yellow-50 dark:hover:bg-stone-850/50 text-yellow-905 dark:text-stone-300 border border-yellow-101/40 dark:border-stone-800/60'
          }`}
        >
          <CircleDot size={layoutMode === 'scroll' ? 14 : 11} />
          <span>PVC Pipes</span>
        </button>

        {/* Tab 4: Wire Sizes */}
        <button
          onClick={() => setCurrentType('wire_sizes')}
          className={`flex flex-col sm:flex-row items-center justify-center gap-1 font-extrabold transition-all outline-none text-center ${
            layoutMode === 'scroll'
              ? 'py-3.5 px-2 rounded-xl text-xs sm:text-xs md:text-sm font-black'
              : 'py-2 rounded-lg text-[9px] xs:text-[10px]'
          } ${
            currentType === 'wire_sizes'
              ? 'bg-yellow-400 text-white dark:bg-yellow-405 dark:text-stone-900 shadow-sm'
              : 'bg-white dark:bg-stone-900 hover:bg-yellow-50 dark:hover:bg-stone-850/50 text-yellow-905 dark:text-stone-300 border border-yellow-101/40 dark:border-stone-800/60'
          }`}
        >
          <Zap size={layoutMode === 'scroll' ? 14 : 11} />
          <span>Wire Sizes</span>
        </button>
      </div>

      {/* Subcategory sub-level selector for Standard Units */}
      {currentType !== 'bolt_drill' && currentType !== 'pvc_pipes' && currentType !== 'wire_sizes' && (
        <div className="grid grid-cols-4 gap-1 mb-5 p-0.5 bg-gray-50 dark:bg-stone-850 rounded-xl border border-gray-150/50 dark:border-stone-800">
          {(Object.keys(MEASUREMENTS) as Array<keyof typeof MEASUREMENTS>).map((type) => {
            const item = MEASUREMENTS[type];
            const IconComponent = item.icon;
            const isActive = currentType === type;
            return (
              <button
                key={type}
                onClick={() => handleTypeChange(type)}
                className={`flex flex-col xs:flex-row items-center justify-center gap-1 px-1 font-black transition-all outline-none text-center ${
                  layoutMode === 'scroll'
                    ? 'py-2.5 rounded-xl text-xs sm:text-sm'
                    : 'py-1.5 rounded-lg text-[9px] xs:text-[10px]'
                } ${
                  isActive
                    ? 'bg-white dark:bg-stone-900 text-yellow-905 dark:text-yellow-405 shadow-xs border border-yellow-250/60 dark:border-yellow-405/40'
                    : 'text-gray-400 dark:text-stone-400 hover:text-gray-600 dark:hover:text-stone-200'
                }`}
              >
                <IconComponent size={layoutMode === 'scroll' ? 14 : 12} className={isActive ? 'text-yellow-600 dark:text-yellow-550' : ''} />
                <span>{item.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* RENDER LOGIC BY SELECTION */}

      {/* --- RENDER 1: STANDARD METRIC CONVERSIONS --- */}
      {currentType !== 'bolt_drill' && currentType !== 'pvc_pipes' && currentType !== 'wire_sizes' && (
        <div className="space-y-6">
          {/* Input Panel */}
          <div className="space-y-4">
            <div>
              <label className={`block font-bold text-gray-400 dark:text-stone-450 uppercase tracking-widest mb-1.5 px-1 ${
                layoutMode === 'scroll' ? 'text-xs' : 'text-[10px]'
              }`}>
                Source Value
              </label>
              <div className="flex gap-1.5 sm:gap-2">
                <input
                  type="number"
                  inputMode="decimal"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Enter value"
                  className={`flex-1 min-w-0 bg-yellow-50 dark:bg-stone-850/50 text-gray-850 dark:text-stone-100 border-2 border-transparent focus:border-yellow-400 dark:focus:border-yellow-405 focus:bg-white dark:focus:bg-stone-800 rounded-xl transition-all outline-none font-black ${
                    layoutMode === 'scroll'
                      ? 'p-3.5 text-lg sm:text-xl'
                      : 'p-2.5 text-base font-bold'
                  }`}
                />
                <select
                  value={sourceUnit}
                  onChange={(e) => setSourceUnit(e.target.value)}
                  className={`shrink-0 bg-gray-50 dark:bg-stone-850 text-gray-850 dark:text-stone-200 border-2 border-transparent focus:border-yellow-400 dark:focus:border-yellow-405 focus:bg-white dark:focus:bg-stone-800 rounded-xl font-black transition-all outline-none truncate cursor-pointer ${
                    layoutMode === 'scroll'
                      ? 'w-28 xs:w-[120px] sm:w-36 p-3.5 text-sm'
                      : 'w-24 xs:w-[110px] sm:w-32 p-2 px-2.5 text-xs'
                  }`}
                >
                  {MEASUREMENTS[currentType as keyof typeof MEASUREMENTS].units.map((u) => (
                    <option key={u.symbol} value={u.symbol} className="text-gray-700 dark:text-stone-300 dark:bg-stone-850 font-medium">
                      {u.symbol} ({u.name})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={`block font-bold text-gray-400 dark:text-stone-450 uppercase tracking-widest mb-1.5 px-1 ${
                layoutMode === 'scroll' ? 'text-xs' : 'text-[10px]'
              }`}>
                Target Unit
              </label>
              <select
                value={targetUnit}
                onChange={(e) => setTargetUnit(e.target.value)}
                className={`w-full bg-gray-50 dark:bg-stone-850 text-gray-850 dark:text-stone-200 border-2 border-transparent focus:border-yellow-400 dark:focus:border-yellow-405 focus:bg-white dark:focus:bg-stone-800 rounded-xl font-semibold transition-all outline-none cursor-pointer ${
                  layoutMode === 'scroll'
                    ? 'p-3.5 text-sm font-black'
                    : 'p-2.5 text-xs'
                }`}
              >
                {MEASUREMENTS[currentType as keyof typeof MEASUREMENTS].units.map((u) => (
                  <option key={u.symbol} value={u.symbol} className="dark:bg-stone-850 dark:text-stone-200">
                    {u.name} ({u.symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Primary Result Card */}
          <div className={`bg-yellow-400 dark:bg-yellow-405 rounded-3xl text-center shadow-lg relative group overflow-hidden ${
            layoutMode === 'scroll'
              ? 'p-6.5 shadow-yellow-250 dark:shadow-[0_0_24px_rgba(250,204,21,0.35)]'
              : 'p-4 rounded-2xl shadow-yellow-200 dark:shadow-[0_0_15px_rgba(250,204,21,0.15)]'
          }`}>
            <p className={`font-black text-yellow-905 dark:text-stone-900 uppercase tracking-[0.2em] mb-1 ${
              layoutMode === 'scroll' ? 'text-xs mb-1.5' : 'text-[10px]'
            }`}>
              Converted Value
            </p>
            <div className="flex flex-col items-center gap-1.5">
              <p className={`font-black text-white dark:text-stone-900 tracking-tight break-all ${
                layoutMode === 'scroll' ? 'text-4xl xs:text-5xl' : 'text-3xl'
              }`}>
                {specificResult} <span className={`font-bold opacity-80 ${
                  layoutMode === 'scroll' ? 'text-2xl' : 'text-xl'
                }`}>{targetUnit}</span>
              </p>
              {specificResult !== '0' && (
                <button
                  onClick={() => handleCopy(specificResult, 'conv')}
                  className={`rounded-xl bg-white/20 dark:bg-stone-900/10 hover:bg-white/30 dark:hover:bg-stone-900/20 text-white dark:text-stone-900 font-bold uppercase flex items-center gap-1 transition-all active:scale-95 ${
                    layoutMode === 'scroll' ? 'p-1.5 px-3.5 text-xs' : 'p-1 px-2.5 text-[10px]'
                  }`}
                  title="Copy converted value"
                >
                  {copiedKey === 'conv' ? (
                    <>
                      <Check size={layoutMode === 'scroll' ? 13 : 11} className="text-white dark:text-stone-900" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={layoutMode === 'scroll' ? 13 : 11} className="text-yellow-101 dark:text-stone-700" />
                      <span>Copy Result</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Key Tab for Full Equivalents */}
          <div className="flex justify-center">
            <button
              id="full-equivalence-key-tab"
              onClick={() => setShowAllEquivalents(!showAllEquivalents)}
              className={`flex items-center gap-2 rounded-xl font-black transition-all outline-none border ${
                layoutMode === 'scroll'
                  ? 'py-3 px-5 text-sm rounded-2xl'
                  : 'py-2 px-4 text-xs'
              } ${
                showAllEquivalents
                  ? 'bg-yellow-400 border-yellow-400 text-white dark:bg-yellow-405 dark:border-yellow-450 dark:text-stone-900 shadow-md shadow-yellow-200 dark:shadow-[0_0_12px_rgba(250,204,21,0.25)]'
                  : 'bg-yellow-50 dark:bg-stone-850 border-yellow-101/50 dark:border-stone-800 text-yellow-905 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-stone-800'
              }`}
            >
              <Layers size={layoutMode === 'scroll' ? 16 : 14} className={showAllEquivalents ? 'animate-[spin_1s_ease-in-out_1]' : ''} />
              <span>{showAllEquivalents ? 'Hide Equivalents Key' : 'Tap for Equivalents Key'}</span>
            </button>
          </div>

          {/* Collapsible Equivalents List */}
          {showAllEquivalents && (
            <div className={`bg-yellow-50/40 dark:bg-stone-850/40 border border-yellow-101/30 dark:border-stone-800 rounded-2xl animate-[fadeIn_0.2s_ease-out] ${
              layoutMode === 'scroll' ? 'p-4' : 'p-3'
            }`}>
              <h3 className={`font-black text-yellow-905 dark:text-yellow-405 uppercase tracking-wider mb-2 px-1 ${
                layoutMode === 'scroll' ? 'text-xs' : 'text-[10px]'
              }`}>
                Other Unit Equivalents
              </h3>
              <div className={`space-y-1.5 overflow-y-auto pr-1 scrollbar-thin ${
                layoutMode === 'scroll' ? 'max-h-48' : 'max-h-36'
              }`}>
                {getFullListConversions().map((item) => (
                  <div
                    key={item.symbol}
                    onClick={() => handleCopy(item.value, `eq-${item.symbol}`, `${inputValue} ${sourceUnit} = ${item.value} ${item.symbol}`)}
                    className={`flex justify-between items-center rounded-xl font-bold transition-all cursor-pointer hover:scale-[1.01] ${
                      layoutMode === 'scroll' ? 'px-4 py-3 text-sm' : 'px-3 py-2 text-xs'
                    } ${
                      item.symbol === targetUnit
                        ? 'bg-yellow-400 dark:bg-yellow-405 text-white dark:text-stone-900 border border-transparent shadow-xs'
                        : item.symbol === sourceUnit
                        ? 'bg-yellow-101 dark:bg-yellow-550/10 text-yellow-905 dark:text-yellow-400 border border-yellow-300 dark:border-yellow-405/30'
                        : 'bg-white dark:bg-stone-900 border border-gray-100 dark:border-stone-800/80 hover:bg-yellow-50 dark:hover:bg-stone-850 text-gray-500 dark:text-stone-300'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span className={`opacity-75 ${layoutMode === 'scroll' ? 'text-xs' : 'text-[10px]'}`}>{item.name}</span>
                      <span className={`font-mono bg-gray-100/80 dark:bg-stone-800 px-1.5 py-0.5 rounded text-gray-650 dark:text-stone-400 ${
                        layoutMode === 'scroll' ? 'text-xs' : 'text-[10px]'
                      }`}>{item.symbol}</span>
                    </span>
                    <span className={`font-mono flex items-center gap-1 select-none ${
                        layoutMode === 'scroll' ? 'text-sm' : 'text-xs'
                      }`}>
                      <span>{item.value}</span>
                      {copiedKey === `eq-${item.symbol}` ? (
                        <Check size={layoutMode === 'scroll' ? 13 : 11} className="text-green-600 dark:text-yellow-450" />
                      ) : (
                        <Copy size={layoutMode === 'scroll' ? 13 : 11} className="text-gray-300 dark:text-stone-605 opacity-50" />
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- RENDER 2: BOLTS & DRILLS REFERENCE MATCH --- */}
      {currentType === 'bolt_drill' && (
        <div className="space-y-5">
          {/* Subcategory toggle pills for Bolts & Screws section */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-yellow-50/50 dark:bg-stone-850 rounded-xl border border-yellow-101/60 dark:border-stone-800 select-none">
            <button
              type="button"
              onClick={() => setBoltSubTab('drill_match')}
              className={`py-2 rounded-lg text-[10px] xs:text-xs font-black transition-all outline-none ${
                boltSubTab === 'drill_match'
                  ? 'bg-yellow-405 text-stone-900 border border-yellow-350 dark:border-transparent font-black shadow-xs'
                  : 'text-gray-500 dark:text-stone-400 hover:text-gray-800 dark:hover:text-stone-200'
              }`}
            >
              Drillbits & Tox
            </button>
            <button
              type="button"
              onClick={() => setBoltSubTab('screw_wrench')}
              className={`py-2 rounded-lg text-[10px] xs:text-xs font-black transition-all outline-none ${
                boltSubTab === 'screw_wrench'
                  ? 'bg-yellow-405 text-stone-900 border border-yellow-350 dark:border-transparent font-black shadow-xs'
                  : 'text-gray-500 dark:text-stone-400 hover:text-gray-800 dark:hover:text-stone-200'
              }`}
            >
              Find Wrench
            </button>
            <button
              type="button"
              onClick={() => setBoltSubTab('screw_lengths')}
              className={`py-2 rounded-lg text-[10px] xs:text-xs font-black transition-all outline-none ${
                boltSubTab === 'screw_lengths'
                  ? 'bg-yellow-405 text-stone-900 border border-yellow-350 dark:border-transparent font-black shadow-xs'
                  : 'text-gray-500 dark:text-stone-400 hover:text-gray-800 dark:hover:text-stone-200'
              }`}
            >
              Screw Lengths
            </button>
          </div>

          {/* BLOCK A: DRILLS & BITS COMPATIBILITY LOOKUP */}
          {boltSubTab === 'drill_match' && (
            <div className="space-y-4 animate-[fadeIn_0.15s_ease-out]">
              {/* Search Bar placed at the very top of the page */}
              <div className="space-y-2 p-3.5 bg-yellow-50/50 dark:bg-stone-850 rounded-2xl border border-yellow-101/60 dark:border-stone-800">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-yellow-800 dark:text-stone-400 block px-1">
                  🔍 Search Drill Bits &amp; Tox Plugs
                </span>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search e.g. 5/16, 8mm, or Tox #8..."
                    value={drillSearchQuery}
                    onChange={(e) => setDrillSearchQuery(e.target.value)}
                    className="w-full bg-white dark:bg-stone-900 border-2 border-yellow-250/70 focus:border-yellow-405 dark:focus:border-yellow-450 rounded-xl font-bold px-3.5 py-2.5 text-xs outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-stone-550"
                  />
                  {drillSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setDrillSearchQuery('')}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-stone-300"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Live Search results - Shown ONLY when searching to keep interface uncluttered */}
                {drillSearchQuery.trim() !== '' && (
                  <div className="pt-2 animate-[fadeIn_0.1s_ease-out] space-y-1.5 border-t border-yellow-101/40 mt-2">
                    <span className="text-[9.5px] uppercase tracking-wider font-black text-yellow-750 dark:text-stone-400 px-0.5">Matching Standard Sizes:</span>
                    <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                      {filteredDrillBits.map((b) => (
                        <div 
                          key={b.fraction}
                          onClick={() => {
                            setDrillInput(drillInputType === 'mm' ? b.mm.toString() : b.decimalInches.toString());
                          }}
                          className="flex items-center justify-between bg-white hover:bg-yellow-100 dark:bg-stone-900 dark:hover:bg-stone-800 rounded-lg p-2 text-xs border border-yellow-101/40 dark:border-stone-800 cursor-pointer"
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-gray-850 dark:text-stone-200">{b.fraction}</span>
                            <span className="text-gray-400 text-[10px]/none font-normal">({b.decimalInches.toFixed(3)} in)</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {b.note && <span className="bg-yellow-50 dark:bg-stone-800 text-[8.5px] text-yellow-905 dark:text-yellow-405 px-1 py-0.2 rounded font-black uppercase text-center scale-90">{b.note}</span>}
                            <span className="font-mono bg-amber-50 dark:bg-stone-950 px-1.5 py-0.5 rounded text-[11px] font-black">{b.mm.toFixed(2)} mm</span>
                          </div>
                        </div>
                      ))}
                      {filteredDrillBits.length === 0 && (
                        <p className="text-[11px] text-center text-gray-400 py-2 font-bold bg-white dark:bg-stone-900 rounded-lg">No matching dimensions found</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Quick interactive lookup input */}
              <div className="space-y-3 p-3.5 bg-white dark:bg-stone-900/60 rounded-2xl border border-gray-150/70 dark:border-stone-800">
                <h3 className="font-extrabold text-gray-800 dark:text-stone-300 uppercase tracking-wider flex items-center gap-1.5 text-xs">
                  <Wrench size={12} className="text-amber-550" /> Drills &amp; Bits Compatibility Lookup
                </h3>
                <div className="w-full flex items-stretch gap-1.5 xs:gap-2">
                  <input
                    type="number"
                    inputMode="decimal"
                    value={drillInput}
                    onChange={(e) => setDrillInput(e.target.value)}
                    placeholder="Ex. 12 or 0.5"
                    className={`flex-1 min-w-0 bg-white dark:bg-stone-900 border-2 border-gray-200 dark:border-stone-800 focus:border-yellow-405 dark:focus:border-yellow-405/85 rounded-xl font-black transition-all outline-none ${
                      layoutMode === 'scroll' ? 'px-4 py-3 text-base' : 'px-3 py-2 text-sm'
                    }`}
                  />
                  <select
                    value={drillInputType}
                    onChange={(e) => setDrillInputType(e.target.value as 'mm' | 'fraction')}
                    className={`shrink-0 bg-white dark:bg-stone-900 text-gray-800 dark:text-stone-200 border-2 border-gray-200 dark:border-stone-800 focus:border-yellow-405 rounded-xl font-bold outline-none cursor-pointer ${
                      layoutMode === 'scroll' ? 'w-24 xs:w-28 px-2.5 py-3 text-xs xs:text-sm' : 'w-20 xs:w-24 px-1.5 py-2 text-[11px] xs:text-xs'
                    }`}
                  >
                    <option value="mm">mm</option>
                    <option value="fraction">inches (dec)</option>
                  </select>
                </div>

                {/* Render Matches */}
                <div className="space-y-2 pt-1">
                  <p className={`font-bold text-gray-400 dark:text-stone-450 uppercase tracking-widest ${
                    layoutMode === 'scroll' ? 'text-[10px]' : 'text-[9px]'
                  }`}>Closest Standard Hardware Equivalents:</p>
                  {getClosestDrillBits().map((match, idx) => (
                    <div 
                      key={match.fraction}
                      onClick={() => setDrillInput(drillInputType === 'mm' ? match.mm.toString() : match.decimalInches.toString())}
                      className={`rounded-xl flex justify-between items-center font-bold cursor-pointer transition-all ${
                        layoutMode === 'scroll' ? 'p-3 text-sm' : 'p-2.5 text-xs'
                      } ${
                        idx === 0 
                          ? 'bg-yellow-400 text-white dark:text-stone-900 shadow-xs' 
                          : 'bg-white dark:bg-stone-900 hover:bg-yellow-50 dark:hover:bg-stone-850/60 text-gray-750 dark:text-stone-300 border border-yellow-101/60 dark:border-stone-800/80'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className={`font-black ${layoutMode === 'scroll' ? 'text-base' : 'text-sm'}`}>{match.fraction}</span>
                        {match.note && <span className={`text-[9px] ${idx === 0 ? 'text-yellow-101 dark:text-stone-800' : 'text-gray-400 dark:text-stone-500'}`}>{match.note}</span>}
                      </div>
                      <div className="text-right">
                        <span className={`font-mono font-black ${layoutMode === 'scroll' ? 'text-base' : 'text-sm'}`}>{match.mm.toFixed(2)} mm</span>
                        <p className={`text-[8px] uppercase tracking-wider ${idx === 0 ? 'text-yellow-101' : 'text-gray-400'}`}>
                          (~{match.decimalInches.toFixed(3)} in)
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* TOX PLUGS & DRILL BIT PAIRING REFERENCE SECTION */}
              <div className="p-3.5 bg-yellow-50/20 dark:bg-stone-950/20 rounded-2xl border border-yellow-101/30 dark:border-stone-800/60 space-y-2">
                <div className="flex items-center gap-1.5">
                  <span className="p-1 rounded-md bg-amber-500/10 text-amber-600 dark:text-yellow-405 flex items-center justify-center">
                    <CircleDot size={12} />
                  </span>
                  <h4 className="text-xs font-black text-gray-800 dark:text-stone-200 uppercase tracking-wider">
                    Wall TOX Plastic Anchors &amp; Drill Bit Pairing
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10.5px]">
                  {TOX_DATA.map((t) => (
                    <div key={t.plug} className="bg-white dark:bg-stone-900 p-2.5 rounded-xl border border-gray-150/40 dark:border-stone-800 flex justify-between items-start gap-1">
                      <div className="space-y-0.5">
                        <span className="font-extrabold text-gray-850 dark:text-stone-200 block">{t.plug}</span>
                        <span className="text-[9px] text-gray-400 dark:text-stone-500 block leading-tight">{t.typical}</span>
                      </div>
                      <span className="shrink-0 text-[9.5px] font-black bg-amber-500/10 dark:bg-yellow-500/10 text-amber-800 dark:text-yellow-455 border border-amber-200/20 dark:border-stone-800 px-2 py-1 rounded-lg">
                        {t.recommendedBit.replace(' masonry bit', '')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Collapsible Standard Sizes Chart - Hidden by default */}
              <div className="pt-1 select-none">
                <button
                  type="button"
                  onClick={() => setShowDrillChart(!showDrillChart)}
                  className="w-full py-2.5 px-3 text-xs font-black rounded-xl bg-gray-50 hover:bg-gray-100 dark:bg-stone-850 dark:hover:bg-stone-800 text-gray-650 dark:text-stone-300 flex justify-between items-center transition-all outline-none border border-gray-200/50 dark:border-stone-800 cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <Layers size={13} className="text-amber-550" />
                    <span>{showDrillChart ? 'Hide Complete Drill Sizing Chart' : 'Show Complete Drill Sizing Chart'}</span>
                  </span>
                  <span className="text-xs text-amber-700 dark:text-yellow-455">
                    {showDrillChart ? '▲' : '▼'}
                  </span>
                </button>

                {showDrillChart && (
                  <div className="mt-2.5 border border-gray-100 dark:border-stone-800 rounded-2xl bg-white dark:bg-stone-900 p-3 space-y-2 animate-[fadeIn_0.12s_ease-out]">
                    <div className="max-h-48 overflow-y-auto pr-1 space-y-1">
                      {DRILL_BIT_DATA.map((b) => (
                        <div 
                          key={b.fraction}
                          onClick={() => {
                            setDrillInput(drillInputType === 'mm' ? b.mm.toString() : b.decimalInches.toString());
                          }}
                          className="flex items-center justify-between bg-gray-50/50 dark:bg-stone-950/25 p-2 rounded-lg text-xs cursor-pointer hover:bg-yellow-50/40 dark:hover:bg-stone-850/65"
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-gray-805 dark:text-stone-200">{b.fraction}</span>
                            <span className="text-gray-400 font-normal text-[10px]">({b.decimalInches.toFixed(3)} in)</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {b.note && <span className="bg-yellow-50 dark:bg-stone-850 border border-yellow-101/60 text-[9px] text-yellow-905 dark:text-yellow-405 px-1 rounded-md font-bold uppercase">{b.note}</span>}
                            <span className="font-mono text-gray-500 dark:text-stone-300 font-black">{b.mm.toFixed(2)} mm</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* BLOCK B: SCREW & WRENCH MATCHER */}
          {boltSubTab === 'screw_wrench' && (
            <div className="space-y-4 animate-[fadeIn_0.15s_ease-out]">
              {/* Search Bar at the very top of Key/Wrench Find tab */}
              <div className="space-y-2 p-3.5 bg-yellow-50/50 dark:bg-stone-850 rounded-2xl border border-yellow-101/60 dark:border-stone-800">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-yellow-800 dark:text-stone-400 block px-1">
                  🔍 Quick Search Wrench / Thread Size
                </span>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search thread or wrench, e.g. M8, 13mm, 5/16..."
                    value={screwSearchFilter}
                    onChange={(e) => setScrewSearchFilter(e.target.value)}
                    className="w-full bg-white dark:bg-stone-900 border-2 border-yellow-250/70 focus:border-yellow-405 dark:focus:border-yellow-450 rounded-xl font-bold px-3.5 py-2.5 text-xs outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-stone-550"
                  />
                  {screwSearchFilter && (
                    <button
                      type="button"
                      onClick={() => setScrewSearchFilter('')}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-stone-300"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Live Search results for Wrench search */}
                {screwSearchFilter.trim() !== '' && (
                  <div className="pt-2 animate-[fadeIn_0.1s_ease-out] space-y-1.5 border-t border-yellow-101/40 mt-2">
                    <span className="text-[9.5px] uppercase tracking-wider font-black text-yellow-750 dark:text-stone-400 px-0.5">Matching Thread Pairings:</span>
                    <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                      {SCREW_WRENCH_DATA.filter(sw => {
                        const q = screwSearchFilter.toLowerCase();
                        return sw.screw.toLowerCase().includes(q) || sw.openWrench.toLowerCase().includes(q) || sw.type.toLowerCase().includes(q);
                      }).map((sw) => {
                        const itemIndex = SCREW_WRENCH_DATA.indexOf(sw);
                        return (
                          <div 
                            key={sw.screw}
                            onClick={() => {
                              setSelectedScrewIndex(itemIndex);
                            }}
                            className="flex items-center justify-between bg-white hover:bg-yellow-100 dark:bg-stone-900 dark:hover:bg-stone-800 rounded-lg p-2.5 text-xs border border-yellow-101/40 dark:border-stone-800 cursor-pointer"
                          >
                            <div className="flex flex-col">
                              <span className="font-extrabold text-gray-850 dark:text-stone-200">{sw.screw}</span>
                              <span className="text-[9px] text-gray-400 dark:text-stone-500">Diameter: {sw.threadDiaMm}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] bg-yellow-50 dark:bg-stone-950 font-black px-2 py-0.5 border border-yellow-101/40 rounded">Wrench: {sw.openWrench}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Selector dropdown of common bolt sizes (Drawer Option mode) */}
              <div>
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-gray-400 mb-1.5 block px-1">Select Screw Thread:</span>
                <div className="relative">
                  <select
                    value={selectedScrewIndex}
                    onChange={(e) => setSelectedScrewIndex(parseInt(e.target.value, 10))}
                    className="w-full bg-white dark:bg-stone-900 text-gray-800 dark:text-stone-200 border-2 border-gray-200 dark:border-stone-800 focus:border-yellow-405 dark:focus:border-yellow-450 rounded-xl font-black px-3.5 py-3 text-xs outline-none transition-all cursor-pointer appearance-none pr-10"
                  >
                    {SCREW_WRENCH_DATA.map((sw, index) => (
                      <option key={sw.screw} value={index} className="bg-white dark:bg-stone-900 text-gray-800 dark:text-stone-200">
                        {sw.screw} ({sw.type.includes('Metric') ? 'METRIC' : 'FRAC'})
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-gray-500">
                    <ChevronDown size={14} className="stroke-[2.5]" />
                  </div>
                </div>
              </div>

              {/* Multi-data Output Panel with highly-visible yellow theme & golden shadow */}
              <div className="bg-gradient-to-br from-yellow-350 to-yellow-450 dark:from-yellow-400 dark:to-yellow-500 p-4.5 rounded-3xl text-stone-950 space-y-4 shadow-[0_10px_25px_-5px_rgba(250,204,21,0.35)] border-2 border-yellow-300 dark:border-yellow-550">
                <div className="flex justify-between items-center border-b border-stone-950/15 pb-2">
                  <div>
                    <span className="text-[9px] font-black tracking-widest text-stone-900 uppercase opacity-75">Selected Fastener</span>
                    <h4 className="text-base font-black leading-tight text-stone-950">{SCREW_WRENCH_DATA[selectedScrewIndex].screw}</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-black tracking-widest text-stone-900 uppercase opacity-75">Thread Type</span>
                    <p className="text-[10.5px] font-black uppercase tracking-wide text-stone-950">{SCREW_WRENCH_DATA[selectedScrewIndex].type}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div className="bg-white/50 dark:bg-stone-950/10 p-3 rounded-2xl border border-stone-950/10">
                    <span className="text-[8.5px] font-black text-stone-900 uppercase tracking-widest block mb-0.5 opacity-80">🔧 Open/Combo Wrench</span>
                    <p className="text-lg font-black text-stone-950 tracking-tight font-mono">{SCREW_WRENCH_DATA[selectedScrewIndex].openWrench}</p>
                  </div>
                  <div className="bg-white/50 dark:bg-stone-950/10 p-3 rounded-2xl border border-stone-950/10">
                    <span className="text-[8.5px] font-black text-stone-900 uppercase tracking-widest block mb-0.5 opacity-80">🔩 Hex Allen Wrench</span>
                    <p className="text-lg font-black text-stone-950 tracking-tight font-mono">{SCREW_WRENCH_DATA[selectedScrewIndex].allenKey}</p>
                  </div>
                </div>

                <div className="text-xs pt-1 flex flex-col sm:flex-row justify-between gap-1 items-start sm:items-center">
                  <div className="leading-snug">
                    <span className="text-[8.5px] font-black text-stone-900 uppercase tracking-wider block opacity-75">Standard Applications:</span>
                    <span className="font-extrabold text-stone-950">{SCREW_WRENCH_DATA[selectedScrewIndex].typicalHexHead}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(`${SCREW_WRENCH_DATA[selectedScrewIndex].screw}: Use Wrench ${SCREW_WRENCH_DATA[selectedScrewIndex].openWrench}`, `sw-${selectedScrewIndex}`)}
                    className="self-end sm:self-center py-1.5 px-3.5 text-[9.5px] bg-stone-950 hover:bg-stone-900 active:scale-95 transition-all rounded-xl text-white flex items-center justify-center font-black gap-1 uppercase"
                  >
                    {copiedKey === `sw-${selectedScrewIndex}` ? <Check size={11} /> : <Copy size={10} />}
                    <span>{copiedKey === `sw-${selectedScrewIndex}` ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Collapsible pairings list - Hidden by default */}
              <div className="pt-1 select-none">
                <button
                  type="button"
                  onClick={() => setShowWrenchChart(!showWrenchChart)}
                  className="w-full py-2.5 px-3 text-xs font-black rounded-xl bg-gray-50 hover:bg-gray-100 dark:bg-stone-850 dark:hover:bg-stone-800 text-gray-650 dark:text-stone-300 flex justify-between items-center transition-all outline-none border border-gray-200/50 dark:border-stone-800 cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <Layers size={13} className="text-amber-550" />
                    <span>{showWrenchChart ? 'Hide Complete Wrench Sizing Chart' : 'Show Complete Wrench Sizing Chart'}</span>
                  </span>
                  <span className="text-xs text-amber-700 dark:text-yellow-455">
                    {showWrenchChart ? '▲' : '▼'}
                  </span>
                </button>

                {showWrenchChart && (
                  <div className="mt-2.5 border border-gray-100 dark:border-stone-800 rounded-2xl bg-white dark:bg-stone-900 p-3 space-y-2 animate-[fadeIn_0.12s_ease-out]">
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {SCREW_WRENCH_DATA.map((sw, idx) => (
                        <div 
                          key={sw.screw}
                          onClick={() => setSelectedScrewIndex(idx)}
                          className={`flex justify-between items-center py-2 px-3 rounded-lg border cursor-pointer hover:bg-yellow-50 text-xs transition-all ${
                            selectedScrewIndex === idx 
                              ? 'bg-yellow-50 dark:bg-stone-850 dark:border-yellow-405 border-yellow-250 font-extrabold text-yellow-905 dark:text-yellow-405'
                              : 'bg-white dark:bg-stone-900 border-gray-100 dark:border-stone-805/80 text-gray-500 dark:text-stone-300'
                          }`}
                        >
                          <div className="flex flex-col">
                            <span className="font-extrabold text-gray-800 dark:text-stone-100">{sw.screw}</span>
                            <span className="text-[8px] text-gray-400 dark:text-stone-500 uppercase tracking-wide">Diameter: {sw.threadDiaMm}</span>
                          </div>
                          <div className="text-right flex items-center gap-1.5">
                            <span className="text-[10px] bg-yellow-50 dark:bg-stone-950 px-2.5 py-0.5 rounded font-black border border-yellow-101/45">Wrench: {sw.openWrench}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* BLOCK C: SCREW LENGTHS EQUIVALENCY */}
          {boltSubTab === 'screw_lengths' && (
            <div className="space-y-4 animate-[fadeIn_0.15s_ease-out]">
              {/* Search Bar placed at the very top of the page */}
              <div className="space-y-2 p-3.5 bg-yellow-50/50 dark:bg-stone-850 rounded-2xl border border-yellow-101/60 dark:border-stone-800">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-yellow-800 dark:text-stone-400 block px-1">
                  🔍 Quick Search Screw Lengths
                </span>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search length, e.g. 1/2, 3/4, 25mm, drywall..."
                    value={lengthSearchFilter}
                    onChange={(e) => setLengthSearchFilter(e.target.value)}
                    className="w-full bg-white dark:bg-stone-900 border-2 border-yellow-250/70 focus:border-yellow-405 dark:focus:border-yellow-450 rounded-xl font-bold px-3.5 py-2.5 text-xs outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-stone-550"
                  />
                  {lengthSearchFilter && (
                    <button
                      type="button"
                      onClick={() => setLengthSearchFilter('')}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-stone-300"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Live Search results for Screw Lengths search */}
                {lengthSearchFilter.trim() !== '' && (
                  <div className="pt-2 animate-[fadeIn_0.1s_ease-out] space-y-1.5 border-t border-yellow-101/40 mt-2">
                    <span className="text-[9.5px] uppercase tracking-wider font-black text-yellow-750 dark:text-stone-400 px-0.5">Matching Length Values:</span>
                    <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                      {SCREW_LENGTH_DATA.filter(sl => {
                        const q = lengthSearchFilter.toLowerCase();
                        return sl.inches.toLowerCase().includes(q) || sl.tradeMm.toLowerCase().includes(q) || sl.commonApp.toLowerCase().includes(q);
                      }).map((sl) => {
                        const slIdx = SCREW_LENGTH_DATA.indexOf(sl);
                        return (
                          <div 
                            key={sl.inches}
                            onClick={() => {
                              setSelectedLengthIndex(slIdx);
                            }}
                            className="flex items-center justify-between bg-white hover:bg-yellow-100 dark:bg-stone-900 dark:hover:bg-stone-800 rounded-lg p-2.5 text-xs border border-yellow-101/40 dark:border-stone-800 cursor-pointer"
                          >
                            <div className="flex flex-col text-left">
                              <span className="font-extrabold text-gray-850 dark:text-stone-200">{sl.inches}</span>
                              <span className="text-[9px] text-gray-400 dark:text-stone-550">{sl.commonApp}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] bg-yellow-50/50 dark:bg-stone-950 px-2 py-0.5 border border-yellow-101/40 rounded font-bold font-mono">Traded: {sl.tradeMm}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Selector dropdown of length options (Drawer Option mode) */}
              <div>
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-gray-400 mb-1.5 block px-1">Select Nominal Sizing:</span>
                <div className="relative">
                  <select
                    value={selectedLengthIndex}
                    onChange={(e) => setSelectedLengthIndex(parseInt(e.target.value, 10))}
                    className="w-full bg-white dark:bg-stone-900 text-gray-800 dark:text-stone-200 border-2 border-gray-200 dark:border-stone-800 focus:border-yellow-405 dark:focus:border-yellow-450 rounded-xl font-black px-3.5 py-3 text-xs outline-none transition-all cursor-pointer appearance-none pr-10"
                  >
                    {SCREW_LENGTH_DATA.map((sl, index) => (
                      <option key={sl.inches} value={index} className="bg-white dark:bg-stone-900 text-gray-800 dark:text-stone-200">
                        {sl.inches} (Local Trade: {sl.tradeMm})
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-gray-500">
                    <ChevronDown size={14} className="stroke-[2.5]" />
                  </div>
                </div>
              </div>

              {/* Primary Output Highlight Panel with super high-contrast vibrant yellow theme & golden shadow */}
              <div className="bg-gradient-to-br from-yellow-350 to-yellow-450 dark:from-yellow-400 dark:to-yellow-500 p-4.5 rounded-3xl text-stone-950 space-y-4 shadow-[0_10px_25px_-5px_rgba(250,204,21,0.35)] border-2 border-yellow-300 dark:border-yellow-550">
                <div className="flex justify-between items-center border-b border-stone-950/15 pb-2">
                  <div>
                    <span className="text-[9px] font-black tracking-widest text-stone-900 uppercase opacity-75">Nominal Inch Spec</span>
                    <h4 className="text-xl font-black leading-none text-stone-950 font-sans">{SCREW_LENGTH_DATA[selectedLengthIndex].inches} Inches</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-black tracking-widest text-stone-900 uppercase opacity-75">Decimal Value</span>
                    <p className="text-sm font-black font-mono tracking-tight text-stone-950">{SCREW_LENGTH_DATA[selectedLengthIndex].decimalInches.toFixed(3)}"</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div className="bg-white/50 dark:bg-stone-950/10 p-3 rounded-2xl border border-stone-950/10">
                    <span className="text-[8.5px] font-black text-stone-900 uppercase tracking-widest block mb-0.5 opacity-80">🇵🇭 Local Trade Equivalency</span>
                    <p className="text-[16px] font-extrabold text-stone-950 leading-tight tracking-[0.02em]">{SCREW_LENGTH_DATA[selectedLengthIndex].tradeMm}</p>
                  </div>
                  <div className="bg-white/50 dark:bg-stone-950/10 p-3 rounded-2xl border border-stone-950/10">
                    <span className="text-[8.5px] font-black text-stone-900 uppercase tracking-widest block mb-0.5 opacity-80">📐 Exact Mathematical Sizing</span>
                    <p className="text-[16px] font-extrabold text-stone-950 font-mono leading-tight tracking-tight">{SCREW_LENGTH_DATA[selectedLengthIndex].exactMm}</p>
                  </div>
                </div>

                <div className="text-xs pt-1 flex flex-col sm:flex-row justify-between gap-1 items-start sm:items-center">
                  <div className="leading-snug">
                    <span className="text-[8.5px] font-black text-stone-900 uppercase tracking-wider block opacity-75">Common Hardware Usage:</span>
                    <span className="font-extrabold text-stone-950">{SCREW_LENGTH_DATA[selectedLengthIndex].commonApp}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(`Screw: ${SCREW_LENGTH_DATA[selectedLengthIndex].inches} = ${SCREW_LENGTH_DATA[selectedLengthIndex].tradeMm} (Exact: ${SCREW_LENGTH_DATA[selectedLengthIndex].exactMm})`, `sl-${selectedLengthIndex}`)}
                    className="self-end sm:self-center py-1.5 px-3.5 text-[9.5px] bg-stone-950 hover:bg-stone-900 active:scale-95 transition-all rounded-xl text-white flex items-center justify-center font-black gap-1 uppercase"
                  >
                    {copiedKey === `sl-${selectedLengthIndex}` ? <Check size={11} /> : <Copy size={10} />}
                    <span>{copiedKey === `sl-${selectedLengthIndex}` ? 'Copied' : 'Copy Sizing'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- RENDER 3: PVC PIPE NOMINAL SIZES LOOKUP --- */}
      {currentType === 'pvc_pipes' && (
        <div className="space-y-6">
          <div className="p-4 bg-yellow-50/50 rounded-2xl border border-yellow-100 text-xs">
            <h3 className={`font-bold text-yellow-905 dark:text-yellow-450 uppercase tracking-wider mb-2 flex items-center gap-1.5 ${
              layoutMode === 'scroll' ? 'text-sm' : 'text-xs'
            }`}>
              <CircleDot size={14} className="text-yellow-600 dark:text-stone-450" /> Philippine PVC Trade Dimension Lookup
            </h3>
            <p className={`text-gray-500 dark:text-stone-400 leading-relaxed ${
              layoutMode === 'scroll' ? 'text-xs' : 'text-[11px]'
            }`}>
              PVC Pipe trade sizes in the Philippines reference standard nominal imperial values (inches), but map precisely to metric outer diameter (OD) in millimeters.
            </p>
          </div>

          {/* Quick Select Grid */}
          <div>
            <span className={`font-bold text-gray-400 dark:text-stone-450 uppercase tracking-widest block mb-2 px-1 ${
              layoutMode === 'scroll' ? 'text-xs' : 'text-[10px]'
            }`}>Select Nominal Trade Size:</span>
            <div className="grid grid-cols-4 gap-1.5 mr-1">
              {PVC_PIPE_DATA.map((pipe, idx) => (
                <button
                  key={pipe.inches}
                  onClick={() => setSelectedPvcIndex(idx)}
                  className={`font-black transition-all border ${
                    layoutMode === 'scroll' ? 'py-3.5 px-1.5 rounded-2xl text-sm' : 'py-2 px-1 rounded-xl text-xs'
                  } ${
                    selectedPvcIndex === idx
                      ? 'bg-yellow-400 text-white dark:text-stone-900 border-transparent shadow'
                      : 'bg-white dark:bg-stone-900 hover:bg-yellow-50 dark:hover:bg-stone-850/50 text-gray-700 dark:text-stone-300 border-gray-100 dark:border-stone-800'
                  }`}
                >
                  {pipe.inches}
                </button>
              ))}
            </div>
          </div>

          {/* PVC Pipe Conversion Output Panel */}
          <div className="bg-yellow-400 dark:bg-yellow-405 p-5 rounded-3xl shadow-lg border border-yellow-300 dark:border-stone-800 space-y-4 text-white dark:text-stone-900">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[10px] font-black text-yellow-950 dark:text-stone-800 uppercase tracking-widest opacity-80">Nominal Pipe Size</p>
                <p className={`font-black text-white dark:text-stone-900 leading-tight ${
                  layoutMode === 'scroll' ? 'text-4xl xs:text-5xl' : 'text-3xl'
                }`}>{PVC_PIPE_DATA[selectedPvcIndex].inches}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-yellow-950 dark:text-stone-800 uppercase tracking-widest opacity-80">ISO Metric Designation</p>
                <div className="flex items-center justify-end gap-1.5 mt-0.5">
                  <span className={`font-black text-white dark:text-stone-900 ${
                    layoutMode === 'scroll' ? 'text-4xl xs:text-5xl' : 'text-3xl'
                  }`}>{PVC_PIPE_DATA[selectedPvcIndex].metricMm}</span>
                  <button
                    onClick={() => handleCopy(PVC_PIPE_DATA[selectedPvcIndex].metricMm, 'pvc-metric')}
                    className="p-1 rounded bg-white/20 dark:bg-stone-900/10 hover:bg-white/30 dark:hover:bg-stone-900/20 text-white dark:text-stone-900 border border-white/10 transition-all active:scale-90"
                    title="Copy metric size"
                  >
                    {copiedKey === 'pvc-metric' ? <Check size={11} className="text-white dark:text-stone-900 font-extrabold" /> : <Copy size={11} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="border-t border-white/20 dark:border-stone-900/20 pt-3 space-y-3 font-semibold">
              <div className="flex justify-between text-xs items-center">
                <span className="text-yellow-950 dark:text-stone-800 font-black uppercase tracking-wide opacity-80">Approx Inside Ø:</span>
                <div className="flex items-center gap-1.5 font-mono font-black text-white dark:text-stone-900">
                  <span className={layoutMode === 'scroll' ? 'text-sm' : 'text-xs'}>{PVC_PIPE_DATA[selectedPvcIndex].internalDiameterApprox}</span>
                  <button
                    onClick={() => handleCopy(PVC_PIPE_DATA[selectedPvcIndex].internalDiameterApprox, 'pvc-id')}
                    className="p-1 rounded bg-white/20 dark:bg-stone-900/10 hover:bg-white/30 dark:hover:bg-stone-900/20 text-white dark:text-stone-900 transition-all active:scale-90 flex items-center justify-center border border-white/10"
                    title="Copy inside diameter"
                  >
                    {copiedKey === 'pvc-id' ? <Check size={10} className="text-white dark:text-stone-900 font-extrabold" /> : <Copy size={10} />}
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-1 text-xs">
                <span className="text-yellow-950 dark:text-stone-800 font-black uppercase tracking-wide opacity-80">Typical Philippines Application:</span>
                <span className={`bg-white/15 dark:bg-stone-900/10 border border-white/10 dark:border-stone-900/10 rounded-xl font-bold leading-relaxed flex items-start gap-1.5 shadow-sm ${
                  layoutMode === 'scroll' ? 'p-4 text-sm' : 'p-3 text-xs'
                }`}>
                  <span className="text-white dark:text-stone-900 font-black">▪</span>
                  <span>{PVC_PIPE_DATA[selectedPvcIndex].typicalUse}</span>
                </span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* --- RENDER 4: WIRE CONVERSIONS & SPECIFICATIONS (SOLID vs STRANDED) --- */}
      {currentType === 'wire_sizes' && (
        <div className="space-y-5 animate-[fadeIn_0.15s_ease-out]">
          {/* Quick Select Buttons Grid (7 sizes) */}
          <div>
            <span className={`font-bold text-gray-400 dark:text-stone-450 uppercase tracking-widest block mb-2 px-1 ${
              layoutMode === 'scroll' ? 'text-xs' : 'text-[10px]'
            }`}>
              Select Wire Size:
            </span>
            <div className="grid grid-cols-3 xs:grid-cols-5 sm:grid-cols-9 gap-1.5">
              {WIRE_SIZE_DATA.map((wire, idx) => {
                const isActive = selectedWireIndex === idx;
                return (
                  <button
                    key={wire.awg}
                    onClick={() => setSelectedWireIndex(idx)}
                    className={`font-black transition-all border flex flex-col items-center justify-center cursor-pointer ${
                      layoutMode === 'scroll' ? 'py-2.5 px-1 rounded-xl text-center' : 'py-1.5 px-0.5 rounded-lg text-center'
                    } ${
                      isActive
                        ? 'bg-yellow-400 text-white dark:text-stone-900 border-transparent shadow-[0_2px_8px_rgba(250,204,21,0.3)]'
                        : 'bg-white dark:bg-stone-900 hover:bg-yellow-50 dark:hover:bg-stone-850/50 text-gray-700 dark:text-stone-300 border-gray-150/80 dark:border-stone-800'
                    }`}
                  >
                    <span className="text-[11.5px] xs:text-xs leading-none font-black">{wire.awg.split(' ')[0]}</span>
                    <span className={`text-[8.5px] font-extrabold mt-1 leading-none ${isActive ? 'text-yellow-950 dark:text-stone-800' : 'text-gray-400 dark:text-stone-500'}`}>
                      {wire.metricMm2.split(' ')[0]}mm²
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Wire Spec Detailed Card inside Gradient Output Panel */}
          <div className="bg-yellow-400 dark:bg-yellow-405 p-4 xs:p-5 rounded-3xl shadow-lg border border-yellow-300 dark:border-stone-800 space-y-4 text-white dark:text-stone-900">
            {/* Sizing Header Row */}
            <div className="flex justify-between items-center border-b border-white/20 dark:border-stone-900/20 pb-3">
              <div>
                <p className="text-[10px] font-black text-yellow-950 dark:text-stone-800 uppercase tracking-widest opacity-80 leading-none mb-1 select-none">AWG Size Rating</p>
                <div className="flex items-center gap-1.5">
                  <span className={`font-black tracking-tight leading-none ${
                    layoutMode === 'scroll' ? 'text-3xl xs:text-4xl' : 'text-2xl'
                  }`}>
                    {WIRE_SIZE_DATA[selectedWireIndex].awg}
                  </span>
                  <button
                    onClick={() => handleCopy(WIRE_SIZE_DATA[selectedWireIndex].awg, 'wire-awg')}
                    className="p-1 rounded bg-white/20 dark:bg-stone-900/10 hover:bg-white/30 dark:hover:bg-stone-900/20 text-white dark:text-stone-900 transition-all active:scale-90 cursor-pointer"
                    title="Copy AWG naming"
                  >
                    {copiedKey === 'wire-awg' ? <Check size={11} className="text-white dark:text-stone-900 font-extrabold" /> : <Copy size={11} />}
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-yellow-950 dark:text-stone-800 uppercase tracking-widest opacity-80 leading-none mb-1 select-none">🇵🇭 PH Metric Eq.</p>
                <div className="flex items-center justify-end gap-1.5">
                  <span className={`font-black tracking-tight leading-none ${
                    layoutMode === 'scroll' ? 'text-3xl xs:text-4xl' : 'text-2xl'
                  }`}>
                    {WIRE_SIZE_DATA[selectedWireIndex].metricMm2}
                  </span>
                  <button
                    onClick={() => handleCopy(WIRE_SIZE_DATA[selectedWireIndex].metricMm2, 'wire-metric')}
                    className="p-1 rounded bg-white/20 dark:bg-stone-900/10 hover:bg-white/30 dark:hover:bg-stone-900/20 text-white dark:text-stone-900 transition-all active:scale-90 cursor-pointer"
                    title="Copy metric square millimeters"
                  >
                    {copiedKey === 'wire-metric' ? <Check size={11} className="text-white dark:text-stone-900 font-extrabold" /> : <Copy size={11} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Quick specifications grid */}
            <div className="grid grid-cols-2 gap-3 pb-1">
              {/* Solid Diameter */}
              <div className="bg-white/10 dark:bg-stone-900/5 p-2.5 rounded-xl border border-white/10 dark:border-stone-900/5">
                <span className="text-[9.5px] font-black text-yellow-950 dark:text-stone-850 uppercase tracking-wider block mb-1 opacity-80 select-none">Solid Core Diameter (Ø)</span>
                <p className="text-sm font-extrabold leading-none font-mono flex items-center justify-between">
                  <span>{WIRE_SIZE_DATA[selectedWireIndex].solidDiameter}</span>
                  <button
                    onClick={() => handleCopy(WIRE_SIZE_DATA[selectedWireIndex].solidDiameter, 'wire-solid-dia')}
                    className="opacity-75 hover:opacity-100 transition-opacity cursor-pointer p-0.5"
                    title="Copy solid core diameter"
                  >
                    {copiedKey === 'wire-solid-dia' ? <Check size={10} className="text-green-300" /> : <Copy size={10} />}
                  </button>
                </p>
              </div>

              {/* Stranded Diameter */}
              <div className="bg-white/10 dark:bg-stone-900/5 p-2.5 rounded-xl border border-white/10 dark:border-stone-900/5">
                <span className="text-[9.5px] font-black text-yellow-950 dark:text-stone-850 uppercase tracking-wider block mb-1 opacity-80 select-none">Stranded Core Diameter (Ø)</span>
                <p className="text-sm font-extrabold leading-none font-mono flex items-center justify-between">
                  <span>{WIRE_SIZE_DATA[selectedWireIndex].strandedDiameter}</span>
                  <button
                    onClick={() => handleCopy(WIRE_SIZE_DATA[selectedWireIndex].strandedDiameter, 'wire-stranded-dia')}
                    className="opacity-75 hover:opacity-100 transition-opacity cursor-pointer p-0.5"
                    title="Copy stranded core diameter"
                  >
                    {copiedKey === 'wire-stranded-dia' ? <Check size={10} className="text-green-300" /> : <Copy size={10} />}
                  </button>
                </p>
              </div>

              {/* Ampacity */}
              <div className="bg-white/10 dark:bg-stone-900/5 p-2.5 rounded-xl border border-white/10 dark:border-stone-900/5">
                <span className="text-[9.5px] font-black text-yellow-950 dark:text-stone-850 uppercase tracking-wider block mb-1 opacity-80 select-none">Safe Ampacity capacity</span>
                <p className="text-sm font-extrabold leading-none font-mono flex items-center justify-between">
                  <span>{WIRE_SIZE_DATA[selectedWireIndex].ampacity}</span>
                  <button
                    onClick={() => handleCopy(WIRE_SIZE_DATA[selectedWireIndex].ampacity, 'wire-ampacity')}
                    className="opacity-75 hover:opacity-100 transition-opacity cursor-pointer p-0.5"
                    title="Copy ampacity safe current"
                  >
                    {copiedKey === 'wire-ampacity' ? <Check size={10} className="text-green-300" /> : <Copy size={10} />}
                  </button>
                </p>
              </div>

              {/* Breaker Rating */}
              <div className="bg-white/10 dark:bg-stone-900/5 p-2.5 rounded-xl border border-white/10 dark:border-stone-900/5">
                <span className="text-[9.5px] font-black text-yellow-950 dark:text-stone-850 uppercase tracking-wider block mb-1 opacity-80 select-none">Recommended Breaker</span>
                <p className="text-sm font-extrabold leading-none font-mono flex items-center justify-between">
                  <span>{WIRE_SIZE_DATA[selectedWireIndex].breakerRating}</span>
                  <button
                    onClick={() => handleCopy(WIRE_SIZE_DATA[selectedWireIndex].breakerRating, 'wire-breaker')}
                    className="opacity-75 hover:opacity-100 transition-opacity cursor-pointer p-0.5"
                    title="Copy recommended breaker size"
                  >
                    {copiedKey === 'wire-breaker' ? <Check size={10} className="text-green-300" /> : <Copy size={10} />}
                  </button>
                </p>
              </div>
            </div>

            {/* Collapsible toggle for Extra Installation Specs */}
            <div className="pt-2 select-none">
              <button
                type="button"
                onClick={() => setShowWireDetails(!showWireDetails)}
                className="w-full py-2.5 px-3.5 rounded-xl bg-white/20 hover:bg-white/30 dark:bg-stone-900/10 dark:hover:bg-stone-900/20 text-[10.5px] font-black tracking-wider uppercase flex justify-between items-center transition-all cursor-pointer border border-white/10"
              >
                <span>{showWireDetails ? 'Hide Installation Notes' : 'Show Installation Notes & Keys'}</span>
                <span>{showWireDetails ? '▲' : '▼'}</span>
              </button>

              {showWireDetails && (
                <div className="mt-3.5 space-y-3.5 text-xs animate-[fadeIn_0.12s_ease-out] border-t border-white/20 dark:border-stone-900/20 pt-3.5">
                  {/* Conduit pipe pairing info */}
                  <div className="bg-white/10 dark:bg-stone-900/5 p-3 rounded-xl border border-white/10 dark:border-stone-900/5 text-xs">
                    <span className="text-[9.5px] font-black text-yellow-950 dark:text-stone-850 uppercase tracking-wider block mb-1 opacity-80 select-none">Recommended conduit pipe capacity</span>
                    <p className="font-bold leading-normal font-sans text-white dark:text-stone-900">
                      {WIRE_SIZE_DATA[selectedWireIndex].conduitPairing}
                    </p>
                  </div>

                  {/* Solid vs Stranded Handling Advice */}
                  <div className="bg-white/15 dark:bg-stone-900/10 p-3 rounded-2xl border border-white/10 dark:border-stone-900/10 text-xs">
                    <span className="text-[9.5px] font-black text-yellow-950 dark:text-stone-850 uppercase tracking-widest block mb-1 opacity-80 select-none">🛠️ solid vs stranded selection note:</span>
                    <p className="leading-relaxed font-bold font-sans text-white dark:text-stone-900 opacity-95">
                      {WIRE_SIZE_DATA[selectedWireIndex].solidStrandedNote}
                    </p>
                  </div>

                  {/* Application Recommendation */}
                  <div className="flex flex-col gap-1 text-xs pt-1.5 border-t border-white/20 dark:border-stone-900/20">
                    <span className="text-yellow-950 dark:text-stone-800 font-black uppercase tracking-wide opacity-80 select-none">Primary Household Application:</span>
                    <div className={`bg-white/20 dark:bg-stone-900/10 border border-white/10 dark:border-stone-900/10 rounded-xl font-black leading-relaxed flex items-start gap-2 shadow-inner ${
                      layoutMode === 'scroll' ? 'p-4 text-sm' : 'p-3 text-xs'
                    }`}>
                      <Zap size={layoutMode === 'scroll' ? 16 : 14} className="text-yellow-300 shrink-0 mt-0.5 fill-yellow-300 animate-pulse" />
                      <span>{WIRE_SIZE_DATA[selectedWireIndex].idealUse}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* --- PHILIPPINES LOCAL WIRE TYPES DICTIONARY REFERENCE PANEL --- */}
          {false && (
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-gray-150/80 dark:border-stone-800 p-4 xs:p-5 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100 dark:border-stone-800">
              <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-yellow-500">
                <Wrench size={14} />
              </span>
              <div>
                <h4 className="text-xs font-black text-gray-850 dark:text-stone-100 uppercase tracking-wider">
                  🇵🇭 Philippine Wiring Dictionary &amp; Specs
                </h4>
                <p className="text-[10px] text-gray-400 dark:text-stone-500">
                  Quick safety lookups, PEC definitions, and local trade descriptions
                </p>
              </div>
            </div>

            {/* Selector Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-stone-850">
              {[
                { id: 'all', label: 'All Compare' },
                { id: 'stranded', label: 'Stranded (THHN)' },
                { id: 'solid', label: 'Solid Core' },
                { id: 'pdx', label: 'PDX Cable' },
                { id: 'flatcord', label: 'Flat Cord / SPT' },
                { id: 'speaker', label: 'Speaker' },
                { id: 'welding', label: 'Welder' }
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setSelectedWireDictTab(pill.id)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap cursor-pointer transition-colors outline-none ${
                    selectedWireDictTab === pill.id
                      ? 'bg-amber-500 text-white dark:bg-yellow-500 dark:text-stone-950 font-black'
                      : 'bg-gray-50 hover:bg-gray-100 dark:bg-stone-850 dark:hover:bg-stone-800 text-gray-650 dark:text-stone-300'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            {selectedWireDictTab === 'all' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                {[
                  {
                    name: 'THHN / THWN-2 Stranded Core',
                    localName: 'Stranded / "Ugat"',
                    spec: 'Multiple bundled copper thread filaments inside dynamic PVC + protective nylon jacket.',
                    app: 'Main branch lines, outlets, lights, service feeders inside conduits. Standard code required format.',
                    rating: '600V, 90°C thermal threshold, moisture-resistant shield.'
                  },
                  {
                    name: 'TW / THW Solid Core',
                    localName: 'Solid / "Gisla" / Direct Wire',
                    spec: 'Single continuous heavy round copper core wrapped in thick insulation.',
                    app: 'Main solid bonding lines, short aerial drops, outdoor grounding plates, rigid static connections.',
                    rating: '600V, 60°C to 75°C threshold. Very stiff configuration.'
                  },
                  {
                    name: 'PDX Flat Sheathed Cable',
                    localName: 'PDX / Staple Cable / NMS',
                    spec: '2 parallel solid core or stranded PVC conductors bound together in a flat white outer PVC casing.',
                    app: 'Stapled flat on wood planks or boards (common in older homes or wood partitions).',
                    warning: '🔒 PEC Code Violation: Strictly forbidden to embed under concrete / plaster walls.'
                  },
                  {
                    name: 'Flat Cord (Type SPT Duplex)',
                    localName: 'Flatcord / Parallel appliance cable',
                    spec: 'Flexible dual-conductor stranded parallel strands molded together in premium rib rubber.',
                    app: 'Extension lines, desk fans, pendant hanging bulbs, portable stereo feeds.',
                    warning: '❌ Warning: Never route or embed behind solid walls or ceilings as static wiring.'
                  },
                  {
                    name: 'Speaker Cable / Clear Zip',
                    localName: 'Speaker Wire / Sound ribbon',
                    spec: 'Ultra-thin oxygen-free copper and tinned steel strands in premium transparent parallel jacket.',
                    app: 'Low-voltage high-fidelity speaker voice coil connections, home theaters, and public paging horns.',
                    rating: 'Low Voltage Only. Never connect to 220V standard mains power outlets!'
                  },
                  {
                    name: 'Welding Power Cable',
                    localName: 'Welder wire / Super-flexible link',
                    spec: 'Single thick core containing hundreds of micro-fine hair strands in durable synthetic elastic sheath.',
                    app: 'Welding machine torch ground feeds, battery booster links, large inverter backup grids.',
                    rating: 'Extremely high amp carrying capacity, superior wear-resistance.'
                  }
                ].map((wt) => (
                  <div key={wt.name} className="p-3 rounded-2xl bg-gray-50/50 dark:bg-stone-950/25 border border-gray-150/50 dark:border-stone-850 text-[11px] space-y-1.5 hover:shadow-xs transition-shadow">
                    <div className="flex justify-between items-start gap-1">
                      <span className="font-extrabold text-gray-850 dark:text-stone-200 block">{wt.name}</span>
                      <span className="bg-amber-500/10 dark:bg-yellow-500/10 text-amber-700 dark:text-yellow-405 font-black text-[8px] px-1.5 py-0.5 rounded leading-none shrink-0 tracking-wide uppercase">
                        {wt.localName}
                      </span>
                    </div>
                    <p className="text-gray-500 dark:text-stone-400 leading-relaxed font-semibold">Specs: {wt.spec}</p>
                    <p className="text-gray-550 dark:text-stone-305 leading-relaxed font-semibold">Usage: {wt.app}</p>
                    {wt.rating && <p className="text-[10px] text-gray-400 font-mono">Rating: {wt.rating}</p>}
                    {wt.warning && <p className="text-[9.5px] text-rose-600 dark:text-rose-400 font-bold bg-rose-500/5 p-1 rounded-md border border-rose-500/10 leading-tight">{wt.warning}</p>}
                  </div>
                ))}
              </div>
            )}

            {selectedWireDictTab === 'stranded' && (
              <div className="space-y-3 pt-1 text-[11px] animate-[fadeIn_0.1s_ease-out]">
                <div className="bg-amber-50/40 dark:bg-stone-950/30 p-3.5 rounded-2xl border border-amber-200/30 dark:border-stone-850">
                  <h5 className="font-extrabold text-amber-800 dark:text-yellow-405 text-xs uppercase tracking-wide">THHN / THWN-2 Stranded Core Copper Cables</h5>
                  <p className="text-gray-550 dark:text-stone-400 mt-1 leading-relaxed">
                    Composed of 7 to 19 bundle strands of raw high-purity copper core coated with PVC thermal insulation layer and wrapped in slick protective clear micro-thin Nylon cover (THHN sits for Thermoplastic High Heat-resistant Nylon).
                  </p>
                </div>
                <div className="bg-white dark:bg-stone-900 border border-gray-100 dark:border-stone-850 p-3 rounded-2xl space-y-2">
                  <span className="font-black text-gray-800 dark:text-stone-200 block">Why it is the Philippine Modern Standard:</span>
                  <ul className="list-disc pl-4 space-y-1 text-gray-500 dark:text-stone-400">
                    <li><strong className="text-gray-750 dark:text-stone-200">High Flexibility:</strong> Easily flows through tight plastic bend pipes or metal utility lines without snagging or ripping the jackets.</li>
                    <li><strong className="text-gray-750 dark:text-stone-200">Standard Wet Ratings:</strong> "THWN-2" indicates it is rated for both dry and completely safe subterranean wet conduits (ideal for PH flood-prone areas).</li>
                    <li><strong className="text-gray-750 dark:text-stone-200">Terminals:</strong> Excellent connection reliability inside screw clamp breakers.</li>
                  </ul>
                </div>
              </div>
            )}

            {selectedWireDictTab === 'solid' && (
              <div className="space-y-3 pt-1 text-[11px] animate-[fadeIn_0.1s_ease-out]">
                <div className="bg-amber-50/40 dark:bg-stone-950/30 p-3.5 rounded-2xl border border-amber-200/30 dark:border-stone-850">
                  <h5 className="font-extrabold text-amber-800 dark:text-yellow-405 text-xs uppercase tracking-wide">TW / THW Solid Core Utility Cables</h5>
                  <p className="text-gray-550 dark:text-stone-400 mt-1 leading-relaxed">
                    A single thick continuous solid copper rod conductor. Stiff, tough, and physically durable.
                  </p>
                </div>
                <div className="bg-white dark:bg-stone-900 border border-gray-100 dark:border-stone-850 p-3 rounded-2xl space-y-2">
                  <span className="font-black text-gray-800 dark:text-stone-200 block">Key Trade Realities &amp; Sizing Limits:</span>
                  <ul className="list-disc pl-4 space-y-1 text-gray-500 dark:text-stone-400">
                    <li><strong className="text-gray-750 dark:text-stone-200">Stiffness Constraint:</strong> Seldom installed inside standard thin PVC pipes for branch circuits because long runs produce high internal friction, risking physical jams.</li>
                    <li><strong className="text-gray-750 dark:text-stone-200">Local Best Uses:</strong> Generally limited to bare copper earthing/grounding wires, static short-length loop bridge frames, and overhead spans.</li>
                  </ul>
                </div>
              </div>
            )}

            {selectedWireDictTab === 'pdx' && (
              <div className="space-y-3 pt-1 text-[11px] animate-[fadeIn_0.1s_ease-out]">
                <div className="bg-rose-50/20 dark:bg-rose-950/10 p-3.5 rounded-2xl border border-rose-200/20 dark:border-rose-900/30">
                  <h5 className="font-extrabold text-rose-800 dark:text-rose-455 text-xs uppercase tracking-wide flex items-center gap-1.5">
                    ⚠️ PDX Twin Flat Sheathed Cable
                  </h5>
                  <p className="text-gray-650 dark:text-stone-400 mt-1 leading-relaxed">
                    Consists of two parallel insulated solid wires sealed inside an outer flat, clean white protective PVC jacket.
                  </p>
                </div>
                <div className="bg-white dark:bg-stone-900 border border-gray-100 dark:border-stone-850 p-3 rounded-2xl space-y-2 text-gray-500 dark:text-stone-400">
                  <span className="font-black text-gray-800 dark:text-stone-200 block">PEC Splicing Rules &amp; Limitations:</span>
                  <p className="leading-relaxed">
                    Traditionally staples directly onto residential timber walls in typical local homes because it lacks the need for conduit pipes.
                  </p>
                  <p className="font-bold text-rose-600 dark:text-rose-400 leading-relaxed bg-rose-500/5 p-2 rounded-xl border border-rose-100 dark:border-rose-950/30">
                    🚨 CRITICAL FIRE PREVENTION SAFETY: Never bury PDX cable beneath solid plaster walls, masonry blocks, or structural concrete pillars! High-humidity moisture trapping inside concrete can decay white sheaths over time, generating ground faults that trigger wall overheating.
                  </p>
                </div>
              </div>
            )}

            {selectedWireDictTab === 'flatcord' && (
              <div className="space-y-3 pt-1 text-[11px] animate-[fadeIn_0.1s_ease-out]">
                <div className="bg-amber-50/40 dark:bg-stone-950/30 p-3.5 rounded-2xl border border-amber-200/30 dark:border-stone-850">
                  <h5 className="font-extrabold text-amber-800 dark:text-yellow-405 text-xs uppercase tracking-wide">
                    Flat Cord (Duplex Type SPT-1 / SPT-2 Series)
                  </h5>
                  <p className="text-gray-550 dark:text-stone-400 mt-1 leading-relaxed">
                    Two insulated flexible parallel multi-strand conductors bound face-to-face in a single layer of colored rubber/insulator compound. Very flexible and highly portable.
                  </p>
                </div>
                <div className="bg-white dark:bg-stone-900 border border-gray-100 dark:border-stone-850 p-3 rounded-2xl space-y-2 text-gray-500 dark:text-stone-300">
                  <span className="font-black text-gray-800 dark:text-stone-200 block">Standard Sizing to Capacity:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
                    <div className="bg-gray-50 dark:bg-stone-950 p-2 rounded-xl border border-gray-100 dark:border-stone-850">
                      <span className="font-extrabold text-gray-850 dark:text-white block">#18 AWG flatcord (0.75 mm²)</span>
                      <span className="text-gray-400 block mt-0.5">Rating: 7A Maximum (1500 Watts approx)</span>
                      <span className="text-[9px] text-gray-450 block leading-tight mt-1">Best for small LED pendant globes, light desk fans, basic charger boards.</span>
                    </div>
                    <div className="bg-gray-50 dark:bg-stone-950 p-2 rounded-xl border border-gray-100 dark:border-stone-850">
                      <span className="font-extrabold text-gray-850 dark:text-white block">#16 AWG flatcord (1.25 mm²)</span>
                      <span className="text-gray-400 block mt-0.5">Rating: 10A Maximum (2200 Watts approx)</span>
                      <span className="text-[9px] text-gray-450 block leading-tight mt-1">Excellent for standard home extension boards, heavy pedestal air circulators, and stand lamps.</span>
                    </div>
                  </div>
                  <p className="font-bold text-amber-800 dark:text-yellow-405 leading-relaxed bg-amber-500/5 p-2 rounded-xl border border-amber-200/20 text-[10px] mt-1.5">
                    ⚠️ Cord Safety: Flat cords are strictly prohibited for routing inside building wall plaster, wall ceilings, or floor concrete. They are meant exclusively for external plug-and-use loads.
                  </p>
                </div>
              </div>
            )}

            {selectedWireDictTab === 'speaker' && (
              <div className="space-y-3 pt-1 text-[11px] animate-[fadeIn_0.1s_ease-out]">
                <div className="bg-amber-50/40 dark:bg-stone-950/30 p-3.5 rounded-2xl border border-amber-200/30 dark:border-stone-850">
                  <h5 className="font-extrabold text-amber-800 dark:text-yellow-405 text-xs uppercase tracking-wide">
                    Clear Audio Speaker Ribbon Wire
                  </h5>
                  <p className="text-gray-550 dark:text-stone-400 mt-1 leading-relaxed">
                    Duplex zip wiring composed of fine high-efficiency stranded copper or clad aluminum strands inside a transparent polymer outer jacket. Often distinctively marked with red/black tracer stripes or contrasting silver/gold tint wire fibers for perfect channel phase matching.
                  </p>
                </div>
                <div className="bg-white dark:bg-stone-900 border border-gray-100 dark:border-stone-850 p-3 rounded-2xl space-y-2">
                  <span className="font-black text-gray-800 dark:text-stone-200 block">Sizing Guide for Audio Systems:</span>
                  <ul className="list-disc pl-4 space-y-1 text-gray-550 dark:text-stone-400">
                    <li><strong className="text-gray-700 dark:text-stone-200">#18 AWG (0.75 mm²):</strong> Standard for minor local desktop monitors, home theater shelf audio, and paging satellite units.</li>
                    <li><strong className="text-gray-700 dark:text-stone-200">#16 AWG (1.25 mm²):</strong> Highly suggested for standard commercial amplifier to ceiling driver networks up to 15 meters.</li>
                    <li><strong className="text-gray-700 dark:text-stone-200">#14 AWG (2.00 mm²):</strong> Low impedance heavy audiophile links protecting high power floor cabinet subwoofers and concert arrays.</li>
                  </ul>
                  <p className="font-bold text-rose-500 dark:text-rose-400 leading-relaxed bg-rose-500/5 p-2 rounded-xl border border-rose-500/10 text-[9.5px]">
                    ⛔ DANGER: Speaker cables have extremely thin, low-voltage clear jackets. They must NEVER be connected to standard line-voltage (110V/220V) electrical outlets, as this will result in immediate jacket melting or flash explosion.
                  </p>
                </div>
              </div>
            )}

            {selectedWireDictTab === 'welding' && (
              <div className="space-y-3 pt-1 text-[11px] animate-[fadeIn_0.1s_ease-out]">
                <div className="bg-amber-50/40 dark:bg-stone-950/30 p-3.5 rounded-2xl border border-amber-200/30 dark:border-stone-850">
                  <h5 className="font-extrabold text-amber-800 dark:text-yellow-405 text-xs uppercase tracking-wide">
                    Super-Flexible Heavy Amp Welding Cables
                  </h5>
                  <p className="text-gray-550 dark:text-stone-400 mt-1 leading-relaxed">
                    Designed for heavy high-current arc welding systems. Consists of hundreds (sometimes thousands) of microscopically fine tinned copper hair-strands inside standard oil, grease, and ozone resistant EPDM premium rubber casing.
                  </p>
                </div>
                <div className="bg-white dark:bg-stone-900 border border-gray-100 dark:border-stone-850 p-3 rounded-2xl space-y-2 text-gray-500 dark:text-stone-400">
                  <span className="font-black text-gray-800 dark:text-stone-200 block">Why it excels at industrial heavy-demand jobs:</span>
                  <ul className="list-disc pl-4 space-y-1">
                    <li><strong className="text-gray-750 dark:text-stone-200">Superior Flexibility:</strong> Supple rubber core handles hundreds of heavy physical bends easily.</li>
                    <li><strong className="text-gray-750 dark:text-stone-200">Battery Bank Integration:</strong> Highly popular as heavy-duty jump cables and high-performance DC battery links between massive solar inverters and battery clusters.</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
          )}
        </div>
      )}

    </div>
  );
}
