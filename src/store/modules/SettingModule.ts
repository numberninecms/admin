/*
 * This file is part of the NumberNine package.
 *
 * (c) William Arin <williamarin.dev@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import Setting from 'src/model/interfaces/Setting';
import { Vue } from 'vue-property-decorator';
import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import { axios, Routing } from 'src/utils/routing';
import { cloneDeep } from 'lodash';

@Module({ namespaced: true })
export default class SettingModule extends VuexModule {
    public settings: Setting[] = [];
    public settingsBackup: Setting[] = [];
    public colors: Setting[] = [];
    public hasChange = false;
    public querying = false;

    @Action
    public async querySettings(force: boolean) {
        if (!this.querying && (force || !(this.settings && this.settings.length > 0))) {
            this.context.commit('QUERYING');
            const response = await axios.get(Routing.generate('numbernine_admin_settings_get_collection'));
            this.context.commit('QUERYING_SUCCESS', {settings: response.data, settingsBackup: cloneDeep(response.data)});
            return;
        }

        this.context.commit('QUERYING_SUCCESS', {settings: this.settings, settingsBackup: this.settingsBackup});
    }

    @Action
    public async queryColors() {
        if (this.colors.length === 0) {
            const response = await axios.get(Routing.generate('numbernine_admin_theme_colors_get_collection'));
            this.context.commit('SET_COLORS', response.data);
        }
    }

    @Action
    public async saveSettings() {
        if (this.hasChange) {
            await axios.put(Routing.generate('numbernine_admin_settings_update_collection'), this.settings);
        }
        this.context.commit('BACKUP_SETTINGS');
    }

    @Action
    public restoreSettings() {
        this.context.commit('RESTORE_SETTINGS');
    }

    @Action
    public setSetting({name, value}) {
        this.context.commit('SET_SETTING', {name, value});
    }

    @Mutation
    public QUERYING() {
        this.querying = true;
    }

    @Mutation
    public QUERYING_SUCCESS(payload) {
        Vue.set(this, 'settings', payload.settings);
        Vue.set(this, 'settingsBackup', payload.settingsBackup);
        this.querying = false;
    }

    @Mutation
    public SET_COLORS(colors) {
        Vue.set(this, 'colors', colors);
    }

    @Mutation
    public RESTORE_SETTINGS() {
        Vue.set(this, 'settings', cloneDeep(this.settingsBackup));
    }

    @Mutation
    public BACKUP_SETTINGS() {
        Vue.set(this, 'settingsBackup', cloneDeep(this.settings));
    }

    @Mutation
    public SET_SETTING({name, value}) {
        let change = this.hasChange;
        const setting = this.settings.find((s) => s.name === name);

        if (setting) {
            if (typeof setting.value === 'object') {
                Vue.set(setting, 'value', value);
                change = true;
            } else if (setting.value !== value) {
                Vue.set(setting, 'value', value);
                change = true;
            }
        } else {
            this.settings.push({name, value});
            change = true;
        }

        this.hasChange = change;
    }

    public get getSettingValue() {
        return (name: string) => {
            const setting = this.settings.find((s) => s.name === name);
            return setting?.value;
        }
    }
}
