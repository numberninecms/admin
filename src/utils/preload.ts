/*
 * This file is part of the NumberNine package.
 *
 * (c) William Arin <williamarin.dev@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import * as preloaders from 'src/model/preloaders/preloaders';
import * as changeCase from 'change-case';
import Preloader from 'src/model/interfaces/Preloader';
import PageComponent from 'src/model/interfaces/PageComponent';
import store from 'src/store';

export default function preload(component: PageComponent) {
    const pascalName = changeCase.pascalCase(component.name);

    if (typeof preloaders[pascalName + 'Preloader'] === 'function') {
        const preloader: Preloader = new preloaders[pascalName + 'Preloader'](component, store);
        preloader.preload();
    }
}
