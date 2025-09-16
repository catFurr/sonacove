import { useEffect } from 'react';
import { userManager } from '../../../utils/oidc-client';

const SilentRenew: React.FC = () => {
  useEffect(() => {
    userManager
      .signinSilentCallback()
      .catch((err) => {
        console.error('Silent renew error:', err);
      });
  }, []);

  return <div style={{ display: 'none' }} />;
};

export default SilentRenew;
