/*
 * This file is part of the NumberNine package.
 *
 * (c) William Arin <williamarin.dev@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import ImageSizes from 'src/model/interfaces/ImageSizes';
import ContentEntity from './ContentEntity';

export default interface MediaFile extends ContentEntity {
    width: number;
    height: number;
    duration: number;
    path: string;
    mimeType: string;
    sizes: ImageSizes;
    slug: string;
    title: string;
    fileSize: number;
    alternativeText?: string;
    caption?: string;
    copyright?: string;
}
