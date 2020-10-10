/*
 * This file is part of the NumberNine package.
 *
 * (c) William Arin <williamarin.dev@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';

const SettingStore = namespace('Setting');

export default class SettingsBaseComponent extends Vue {
    @SettingStore.Getter protected getSettingValue;
    @SettingStore.Action protected setSetting;
    @SettingStore.Action protected saveSettings;

    protected getSettingAs(name: string, type = 'string') {
        const value = this.getSettingValue(name);

        if (value !== null && value !== undefined) {
            switch (type) {
                case 'number':
                    return parseInt(value);
                default:
                    return value;
            }
        }

        return null;
    }

    protected async setSettingAs<T>(name: string, value: T|null) {
        await this.setSetting({name, value});
    }
}
