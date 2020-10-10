<!--
  - This file is part of the NumberNine package.
  -
  - (c) William Arin <williamarin.dev@gmail.com>
  -
  - For the full copyright and license information, please view the LICENSE
  - file that was distributed with this source code.
  -->

<template>
    <div id="q-app">
        <router-view/>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';

const LayoutStore = namespace('Layout');
const ContentTypeStore = namespace('ContentType');

@Component
export default class App extends Vue {
    @LayoutStore.Action private fetchMainMenuItems;
    @LayoutStore.State private mainMenuItems;
    @ContentTypeStore.Action private fetchContentTypes;

    private created(): void {
        this.fetchContentTypes();
    }
}
</script>
