import { createRootRoute, createRoute, createRouter, Outlet } from '@tanstack/react-router';
import { Providers } from '@/providers/providers';
import { MapShell } from '@/components/map-shell';
import { HomePage } from '@/pages/home';
import { SearchPage } from '@/pages/search';
import { PlacesPage } from '@/pages/places';
import { AddPlacePage } from '@/pages/places-new';
import { CategoriesPage } from '@/pages/categories';
import { AddCategoryPage } from '@/pages/categories-new';
import { SettingsPage } from '@/pages/settings';

const rootRoute = createRootRoute({
    component: () => (
        <Providers>
            <Outlet />
        </Providers>
    ),
});

const shellRoute = createRoute({ getParentRoute: () => rootRoute, id: 'shell', component: MapShell });

const homeRoute = createRoute({ getParentRoute: () => shellRoute, path: '/', component: HomePage });
const searchRoute = createRoute({ getParentRoute: () => shellRoute, path: '/search', component: SearchPage });
const placesRoute = createRoute({ getParentRoute: () => shellRoute, path: '/places', component: PlacesPage });
const addPlaceRoute = createRoute({
    getParentRoute: () => shellRoute,
    path: '/places/new',
    component: AddPlacePage,
});
const categoriesRoute = createRoute({
    getParentRoute: () => shellRoute,
    path: '/categories',
    component: CategoriesPage,
});
const addCategoryRoute = createRoute({
    getParentRoute: () => shellRoute,
    path: '/categories/new',
    component: AddCategoryPage,
});
const settingsRoute = createRoute({
    getParentRoute: () => shellRoute,
    path: '/settings',
    component: SettingsPage,
});

const routeTree = rootRoute.addChildren([
    shellRoute.addChildren([
        homeRoute,
        searchRoute,
        placesRoute,
        addPlaceRoute,
        categoriesRoute,
        addCategoryRoute,
        settingsRoute,
    ]),
]);

export const router = createRouter({ routeTree });
