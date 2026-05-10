import { Colors } from '@/constants/theme';
import { useThemeContext } from '@/context/ThemeContext';

export function useTheme() {
  const { resolvedTheme } = useThemeContext();
  return Colors[resolvedTheme];
}
