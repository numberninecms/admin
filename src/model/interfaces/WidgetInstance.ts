/*
 * This file is part of the NumberNine package.
 *
 * (c) William Arin <williamarin.dev@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export default interface WidgetInstance {
    id: any;
    name: string;
    zone: string;
    position: string;
    fields: {
        [key: string]: any
    };
}
