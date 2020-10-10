/*
 * This file is part of the NumberNine package.
 *
 * (c) William Arin <williamarin.dev@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import PageComponent from 'src/model/interfaces/PageComponent';

export function removeComponentInTree(tree: PageComponent[], componentToRemoveId: string): PageComponent[] {
    for (const i in tree) {
        if (tree.hasOwnProperty(i)) {
            if (tree[i].id === componentToRemoveId) {
                tree.splice(parseInt(i), 1);
                return tree;
            } else if (tree[i].children && tree[i].children.length > 0) {
                tree[i].children = removeComponentInTree(tree[i].children, componentToRemoveId);
            }
        }
    }

    return tree;
}
