/*
 * This file is part of the NumberNine package.
 *
 * (c) William Arin <williamarin.dev@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import ContentEntity from 'src/model/interfaces/ContentEntity';
import ContentType from 'src/model/interfaces/ContentType';
import PaginatedCollectionResponse from 'src/model/interfaces/PaginatedCollectionResponse';

export default interface ContentTypePage {
    type: ContentType;
    startRow: number;
    fetchCount: number;
    filter: string;
    sortBy: string;
    descending: string;
    status: string;
    data: PaginatedCollectionResponse<ContentEntity>;
    append: boolean;
}
