/*
 * This file is part of the NumberNine package.
 *
 * (c) William Arin <williamarin.dev@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export function readableBytes(bytes: number) {
    const i: number = Math.floor(Math.log(bytes) / Math.log(1024));
    const sizes: any = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    return ((bytes / Math.pow(1024, i)).toFixed(2) as any as number) + ' ' + sizes[i];
}

export function basename(path) {
    return path.replace(/\\/g,'/').replace( /.*\//, '' );
}

export function dirname(path) {
    return path.replace(/\\/g,'/').replace(/\/[^/]*$/, '');
}
