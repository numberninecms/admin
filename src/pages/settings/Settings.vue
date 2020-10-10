<!--
  - This file is part of the NumberNine package.
  -
  - (c) William Arin <williamarin.dev@gmail.com>
  -
  - For the full copyright and license information, please view the LICENSE
  - file that was distributed with this source code.
  -->

<template>
    <q-page v-if="component">
        <div class="q-ma-md">
            <component style="padding-top: 42px"
                       :key="component.id ? component.id : component.component"
                       :is="component.component"
                       v-bind="{...component.props}"
                       v-on="{...component.events}"/>
        </div>

        <q-page-sticky expand position="top">
            <q-toolbar class="bg-primary text-white">
                <q-toolbar-title>
                    {{ component.title }}
                </q-toolbar-title>
            </q-toolbar>
        </q-page-sticky>
    </q-page>
</template>

<script lang="ts">
import SettingsGeneral from 'components/settings/SettingsGeneral.vue';
import SettingsPermalinks from 'components/settings/SettingsPermalinks.vue';
import { EventBus } from 'src/event/EventBus';
import DynamicComponent from 'src/model/interfaces/DynamicComponent';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';

const SettingStore = namespace('Setting');

@Component({
    components: {SettingsGeneral, SettingsPermalinks},
})
export default class Settings extends Vue {
    @SettingStore.Action private querySettings;

    @Prop()
    private page: string;

    private settingsComponents: DynamicComponent[] = [
        {
            id: 'general',
            title: 'General settings',
            component: 'SettingsGeneral',
        },
        {
            id: 'permalinks',
            title: 'Permalinks',
            component: 'SettingsPermalinks',
        },
    ];

    private async created() {
        EventBus.emit('Settings:settingsComponents', {settingsComponents: this.settingsComponents});

        await this.querySettings();
        EventBus.emit('Settings:loaded');
    }

    private get component(): DynamicComponent|undefined {
        return this.settingsComponents.find((c) => c.id === this.page);
    }
}
</script>
