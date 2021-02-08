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
        <div class="row q-gutter-x-md items-center">
            <div>
                <a href="#">{{ rootAbsoluteUrl }}{{ pagePermalink }}</a>
                <q-popup-edit v-model="value.slug" title="Permalink" buttons label-set="OK" @save="validateSlug">
                    <q-input v-model="value.slug"
                             dense autofocus filled stack-label clearable
                             :placeholder="slugifiedTitle"
                    />
                </q-popup-edit>
            </div>
            <q-btn flat dense color="secondary" icon="mdi-eye-outline" :href="value.publicUrl" type="a" target="_blank">
                <q-tooltip>View</q-tooltip>
            </q-btn>
        </div>
        <p class="text-bold text-body1 q-mb-none">Content</p>
        <TinyEditor v-model="value.content"/>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import ContentEntity from '../../model/interfaces/ContentEntity';
import TinyEditor from 'components/form/components/TinyEditor.vue';
import { namespace } from 'vuex-class';
import * as changeCase from 'change-case';

const SettingStore = namespace('Setting');

@Component({
    components: {TinyEditor}
})
export default class ClassicEditorPanelContent extends Vue {
    @SettingStore.State private settings;
    @SettingStore.Action private querySettings;
    @SettingStore.Getter private getSettingValue;

    @Prop()
    private value: ContentEntity;

    private created(): void {
        this.querySettings();
        this.value.excerpt = this.value.excerpt ?? '';
    }

    private validateSlug(value): void {
        if (!value) {
            this.value.slug = this.slugifiedTitle;
        }
    }

    private get rootAbsoluteUrl(): string|undefined {
        return this.getSettingValue('root_absolute_url');
    }

    private get pagePermalink(): string|undefined {
        return this.getSettingValue('permalinks')
            ? this.getSettingValue('permalinks')[this.value.type]?.replace(/^\//, '')
                .replace('{slug}', this.value.slug)
            : undefined;
    }

    private get slugifiedTitle(): string|undefined {
        return changeCase.paramCase(this.value.title);
    }
}
</script>
