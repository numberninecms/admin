/*
 * This file is part of the NumberNine package.
 *
 * (c) William Arin <williamarin.dev@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import PageComponent from 'src/model/interfaces/PageComponent';
import { extend } from 'quasar';
import { assignNewUidToTree } from 'src/store/helpers/assignNewIdToTree';

export function duplicateComponentInTree(tree: PageComponent[], componentToDuplicate: PageComponent): PageComponent[] {
    for (const i in tree) {
        if (tree.hasOwnProperty(i)) {
            if (tree[i].id === componentToDuplicate.id) {
                const newComponent: PageComponent = extend(true, {}, componentToDuplicate);
                assignNewUidToTree([newComponent]);
                tree.splice(parseInt(i) + 1, 0, newComponent);
                return tree;
            } else if (tree[i].children && tree[i].children.length > 0) {
                tree[i].children = duplicateComponentInTree(tree[i].children, componentToDuplicate);
            }
        }
    }

    return tree;
}
