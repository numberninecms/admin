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
            <div class="text-h6">{{ extension.parameters.label }}</div>
            <q-separator/>
        </q-card-section>
        <q-card-section>
            <component :is="formControlName(control.name)"
                       v-for="(control, field) in extension.controls"
                       :key="field"
                       :value="value.customFields[`extension.${extension.name}.${field}`]"
                       :parameters="control.parameters"
                       class="q-mb-md"
                       @input="updateValue(field, $event)"
            />
        </q-card-section>
    </q-card>
</template>
<script lang="ts">
import ContentEntity from 'src/model/interfaces/ContentEntity';
import { Component, Prop, Vue } from 'vue-property-decorator';
import EditorExtensionChild from 'src/model/interfaces/EditorExtensionChild';
import formControls from 'components/form/formControls';
import {namespace} from 'vuex-class';

const ContentStore = namespace('Content');

@Component({
    components: formControls
})
export default class ClassicEditorSidebarDynamic extends Vue {
    @ContentStore.State private existingCustomFields;
    @ContentStore.Action private fetchExistingCustomFields;

    @Prop()
    private value: ContentEntity;

    @Prop()
    private extension: EditorExtensionChild;

    private existingCustomFieldsOptions: string[]|null = null;

    private created(): void {
        this.fetchExistingCustomFields().then(() => this.existingCustomFieldsOptions = Object.values(this.existingCustomFields));
        this.value.customFields = Object.assign({}, this.value.customFields ?? {});
    }

    private formControlName(controlName: string): string {
        return 'FormControl' + controlName;
    }

    private updateValue(key: string, value: any) {
        this.value.setCustomFieldValue(`extension.${this.extension.name}.${key}`, value);
    }
}
</script>
