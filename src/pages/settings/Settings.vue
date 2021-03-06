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
            <q-btn-group class="q-mt-md" >
                <q-btn label="Save" color="primary" @click="saveSettings()"/>
                <q-btn label="Restore" @click="restoreSettings()"/>
            </q-btn-group>
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
import SettingsEmails from 'components/settings/SettingsEmails.vue';
import { EventBus } from 'src/event/EventBus';
import DynamicComponent from 'src/model/interfaces/DynamicComponent';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';

const SettingStore = namespace('Setting');

@Component({
    components: {SettingsGeneral, SettingsPermalinks, SettingsEmails},
})
export default class Settings extends Vue {
    @SettingStore.Action private querySettings;
    @SettingStore.Action private saveSettings;
    @SettingStore.Action private restoreSettings;

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
        {
            id: 'emails',
            title: 'Emails',
            component: 'SettingsEmails',
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
