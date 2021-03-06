<!--
  - This file is part of the NumberNine package.
  -
  - (c) William Arin <williamarin.dev@gmail.com>
  -
  - For the full copyright and license information, please view the LICENSE
  - file that was distributed with this source code.
  -->

<template>
    <q-layout view="hHh LpR fFf">
        <q-header elevated class="bg-dark text-white">
            <q-toolbar>
                <q-btn
                    dense
                    flat
                    round
                    icon="menu"
                    @click="leftDrawerOpen = !leftDrawerOpen"
                />

                <q-avatar class="q-mr-sm">
                    <q-icon name="img:icons/numbernine64.png" style="font-size: 2rem"/>
                </q-avatar>
                <q-btn round flat icon="mdi-home" :href="siteUrl" type="a" target="_blank"/>
                <q-toolbar-title>
                    {{ siteTitle }} – Admin panel
                </q-toolbar-title>

                <div class="q-gutter-sm row items-center no-wrap">
                    <q-btn round flat>
                        <q-avatar size="26px">
                            <img src="https://cdn.quasar.dev/img/boy-avatar.png">
                        </q-avatar>
                        <q-tooltip>Account</q-tooltip>
                    </q-btn>
                </div>
            </q-toolbar>
        </q-header>

        <q-drawer v-model="leftDrawerOpen" side="left" :width="200" elevated content-class="bg-dark text-white">
            <NavLeft></NavLeft>
        </q-drawer>

        <q-page-container>
            <router-view :key="$route.fullPath" />
        </q-page-container>
    </q-layout>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import NavLeft from '../components/layout/NavLeft.vue';
import { EventBus } from '../event/EventBus';
import {namespace} from 'vuex-class';

const SettingStore = namespace('Setting');

@Component({
    components: { NavLeft }
})
export default class DefaultLayout extends Vue {
    @SettingStore.Action private querySettings;
    @SettingStore.Getter private getSettingValue;

    private leftDrawerOpen = true;

    private created() {
        this.querySettings();
        EventBus.on('Layout:hide-drawer', () => this.leftDrawerOpen = false);
    }

    private get siteTitle(): string {
        return this.getSettingValue('site_title') as string;
    }

    private get siteUrl(): string {
        return this.getSettingValue('root_absolute_url') as string;
    }
}
</script>
<style lang="scss">
.q-toolbar {
    min-height: 42px;
}
</style>
