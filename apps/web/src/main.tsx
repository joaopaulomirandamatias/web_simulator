import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { App } from './App.tsx';
import './index.css';

const Home = lazy(() => import('./pages/Home.tsx').then((m) => ({ default: m.Home })));
const InputsPage = lazy(() =>
  import('./pages/Inputs.tsx').then((m) => ({ default: m.InputsPage })),
);
const Result = lazy(() => import('./pages/Result.tsx').then((m) => ({ default: m.Result })));
const HistoryPage = lazy(() =>
  import('./pages/History.tsx').then((m) => ({ default: m.History })),
);
const Dashboard = lazy(() =>
  import('./pages/Dashboard.tsx').then((m) => ({ default: m.Dashboard })),
);
const Login = lazy(() => import('./pages/Login.tsx').then((m) => ({ default: m.Login })));
const AiTest = lazy(() => import('./pages/AiTest.tsx').then((m) => ({ default: m.AiTest })));

const Fallback = () => (
  <div className="card" role="status" aria-live="polite">
    …
  </div>
);

const withSuspense = (node: React.ReactNode) => <Suspense fallback={<Fallback />}>{node}</Suspense>;

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: withSuspense(<Home />) },
      { path: 'simulate', element: withSuspense(<InputsPage />) },
      { path: 'result', element: withSuspense(<Result />) },
      { path: 'history', element: withSuspense(<HistoryPage />) },
      { path: 'dashboard', element: withSuspense(<Dashboard />) },
      { path: 'login', element: withSuspense(<Login />) },
      { path: 'ai-test', element: withSuspense(<AiTest />) },
    ],
  },
]);

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, refetchOnWindowFocus: false } },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>,
);
