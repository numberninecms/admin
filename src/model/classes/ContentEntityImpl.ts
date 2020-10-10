/*
 * This file is part of the NumberNine package.
 *
 * (c) William Arin <williamarin.dev@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import ContentEntity from 'src/model/interfaces/ContentEntity';
import GenericObject from 'src/model/interfaces/GenericObject';
import KeyValueEntity from 'src/model/interfaces/KeyValueEntity';
import MediaFile from 'src/model/interfaces/MediaFile';
import User from 'src/model/interfaces/User';

export default class ContentEntityImpl implements ContentEntity {
    public author: User;
    public content: string;
    public createdAt: Date;
    public customFields: GenericObject<any>;
    public excerpt: string;
    public featuredImage: MediaFile;
    public id: number;
    public publicUrl: string;
    public seoDescription: string;
    public seoTitle: string;
    public status: string;
    public title: string;
    public type: string;

    public getCustomField(key: string): KeyValueEntity<any> {
        let cf = this.customFieldsComputed.find((cf) => cf.key === key);

        if (!cf) {
            cf = this.customFieldsComputed.find((cf) => cf.key === '')!;
        }

        this.setCustomFieldKey(cf, key);

        return this.customFieldsComputed.find((cf) => cf.key === key)!;
    }

    public getCustomFieldValue(key: string): any {
        return this.customFieldsComputed.find((cf) => cf.key === key)?.value;
    }

    public setCustomFieldKey(customField: KeyValueEntity<any>, newKey: string): void {
        const customFields = this.customFieldsComputed;
        customFields.find((cf) => cf.key === customField.key)!.key = newKey;
        this.customFieldsComputed = customFields;
    }

    public setCustomFieldValue(key: string, newValue: any): void;
    public setCustomFieldValue(customField: KeyValueEntity<any>, newValue: any): void;
    public setCustomFieldValue(param: any, newValue: any): void {
        if (newValue === undefined) {
            this.deleteCustomField(param);
            return;
        }

        if (typeof param === 'string') {
            param = this.getCustomField(param);
        }

        const customFields = this.customFieldsComputed;
        customFields.find((cf) => cf.key === param.key)!.value = newValue;
        this.customFieldsComputed = customFields;
    }

    public deleteCustomField(key:string): void;
    public deleteCustomField(customField: KeyValueEntity<any>): void;
    public deleteCustomField(param: any): void {
        if (typeof param === 'string') {
            param = this.getCustomField(param);
        }

        const customFields = this.customFieldsComputed;
        customFields.splice(customFields.findIndex((cf) => cf.key === param.key), 1);
        this.customFieldsComputed = customFields;
    }

    public get customFieldsComputed(): KeyValueEntity<any>[] {
        const fields: KeyValueEntity<any>[] = [];

        if (this.customFields) {
            for (const key in this.customFields) {
                if (this.customFields.hasOwnProperty(key)) {
                    fields.push({key, value: this.customFields[key]});
                }
            }
        }

        fields.push({key: '', value: ''});

        return fields;
    }

    public set customFieldsComputed(value: KeyValueEntity<any>[]) {
        this.customFields = {};

        for (const cf of value) {
            if (cf.key.trim()) {
                this.customFields[cf.key] = cf.value;
            }
        }
    }
}
