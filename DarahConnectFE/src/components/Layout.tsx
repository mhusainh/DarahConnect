import React from 'react';
import Header from './Header';
import Footer from './Footer';
import WalletConnectBanner from './WalletConnectBanner';
import WalletDebugPanel from './WalletDebugPanel';

interface LayoutProps {
  children: React.ReactNode;
  showBanner?: boolean;
  showFooter?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  showBanner = true, 
  showFooter = true 
}) => {
  return (
    <>
      {showBanner && <WalletConnectBanner />}
      <Header />
      {children}
      {showFooter && <Footer />}
      {/* <WalletDebugPanel /> */}
    </>
  );
};

export default Layout; 