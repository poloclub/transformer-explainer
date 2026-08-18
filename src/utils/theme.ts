/**
 * Centralized Tailwind theme — resolved once, imported everywhere.
 * Avoids calling resolveConfig(tailwindConfig) 14+ times across the codebase.
 */
import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '../../tailwind.config';

const { theme } = resolveConfig(tailwindConfig);

export { theme };
