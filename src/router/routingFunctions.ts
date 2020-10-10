/*
 * This file is part of the NumberNine package.
 *
 * (c) William Arin <williamarin.dev@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import AdminMenuItem from '../model/interfaces/AdminMenuItem';
import { RouteConfig } from 'vue-router';

export function getContentEntityRoutes(menuItems: {[key: string]: AdminMenuItem}): RouteConfig[] {
    const contentEntityRoutes: RouteConfig[] = [];

    for (const menuItem in menuItems) {
        if (menuItems.hasOwnProperty(menuItem) && menuItem.includes('_entity')) {
            const customType: string = menuItem.substring(0, menuItem.indexOf('_entity'));
            const indexPath = menuItems[menuItem].link;
            const newPath = indexPath + 'new';
            const editPath = indexPath + ':id(\\d+)';
            const editClassicPath = editPath + '/classic';

            contentEntityRoutes.push(...[
                {
                    name: customType + '_index',
                    path: indexPath,
                    component: () => import('pages/content/ContentIndex.vue'),
                    props: { type: customType }
                },
                {
                    name: customType + '_new',
                    path: newPath,
                    component: () => import('pages/content/ContentEdit.vue'),
                    props: { type: customType }
                },
                {
                    name: customType + '_edit_classic',
                    path: editClassicPath,
                    component: () => import('pages/content/ContentEditClassic.vue'),
                    props: (route) => ({ id: route.params.id, type: customType })
                },
                {
                    name: customType + '_edit',
                    path: editPath,
                    component: () => import('pages/content/ContentEdit.vue'),
                    props: (route) => ({ id: route.params.id, type: customType })
                }
            ]);
        }
    }

    return contentEntityRoutes;
}
