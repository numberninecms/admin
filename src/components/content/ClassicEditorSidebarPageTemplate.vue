<!--
  - This file is part of the NumberNine package.
  -
  - (c) William Arin <williamarin.dev@gmail.com>
  -
  - For the full copyright and license information, please view the LICENSE
  - file that was distributed with this source code.
  -->

<template>
    <q-card v-if="templates.length > 0">
        <q-card-section>
            <div class="text-h6">Template</div>
            <q-separator/>
        </q-card-section>
        <q-card-section>
            <q-select :options="templates"
                      label="Custom template"
                      filled
                      emit-value
                      map-options
                      :value="value.getCustomFieldValue('page_template')"
                      @input="value.setCustomFieldValue('page_template', $event)">
                <template v-if="value.getCustomFieldValue('page_template')" v-slot:append>
                    <q-icon name="cancel" @click.stop="value.deleteCustomField('page_template')" class="cursor-pointer" />
                </template>
            </q-select>
        </q-card-section>
    </q-card>
</template>
<script lang="ts">
import ContentEntity from 'src/model/interfaces/ContentEntity';
import SelectOption from 'src/model/interfaces/SelectOption';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';

const ContentStore = namespace('Content');

@Component
export default class ClassicEditorSidebarPageTemplate extends Vue {
    @ContentStore.State private contentEntitiesTemplates;
    @ContentStore.Action private fetchTemplates;

    @Prop()
    private value: ContentEntity;

    private created(): void {
        this.fetchTemplates(this.value.type);
    }

    private get templates(): SelectOption[] {
        if (!this.contentEntitiesTemplates[this.value.type] || this.contentEntitiesTemplates[this.value.type].length === 0) {
            return [];
        }

        const templates: SelectOption[] = [];

        for (const template of this.contentEntitiesTemplates[this.value.type]) {
            templates.push({label: template, value: template})
        }

        return templates;
    }
}
</script>
