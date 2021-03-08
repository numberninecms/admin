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
        <component :is="formControlName(control.name)"
                   v-for="(control, field) in extension.controls"
                   :key="field"
                   :value="fieldValue(field, control.parameters.default)"
                   :parameters="control.parameters"
                   class="q-mb-md"
                   @input="updateValue(field, $event)"
        />
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import ContentEntity from 'src/model/interfaces/ContentEntity';
import formControls from 'components/form/formControls';
import EditorExtensionChild from 'src/model/interfaces/EditorExtensionChild';
import {namespace} from 'vuex-class';

const ContentStore = namespace('Content');

@Component({
    components: formControls
})
export default class ClassicEditorPanelDynamic extends Vue {
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

    private fieldValue(field: string, defaultValue: any) {
        const customFieldValue = this.value.customFields[`extension.${this.extension.name}.${field}`];
        return customFieldValue ?? defaultValue;
    }
}
</script>
