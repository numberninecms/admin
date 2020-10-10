/*
 * This file is part of the NumberNine package.
 *
 * (c) William Arin <williamarin.dev@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

declare module '*.vue' {
    import Vue from 'vue'
    export default Vue
}

declare module 'vue-code-diff' {
    import Vue from 'vue';
    export default class CodeDiff extends Vue { }
}
