export interface CwParticleBackgroundProps {
  width?: string
  height?: string
  count?: number
  maxSize?: number
  speed?: number
  connectionRadius?: number
  connectionOpacity?: number
  colors?: string[]
  class?: string
}

export interface CwParticleBackgroundStyles {
  root: string;
  canvas: string;
  overlay?: string;
  content?: string;
  loading?: string;
  loadingSpinner?: string;
  loadingText?: string;
  error?: string;
  errorIcon?: string;
  errorText?: string;
  retryButton?: string;
}

export interface CwParticleBackgroundTexts {
  // Placeholder for texts
}