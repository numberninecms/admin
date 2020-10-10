/*
 * This file is part of the NumberNine package.
 *
 * (c) William Arin <williamarin.dev@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { uid } from 'quasar';
import PageComponent from 'src/model/interfaces/PageComponent';

export function assignNewUidToTree(tree: PageComponent[]) {
    tree.forEach((pageComponent) => {
        pageComponent.id = uid();

        if (pageComponent.children && pageComponent.children.length > 0) {
            assignNewUidToTree(pageComponent.children);
        }
    });
}
