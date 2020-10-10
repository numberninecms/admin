/*
 * This file is part of the NumberNine package.
 *
 * (c) William Arin <williamarin.dev@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { RouteConfig } from 'vue-router';

const routes: RouteConfig[] = [];

export const adminRoutes: RouteConfig[] = [
    {
        path: '/',
        component: () => import('layouts/DefaultLayout.vue'),
        children: [
            { path: '', component: () => import('pages/Index.vue') },
            { path: 'media/', component: () => import('pages/medialibrary/MediaLibraryIndex.vue') },
            { path: 'users/', component: () => import('pages/user/UserIndex.vue')},
            { path: 'users/roles/', component: () => import('pages/user/RoleIndex.vue')},
            {
                path: 'users/new',
                name: 'user_create',
                component: () => import('pages/user/UserEdit.vue'),
            },
            {
                path: 'users/:id',
                name: 'user_edit',
                component: () => import('pages/user/UserEdit.vue'),
                props: (route) => ({ id: route.params.id })
            },
            { path: 'settings/', redirect: { name: 'settings', params: { page: 'general' } } },
            { path: 'settings/:page/', name: 'settings', component: () => import('pages/settings/Settings.vue'), props: (route) => ({ page: route.params.page }) },
            { path: 'settings/commerce/', component: () => import('pages/settings/commerce/CommerceSettingsGeneral.vue')},
            {
                path: 'customizer/:area',
                component: () => import('pages/customizer/AreaEdit.vue'),
                props: (route) => ({ area: route.params.area })
            },
            { path: 'customizer/', component: () => import('pages/customizer/AreaIndex.vue')},
            { path: 'menus/', component: () => import('pages/menu/MenuIndex.vue')},
            {
                path: 'taxonomy/:taxonomy/:id',
                name: 'term_edit',
                component: () => import('pages/content/TaxonomyIndex.vue'),
                props: (route) => ({ taxonomy: route.params.taxonomy, id: route.params.id })
            },
            {
                path: 'taxonomy/:taxonomy',
                name: 'taxonomy_index',
                component: () => import('pages/content/TaxonomyIndex.vue'),
                props: (route) => ({ taxonomy: route.params.taxonomy })
            },
        ]
    }
];

// Always leave this as last one
if (process.env.MODE !== 'ssr') {
    routes.push({
        path: '*',
        component: () => import('pages/Error404.vue')
    });
}

export default routes;
