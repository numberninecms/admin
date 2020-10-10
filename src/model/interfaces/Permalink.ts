/*
 * This file is part of the NumberNine package.
 *
 * (c) William Arin <williamarin.dev@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import ContentType from 'src/model/interfaces/ContentType';

export default interface Permalink {
    type: ContentType;
    permalink: string;
}
