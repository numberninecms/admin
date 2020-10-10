<!--
  - This file is part of the NumberNine package.
  -
  - (c) William Arin <williamarin.dev@gmail.com>
  -
  - For the full copyright and license information, please view the LICENSE
  - file that was distributed with this source code.
  -->

<template>
    <div>
        <div class="row q-col-gutter-md q-gutter-y-md items-start" v-for="customField in value.customFieldsComputed" :key="customField.id">
            <q-select class="col-12 col-sm-6"
                      filled
                      use-input
                      fill-input
                      input-debounce="0"
                      hide-selected
                      label="Name"
                      :options="existingCustomFieldsOptions"
                      @filter="customFieldAutocomplete"
                      :value="customField.key"
                      @input-value="value.setCustomFieldKey(customField, $event)">
            </q-select>
            <q-input class="col-12 col-sm-6"
                     :value="customField.value"
                     @input="value.setCustomFieldValue(customField, $event)"
                     label="Value"
                     filled
                     autogrow>
                <template v-slot:append>
                    <q-btn round dense flat icon="mdi-delete" @click="value.deleteCustomField(customField)"/>
                </template>
            </q-input>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import ContentEntity from '../../model/interfaces/ContentEntity';

const ContentStore = namespace('Content');

@Component
export default class ClassicEditorPanelCustomFields extends Vue {
    @ContentStore.State private existingCustomFields;
    @ContentStore.Action private fetchExistingCustomFields;

    @Prop()
    private value: ContentEntity;

    private existingCustomFieldsOptions: string[]|null = null;

    private created(): void {
        this.fetchExistingCustomFields().then(() => this.existingCustomFieldsOptions = Object.values(this.existingCustomFields));
        this.value.customFields = Object.assign({}, this.value.customFields ?? {});
    }

    private customFieldAutocomplete(val, update) {
        update(() => {
            const needle = val.toLocaleLowerCase();
            this.existingCustomFieldsOptions = Object.values<string>(this.existingCustomFields).filter(v => v.toLocaleLowerCase().includes(needle));
        });
    }
}
</script>
