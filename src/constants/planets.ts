export interface Planet {
    id: string;
    name: string;
    period: number; // Hours in a "day"
    description: string;
    color: string;
    // Layout properties for 3D floating effect
    position: { x: number; y: number }; // Relative position (0-100%)
    depth: 'far' | 'mid' | 'near';       // Depth layer
    size: number;                         // Relative size (0.6-1.2)
}

export const PLANETS: Planet[] = [
    {
        id: 'neptune',
        name: 'Neptune',
        period: 16,
        description: 'Dreamy & Romantic · Blur the line between reality and dreams',
        color: '#7FA1C3',
        position: { x: 22, y: 18 },
        depth: 'far',
        size: 0.7
    },
    {
        id: 'jupiter',
        name: 'Jupiter',
        period: 10,
        description: 'Lucky & Expansive · Live each day at double intensity',
        color: '#E0AE6F',
        position: { x: 12, y: 42 },
        depth: 'mid',
        size: 0.9
    },
    {
        id: 'earth',
        name: 'Earth',
        period: 24,
        description: 'Grounded & Stable · The rhythm you naturally resonate with',
        color: '#4B9CD3',
        position: { x: 50, y: 48 },
        depth: 'mid',
        size: 1.0
    },
    {
        id: 'eris',
        name: 'Eris',
        period: 25.9,
        description: 'Undefined & Free · Create your own rhythm',
        color: '#B8A9C9',
        position: { x: 82, y: 32 },
        depth: 'mid',
        size: 0.85
    },
    {
        id: 'mars',
        name: 'Mars',
        period: 24.6,
        description: 'Driven & Passionate · An extra 36 minutes to breathe',
        color: '#E27B58',
        position: { x: 25, y: 72 },
        depth: 'near',
        size: 1.1
    },
    {
        id: 'custom',
        name: 'Custom',
        period: 30,
        description: 'Your Universe · Design your own orbit',
        color: '#D4AF37',
        position: { x: 78, y: 68 },
        depth: 'near',
        size: 1.0
    }
];
