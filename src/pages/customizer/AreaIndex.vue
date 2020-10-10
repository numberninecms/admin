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
                <q-list bordered separator v-for="area in areas" :key="area.id">
                    <q-item clickable v-ripple @click="editArea(area)">
                        <q-item-section>{{ area.name }}</q-item-section>
                    </q-item>
                </q-list>
            </div>
        </div>

        <q-page-sticky expand position="top">
            <q-toolbar class="bg-primary text-white">
                <q-toolbar-title>
                    Editable areas
                </q-toolbar-title>
            </q-toolbar>
        </q-page-sticky>
    </q-page>
</template>

<script lang="ts">
import Area from 'src/model/interfaces/Area';
import {Component, Vue} from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import DynamicFrame from '../../components/content/DynamicFrame.vue';
import PageBuilderSidebar from 'src/components/pagebuilder/PageBuilderSidebar.vue';

const AreaStore = namespace('Area');

@Component({
    components: { DynamicFrame, PageBuilderSidebar },
})
export default class AreaIndex extends Vue {
    @AreaStore.State private areas;
    @AreaStore.Action private queryAreas;

    private created() {
        this.queryAreas();
    }

    private editArea(area: Area) {
        this.$router.push('/customizer/' + area.id);
    }
}
</script>
