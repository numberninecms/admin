/*
 * This file is part of the NumberNine package.
 *
 * (c) William Arin <williamarin.dev@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import Form from './Form';

export default interface Widget {
    id: any;
    name: string;
    slug: string;
    description?: string;
    form: Form;
}
