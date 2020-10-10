/*
 * This file is part of the NumberNine package.
 *
 * (c) William Arin <williamarin.dev@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export default async function externalComponent(url): Promise<any> {
    const name = url.split('/').reverse()[0].match(/^(.*?)\.umd/)[1];

    if (window[name]) {
        return window[name];
    }

    (window as any)[name] = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.async = true;
        script.addEventListener('load', () => {
            resolve(window[name]);
        });
        script.addEventListener('error', () => {
            reject(new Error(`Error loading ${url}`));
        });
        script.src = url;
        document.head.appendChild(script);
    });

    return window[name];
}
