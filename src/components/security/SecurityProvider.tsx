import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useGeoLocation } from '@/hooks/useGeoLocation';
import { botDetector } from '@/utils/security/botDetector';
import { detectDevTools } from '@/utils/security/devtools';
import { preventRightClick, preventKeyboardShortcuts, preventFraming } from '@/utils/security/security';
import BlankScreen from './BlankScreen';
import RegionBlock from './RegionBlock';

interface SecurityState {
  isBot: boolean;
  botConfidence: number;
  isIndonesia: boolean;
  locationLoading: boolean;
  devToolsOpen: boolean;
  isSecure: boolean;
}

interface SecurityContextType extends SecurityState {
  recheckSecurity: () => void;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

interface SecurityProviderProps {
  children: ReactNode;
  enableGeoBlock?: boolean;
  enableBotDetection?: boolean;
  enableDevToolsProtection?: boolean;
  enableRightClickProtection?: boolean;
  enableKeyboardProtection?: boolean;
  enableFrameProtection?: boolean;
}

export const SecurityProvider: React.FC<SecurityProviderProps> = ({
  children,
  enableGeoBlock = false, // Disabled by default for development
  enableBotDetection = true,
  enableDevToolsProtection = false, // Disabled by default
  enableRightClickProtection = false, // Disabled by default
  enableKeyboardProtection = false, // Disabled by default
  enableFrameProtection = true,
}) => {
  const { isIndonesia, loading: locationLoading, error: locationError } = useGeoLocation();
  
  const [securityState, setSecurityState] = useState<SecurityState>({
    isBot: false,
    botConfidence: 0,
    isIndonesia: true,
    locationLoading: true,
    devToolsOpen: false,
    isSecure: true,
  });

  // Bot detection
  useEffect(() => {
    if (enableBotDetection) {
      const result = botDetector.detect();
      setSecurityState(prev => ({
        ...prev,
        isBot: result.isBot,
        botConfidence: result.confidence,
      }));

      if (result.isBot) {
        console.warn('Bot detected:', result.reasons);
      }
    }
  }, [enableBotDetection]);

  // Geo location update
  useEffect(() => {
    setSecurityState(prev => ({
      ...prev,
      isIndonesia: isIndonesia || locationError !== null, // Allow if error (fail-open)
      locationLoading,
    }));
  }, [isIndonesia, locationLoading, locationError]);

  // DevTools detection
  useEffect(() => {
    if (enableDevToolsProtection) {
      const checkDevTools = () => {
        const isOpen = detectDevTools();
        setSecurityState(prev => ({
          ...prev,
          devToolsOpen: isOpen,
        }));
      };

      checkDevTools();
      const interval = setInterval(checkDevTools, 1000);
      return () => clearInterval(interval);
    }
  }, [enableDevToolsProtection]);

  // Right click protection
  useEffect(() => {
    if (enableRightClickProtection) {
      preventRightClick();
    }
  }, [enableRightClickProtection]);

  // Keyboard shortcuts protection
  useEffect(() => {
    if (enableKeyboardProtection) {
      preventKeyboardShortcuts();
    }
  }, [enableKeyboardProtection]);

  // Frame protection
  useEffect(() => {
    if (enableFrameProtection) {
      preventFraming();
    }
  }, [enableFrameProtection]);

  // Update overall security status
  useEffect(() => {
    const isSecure = 
      !securityState.isBot && 
      (enableGeoBlock ? securityState.isIndonesia : true) &&
      !securityState.devToolsOpen;

    setSecurityState(prev => ({
      ...prev,
      isSecure,
    }));
  }, [securityState.isBot, securityState.isIndonesia, securityState.devToolsOpen, enableGeoBlock]);

  const recheckSecurity = () => {
    if (enableBotDetection) {
      const result = botDetector.detect();
      setSecurityState(prev => ({
        ...prev,
        isBot: result.isBot,
        botConfidence: result.confidence,
      }));
    }
  };

  // Show blank screen if bot detected
  if (securityState.isBot && enableBotDetection) {
    return <BlankScreen />;
  }

  // Show region block if not in Indonesia
  if (enableGeoBlock && !securityState.locationLoading && !securityState.isIndonesia) {
    return <RegionBlock />;
  }

  // Show blank screen if DevTools open
  if (enableDevToolsProtection && securityState.devToolsOpen) {
    return <BlankScreen />;
  }

  return (
    <SecurityContext.Provider
      value={{
        ...securityState,
        recheckSecurity,
      }}
    >
      {children}
    </SecurityContext.Provider>
  );
};

export const useSecurity = (): SecurityContextType => {
  const context = useContext(SecurityContext);
  if (context === undefined) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};

export default SecurityProvider;
