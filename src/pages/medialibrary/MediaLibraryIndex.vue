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
        <MediaLibrary />
    </q-page>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import MediaLibrary from '../../components/medialibrary/MediaLibrary.vue';

const MediaLibraryStore = namespace('MediaLibrary');

@Component({
    components: { MediaLibrary }
})
export default class MediaLibraryIndex extends Vue {
    @MediaLibraryStore.Action private fetchOptions;

    private created() {
        this.fetchOptions();
    }
}
</script>
