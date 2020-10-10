/*
 * This file is part of the NumberNine package.
 *
 * (c) William Arin <williamarin.dev@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import axios, { AxiosRequestConfig } from 'axios';
import PaginatedCollectionResponse from '../model/interfaces/PaginatedCollectionResponse';

export interface AxiosGenericInterface {
    getCollection<T>(url: string, data?: any): Promise<PaginatedCollectionResponse<T>>;
    getItem<T>(url: string, data?: any): Promise<T>;
    postItem<T>(url: string, data?: any): Promise<T>;
}

export default class AxiosGeneric implements AxiosGenericInterface {
    private requestCollection<T>(options: AxiosRequestConfig): Promise<PaginatedCollectionResponse<T>> {
        return axios.request<T>(options).then<PaginatedCollectionResponse<T>>((response) => response.data as unknown as PaginatedCollectionResponse<T>);
    }

    private requestItem<T>(options: AxiosRequestConfig): Promise<T> {
        return axios.request<T>(options).then<T>((response) => response.data);
    }

    public getCollection<T>(url: string, data?: any): Promise<PaginatedCollectionResponse<T>> {
        return this.requestCollection<T>({method: 'GET', url, data});
    }

    public getItem<T>(url: string, data?: any): Promise<T> {
        return this.requestItem<T>({method: 'GET', url, data});
    }

    public postItem<T>(url: string, data?: any): Promise<T> {
        return this.requestItem<T>({method: 'POST', url, data});
    }

    public async putItem<T>(url: string, data?: any): Promise<Promise<any>> {
        return this.requestItem<T>({method: 'PUT', url, data});
    }
}
