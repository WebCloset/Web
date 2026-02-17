// Color Palette for WEB CLOSET
export const colors = {
  // Primary Colors
  primary: '#7fb069',
  primaryDark: '#6fa059',
  primaryLight: '#8fc079',

  // Neutral Colors
  white: '#ffffff',
  black: '#1a1a1a',
  grayDark: '#2a2a2a',
  grayMedium: '#3a3a3a',
  gray: '#4a4a4a',
  grayLight: '#d0d0d0',
  grayLighter: '#e0e0e0',
  grayLightest: '#f5f5f5',
  grayText: '#666',
  grayTextLight: '#999',

  // Product Background Colors
  productPurple: '#9b7fb8',
  productGreen: '#7fb069',
  productGray: '#f5f5f5',

  // Text Colors
  textPrimary: '#1a1a1a',
  textSecondary: '#666',
  textLight: '#999',
  textWhite: '#ffffff',
  textFooter: '#e0e0e0',

  // Border Colors
  border: '#e0e0e0',
  borderLight: '#d0d0d0',
} as const

export type ColorKey = keyof typeof colors



