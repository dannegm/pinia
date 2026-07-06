import { createRootRoute, createRoute, createRouter, Outlet } from '@tanstack/react-router';
import { Providers } from '@/providers/providers';
import { MapShell } from '@/components/map-shell';
import { EmbedMapShell } from '@/components/embed-map-shell';
import { HomePage } from '@/pages/home';
import { PlacesPage } from '@/pages/places';
import { AddPlacePage } from '@/pages/places-new';
import { CategoriesPage } from '@/pages/categories';
import { AddCategoryPage } from '@/pages/categories-new';
import { EditCategoryPage } from '@/pages/categories-edit';
import { EditPlacePage } from '@/pages/places-edit';
import { SettingsPage } from '@/pages/settings';
import { NotFoundPage } from '@/pages/not-found';

const rootRoute = createRootRoute({
    component: () => (
        <Providers>
            <Outlet />
        </Providers>
    ),
});

const shellRoute = createRoute({
    getParentRoute: () => rootRoute,
    id: 'shell',
    component: MapShell,
    notFoundComponent: NotFoundPage,
});

const homeRoute = createRoute({ getParentRoute: () => shellRoute, path: '/', component: HomePage });
const placesRoute = createRoute({ getParentRoute: () => shellRoute, path: '/places', component: PlacesPage });
const addPlaceRoute = createRoute({
    getParentRoute: () => shellRoute,
    path: '/places/new',
    component: AddPlacePage,
});
const editPlaceRoute = createRoute({
    getParentRoute: () => shellRoute,
    path: '/places/$placeId/edit',
    component: EditPlacePage,
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
const editCategoryRoute = createRoute({
    getParentRoute: () => shellRoute,
    path: '/categories/$categoryId/edit',
    component: EditCategoryPage,
});
const settingsRoute = createRoute({
    getParentRoute: () => shellRoute,
    path: '/settings',
    component: SettingsPage,
});
const catchAllRoute = createRoute({ getParentRoute: () => shellRoute, path: '$', component: NotFoundPage });

const embedRoute = createRoute({ getParentRoute: () => rootRoute, path: '/embed', component: EmbedMapShell });

const routeTree = rootRoute.addChildren([
    shellRoute.addChildren([
        homeRoute,
        placesRoute,
        addPlaceRoute,
        editPlaceRoute,
        categoriesRoute,
        addCategoryRoute,
        editCategoryRoute,
        settingsRoute,
        catchAllRoute,
    ]),
    embedRoute,
]);

export const router = createRouter({ routeTree });
