<!--
  - This file is part of the NumberNine package.
  -
  - (c) William Arin <williamarin.dev@gmail.com>
  -
  - For the full copyright and license information, please view the LICENSE
  - file that was distributed with this source code.
  -->

<template>
    <q-card>
        <q-card-section>
            <div class="text-h6">Featured image</div>
            <q-separator/>
        </q-card-section>
        <q-card-section>
            <MediaSelect :value="value.featuredImage ? value.featuredImage.id : null"
                         class="full-width q-mt-xs"
                         @input-computed="setFeaturedImage"
            />
        </q-card-section>
    </q-card>
</template>
<script lang="ts">
import MediaSelect from 'components/medialibrary/MediaSelect.vue';
import ContentEntity from 'src/model/interfaces/ContentEntity';
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({
    components: { MediaSelect }
})
export default class ClassicEditorSidebarFeaturedImage extends Vue {
    @Prop()
    private value: ContentEntity;

    private setFeaturedImage({value}) {
        this.value.featuredImage = value;
    }
}
</script>
