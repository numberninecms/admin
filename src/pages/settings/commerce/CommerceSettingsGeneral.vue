<!--
  - This file is part of the NumberNine package.
  -
  - (c) William Arin <williamarin.dev@gmail.com>
  -
  - For the full copyright and license information, please view the LICENSE
  - file that was distributed with this source code.
  -->

<template>
    <q-page>
        <div class="q-ma-md row" style="padding-top: 42px">
            <div class="col-md-4 col-sm-6 col-xs q-gutter-md">
                <q-select v-model="pageForShop" label="Shop page" :options="pages" option-value="id" option-label="title" map-options emit-value />
            </div>
        </div>
        <q-page-sticky expand position="top">
            <q-toolbar class="bg-primary text-white">
                <q-toolbar-title>
                    Commerce settings
                </q-toolbar-title>
            </q-toolbar>
        </q-page-sticky>
    </q-page>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import ContentEntity from '../../../model/interfaces/ContentEntity';
import { axios, Routing } from '../../../utils/routing';

@Component
export default class CommerceSettingsGeneral extends Vue {
    private pages: ContentEntity[] = [];
    private settings: {name: string, value: any}[] = [];

    private created() {
        axios.get(Routing.generate('numbernine_admin_commerce_settings_get_collection'))
            .then((response) => {
                this.settings = response.data;
            });
        axios.get(Routing.generate('numbernine_admin_contententity_get_collection', {type: 'page', status: 'publish', orderBy: 'title', order: 'asc'}))
            .then((response) => {
                this.pages = response.data.collection;
            });
    }

    private get pageForShop(): number|null {
        return this.getSettingAsInteger('page_for_shop');
    }

    private set pageForShop(value: number|null) {
        this.setSettingAsInteger('page_for_shop', value);
    }

    private getSettingAsInteger(settingName: string) {
        const setting = this.settings.find((s) => s.name === settingName);

        if (setting && setting.value !== null) {
            return parseInt(setting.value);
        }

        return null;
    }

    private setSettingAsInteger(settingName: string, settingValue: number|null) {
        const setting = this.settings.find((s) => s.name === settingName);

        if (!setting) {
            this.settings.push({name: settingName, value: settingValue});
        } else if (settingValue as number !== setting.value as number) {
            setting.value = settingValue;
        } else {
            return;
        }

        this.onSettingsChange();
    }

    private onSettingsChange() {
        axios.post(Routing.generate('numbernine_admin_commerce_settings_update_collection'), this.settings);
    }
}
</script>
