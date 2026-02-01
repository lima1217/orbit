/**
 * Timezone information for living timezone mapping
 */
export interface TimezoneInfo {
    offset: number;      // UTC offset in hours (-12 to +14)
    city: string;        // Representative city name
    cityCN: string;      // City name (Chinese)
    country: string;     // Country name (English)
    countryCN: string;   // Country name (Chinese)
    emoji: string;       // Country flag emoji
}
