<!--
  - This file is part of the NumberNine package.
  -
  - (c) William Arin <williamarin.dev@gmail.com>
  -
  - For the full copyright and license information, please view the LICENSE
  - file that was distributed with this source code.
  -->

<template>
    <div v-if="permalinks">
        <div class="column q-gutter-y-md">
            <q-banner>
                <template v-slot:avatar>
                    <q-icon name="mdi-information-outline" color="primary" />
                </template>
                <p>Available placeholders : <q-badge class="q-mr-sm" color="secondary">{year}</q-badge> <q-badge class="q-mr-sm" color="secondary">{month}</q-badge> <q-badge class="q-mr-sm" color="secondary">{day}</q-badge> <q-badge color="secondary">{slug}</q-badge></p>
                <p class="q-ma-none q-pa-none">Example: <q-badge color="primary">/{year}/{month}/{day}/{slug}</q-badge> will give an url like <q-badge color="primary">/2020/08/03/title-of-my-post</q-badge></p>
            </q-banner>

            <q-input v-for="permalink in permalinks"
                     filled
                     :debounce="300"
                     :key="permalink.type.name"
                     :label="contentTypeLabel(permalink.type)"
                     :placeholder="permalink.permalink"
                     :value="permalink.permalink"
                     @input="updatePermalink(permalink, $event)"
            />
        </div>
    </div>
</template>
<script lang="ts">
import SettingsBaseComponent from 'components/settings/SettingsBaseComponent';
import { cloneDeep, upperFirst } from 'lodash';
import ContentType from 'src/model/interfaces/ContentType';
import GenericObject from 'src/model/interfaces/GenericObject';
import Permalink from 'src/model/interfaces/Permalink';
import { Component } from 'vue-property-decorator';
import { namespace } from 'vuex-class';

const ContentTypeStore = namespace('ContentType');

@Component
export default class SettingsPermalinks extends SettingsBaseComponent {
    @ContentTypeStore.State private contentTypes: ContentType[];

    private get permalinks(): Permalink[] {
        if (!this.contentTypes) {
            return [];
        }

        const storedPermalinks = this.getSettingValue('permalinks');

        return this.contentTypes.filter((type) => type.public).map((type) => {
            return {
                type,
                permalink: storedPermalinks && storedPermalinks.hasOwnProperty(type.name) ? storedPermalinks[type.name] : type.permalink,
            };
        });
    }

    private contentTypeLabel(contentType: ContentType): string {
        return upperFirst(contentType.labels.singularName);
    }

    private updatePermalink(permalink: Permalink, value: string): void {
        const storedPermalinks: GenericObject<any> = cloneDeep(this.getSettingValue('permalinks') || {});

        if (permalink.type.permalink === value || value.trim().length === 0) {
            delete storedPermalinks[permalink.type.name];
        } else {
            storedPermalinks[permalink.type.name] = value.trim();
        }

        this.setSettingAs<any>('permalinks', storedPermalinks);
        this.saveSettings();
    }
}
</script>
