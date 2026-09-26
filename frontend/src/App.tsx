import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './lib/auth-context.tsx';
import { LanguageProvider } from './lib/i18n.tsx';
import { router } from './router.tsx';

export function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <RouterProvider router={router} />
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;
