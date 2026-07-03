import { createRootRoute, createRoute, createRouter, Outlet } from '@tanstack/react-router';
import { Providers } from '@/providers/providers';
import { HomePage } from '@/pages/home';

const rootRoute = createRootRoute({
    component: () => (
        <Providers>
            <Outlet />
        </Providers>
    ),
});

const homeRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', component: HomePage });

const routeTree = rootRoute.addChildren([homeRoute]);

export const router = createRouter({ routeTree });
