/*
 * This file is part of the NumberNine package.
 *
 * (c) William Arin <williamarin.dev@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import PaginatedCollectionResponse from 'src/model/interfaces/PaginatedCollectionResponse';
import User from 'src/model/interfaces/User';

export default interface UserPage {
    startRow: number;
    fetchCount: number;
    filter: string;
    sortBy: string;
    descending: string;
    data: PaginatedCollectionResponse<User>;
    append: boolean;
}
