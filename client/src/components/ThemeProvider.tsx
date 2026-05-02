import { useEffect, ReactNode } from 'react';
import type { InvitationData } from '../types';

interface ThemeProviderProps {
  invitation: InvitationData;
  children: ReactNode;
}

export default function ThemeProvider({ invitation, children }: ThemeProviderProps) {
  useEffect(() => {
    const root = document.documentElement;

    // Apply primary color
    if (invitation.primaryColor) {
      root.style.setProperty('--color-primary', invitation.primaryColor);
      root.style.setProperty('--tw-color-primary', invitation.primaryColor);
    }

    // Apply secondary color
    if (invitation.secondaryColor) {
      root.style.setProperty('--color-secondary', invitation.secondaryColor);
      root.style.setProperty('--tw-color-secondary', invitation.secondaryColor);
    }

    // Apply font family
    if (invitation.fontFamily) {
      root.style.setProperty('--font-display', invitation.fontFamily);
    }

    return () => {
      // Reset to defaults on unmount
      root.style.removeProperty('--color-primary');
      root.style.removeProperty('--color-secondary');
      root.style.removeProperty('--font-display');
    };
  }, [invitation.primaryColor, invitation.secondaryColor, invitation.fontFamily]);

  return <>{children}</>;
}
