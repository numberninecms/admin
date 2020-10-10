/*
 * This file is part of the NumberNine package.
 *
 * (c) William Arin <williamarin.dev@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import DynamicComponent from 'src/model/interfaces/DynamicComponent';

export default interface Tab {
    name: string;
    icon: string;
    label: string;
    panel: DynamicComponent;
    visible?: (instance) => boolean;
}
