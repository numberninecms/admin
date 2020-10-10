<!--
  - This file is part of the NumberNine package.
  -
  - (c) William Arin <williamarin.dev@gmail.com>
  -
  - For the full copyright and license information, please view the LICENSE
  - file that was distributed with this source code.
  -->

<template>
    <div class="column q-gutter-y-md">
        <q-input filled label="Title" v-model="value.title" />
        <p class="text-bold text-body1 q-mb-none">Content</p>
        <TinyEditor v-model="value.content"/>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import ContentEntity from '../../model/interfaces/ContentEntity';
import TinyEditor from 'components/form/components/TinyEditor.vue';

@Component({
    components: {TinyEditor}
})
export default class ClassicEditorPanelContent extends Vue {
    @Prop()
    private value: ContentEntity;

    private created(): void {
        this.value.excerpt = this.value.excerpt ?? '';
    }
}
</script>
