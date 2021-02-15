/*
 * This file is part of the NumberNine package.
 *
 * (c) William Arin <williamarin.dev@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import GenericObject from 'src/model/interfaces/GenericObject';
import KeyValueEntity from 'src/model/interfaces/KeyValueEntity';
import MediaFile from 'src/model/interfaces/MediaFile';
import Term from 'src/model/interfaces/Term';
import User from 'src/model/interfaces/User';

export default interface ContentEntity {
    id: number;
    type: string;
    title: string;
    slug: string;
    author: User;
    publicUrl: string;
    createdAt: Date;
    status: string;
    customFields?: GenericObject<any>;
    customFieldsComputed: KeyValueEntity<any>[];
    featuredImage?: MediaFile;
    seoTitle?: string;
    seoDescription?: string;
    content?: string;
    excerpt?: string;
    terms?: Term[];

    getCustomField(key: string): KeyValueEntity<any>;
    getCustomFieldValue(key: string): any;
    setCustomFieldKey(customField: KeyValueEntity<any>, newKey: string): void;
    setCustomFieldValue(key: string, newValue: any): void;
    setCustomFieldValue(customField: KeyValueEntity<any>, newValue: any): void;
    deleteCustomField(key: string): void;
    deleteCustomField(customField: KeyValueEntity<any>): void;
}
