import { useAuthContext } from '../lib/auth-context.tsx';

export function useAuth() {
  return useAuthContext();
}
