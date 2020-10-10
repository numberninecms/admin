/*
 * This file is part of the NumberNine package.
 *
 * (c) William Arin <williamarin.dev@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { uid } from 'quasar';
import MenuItem from 'src/model/interfaces/MenuItem';

export function setMenuItemsUid(menuItems: MenuItem[]): MenuItem[] {
    return menuItems.map((menuItem) => {
        menuItem.uid = uid();

        if (menuItem.children && menuItem.children.length > 0) {
            menuItem.children = setMenuItemsUid(menuItem.children);
        }

        return menuItem;
    });
}
