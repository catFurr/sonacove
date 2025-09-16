import { useEffect } from 'react';
import { getUserManager } from '../../../utils/oidc-client';

const SilentRenew: React.FC = () => {
  useEffect(() => {
    getUserManager()
      .signinSilentCallback()
      .catch((err) => {
        console.error('Silent renew error:', err);
      });
  }, []);

  return <div style={{ display: 'none' }} />;
};

export default SilentRenew;
