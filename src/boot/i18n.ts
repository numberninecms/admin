/*
 * This file is part of the NumberNine package.
 *
 * (c) William Arin <williamarin.dev@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import Vue from 'vue';
import VueI18n from 'vue-i18n';
import messages from 'src/i18n';

Vue.use(VueI18n);

const i18n = new VueI18n({
    locale: 'en-us',
    fallbackLocale: 'en-us',
    messages
});

export default ({ app }) => {
    // Set i18n instance on app
    app.i18n = i18n;
};

export { i18n };
