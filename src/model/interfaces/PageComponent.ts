/*
 * This file is part of the NumberNine package.
 *
 * (c) William Arin <williamarin.dev@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export type Direction = 'top' | 'bottom' | 'left' | 'right';

export default interface PageComponent {
    id: string;
    name: string;
    parameters: {
        [key: string]: any
    };
    computed: {
        [key: string]: any
    };
    position: number;
    label: string;
    icon?: string;
    avatar?: string;
    children: PageComponent[];
    parentId: string | undefined;
    siblingsPosition: Direction[];
    siblingsShortcodes: string[];
    editable: boolean;
    container: boolean;
    visibility?: {
        [key: string]: boolean
    };
    responsive: string[];
}
