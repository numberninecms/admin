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
        <q-input filled label="SEO title" v-model="value.seoTitle" counter
                 :placeholder="value.title"
                 hint="Keep it under 70 characters for best results" />
        <q-input filled label="Meta description" type="textarea" autogrow
                 hint="Maximum 157 characters"
                 :rules="[val => val.length <= 157 || 'Maximum 157 characters']"
                 counter
                 v-model="value.seoDescription" />
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import ContentEntity from '../../model/interfaces/ContentEntity';

@Component
export default class ClassicEditorPanelSEO extends Vue {
    @Prop()
    private value: ContentEntity;
}
</script>
