import { useState, useEffect } from 'react';

declare global {
  interface Window {
    google: any;
    googleSignInCallback: (response: any) => void;
  }
}

interface GoogleUser {
  id: string;
  name: string;
  email: string;
  picture: string;
  given_name: string;
  family_name: string;
}

interface UseGoogleAuthReturn {
  isLoaded: boolean;
  signIn: () => void;
  signOut: () => void;
  user: GoogleUser | null;
  isSignedIn: boolean;
}

export const useGoogleAuth = (): UseGoogleAuthReturn => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    // Load Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      // Initialize Google Identity Services
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: '1058825053423-ckc3s54kh7mblj4bsm06i6j5e5l6n6j5.apps.googleusercontent.com', // Demo client ID for testing
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true
        });
        setIsLoaded(true);
      }
    };
    document.head.appendChild(script);

    // Cleanup function
    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const handleCredentialResponse = (response: any) => {
    try {
      // Decode JWT token to get user info
      const payload = JSON.parse(atob(response.credential.split('.')[1]));
      const googleUser: GoogleUser = {
        id: payload.sub,
        name: payload.name,
        email: payload.email,
        picture: payload.picture,
        given_name: payload.given_name,
        family_name: payload.family_name
      };
      
      setUser(googleUser);
      setIsSignedIn(true);
      
      // Store in localStorage for persistence
      localStorage.setItem('googleUser', JSON.stringify(googleUser));
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userEmail', googleUser.email);
      localStorage.setItem('userName', googleUser.name);
      localStorage.setItem('authMethod', 'google');
      
      console.log('Google sign-in successful:', googleUser);
    } catch (error) {
      console.error('Error processing Google sign-in:', error);
    }
  };

  const signIn = () => {
    if (window.google && isLoaded) {
      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          console.log('Google sign-in prompt not displayed or skipped');
        }
      });
    }
  };

  const signOut = () => {
    setUser(null);
    setIsSignedIn(false);
    localStorage.removeItem('googleUser');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('authMethod');
    
    if (window.google) {
      window.google.accounts.id.disableAutoSelect();
    }
  };

  // Check for existing Google user on hook initialization
  useEffect(() => {
    const storedUser = localStorage.getItem('googleUser');
    const authMethod = localStorage.getItem('authMethod');
    
    if (storedUser && authMethod === 'google') {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsSignedIn(true);
      } catch (error) {
        console.error('Error parsing stored Google user:', error);
      }
    }
  }, []);

  return {
    isLoaded,
    signIn,
    signOut,
    user,
    isSignedIn
  };
}; 