/*
 * This file is part of the NumberNine package.
 *
 * (c) William Arin <williamarin.dev@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import PageComponent from 'src/model/interfaces/PageComponent';

export function prepareTree(tree: PageComponent[], parent: PageComponent | undefined = undefined) {
    for (const i in tree) {
        if (tree.hasOwnProperty(i)) {
            tree[i].parentId = parent ? parent.id : undefined;
            tree[i].computed = {};

            if (tree[i].children) {
                prepareTree(tree[i].children, tree[i]);
            }
        }
    }
}
