<!--
  - This file is part of the NumberNine package.
  -
  - (c) William Arin <williamarin.dev@gmail.com>
  -
  - For the full copyright and license information, please view the LICENSE
  - file that was distributed with this source code.
  -->

<template>
    <q-dialog v-model="showMediaLibrary" persistent full-width @keyup.esc="showMediaLibrary = false">
        <MediaLibrary popup @files-selected="selectFiles"/>
    </q-dialog>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import MediaLibrary from './MediaLibrary.vue';

const MediaLibraryStore = namespace('MediaLibrary');

@Component({
    components: { MediaLibrary }
})
export default class MediaLibraryDialog extends Vue {
    @MediaLibraryStore.State private isShown;
    @MediaLibraryStore.Action private show;

    private get showMediaLibrary() {
        return this.isShown;
    }

    private set showMediaLibrary(value) {
        this.show({ value, callback: value ? this.selectFiles.bind(this) : null });
    }

    private selectFiles(payload) {
        this.show = false;
        this.$emit('files-selected', payload);
    }
}
</script>
