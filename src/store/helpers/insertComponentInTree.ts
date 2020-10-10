/*
 * This file is part of the NumberNine package.
 *
 * (c) William Arin <williamarin.dev@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import PageComponent from 'src/model/interfaces/PageComponent';
import { DropPosition } from 'src/model/types/DropPosition';

export function insertComponentInTree(tree: PageComponent[], siblingId: string, componentToInsert: PageComponent, position: DropPosition): PageComponent[] {
    if (!siblingId) {
        tree.splice(tree.length, 0, componentToInsert);
    } else {
        for (const i in tree) {
            if (tree.hasOwnProperty(i)) {
                if (tree[i].id === siblingId) {
                    const increment = ['bottom', 'right'].includes(position) ? 1 : 0;
                    tree.splice(parseInt(i) + increment, 0, componentToInsert);
                    return tree;
                } else if (tree[i].children && tree[i].children.length > 0) {
                    tree[i].children = insertComponentInTree(tree[i].children, siblingId, componentToInsert, position);
                }
            }
        }
    }

    return tree;
}
