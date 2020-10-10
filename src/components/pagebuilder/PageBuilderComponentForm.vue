<!--
  - This file is part of the NumberNine package.
  -
  - (c) William Arin <williamarin.dev@gmail.com>
  -
  - For the full copyright and license information, please view the LICENSE
  - file that was distributed with this source code.
  -->

<template>
    <div v-if="form">
        <component :is="formControlName(control.name)"
                   v-for="(control, field) in form"
                   :key="field"
                   :value="fieldValue(field)"
                   :parameters="control.parameters"
                   class="q-mb-md"
                   @input="update(field, $event)"
                   @input-computed="updateComputed(field, $event)"
        />
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { EventBus } from 'src/event/EventBus';
import PageComponent from 'src/model/interfaces/PageComponent';
import Form from 'src/model/interfaces/Form';
import formControls from '../form/formControls';

const PageBuilderStore = namespace('PageBuilder');

@Component({
    components: formControls
})
export default class PageBuilderComponentForm extends Vue {
    @PageBuilderStore.State private viewSize;
    @PageBuilderStore.State private pageComponentForms;
    @PageBuilderStore.Action private updateComponentParameter;
    @PageBuilderStore.Action private updateComponentComputedParameter;

    @Prop()
    private component: PageComponent;

    private formControlName(controlName: string): string {
        return 'FormControl' + controlName;
    }

    private async update(parameter: string, value: any) {
        // A control can override which field will be updated instead of itself
        if (value.hasOwnProperty('parameter') && value.hasOwnProperty('value')) {
            parameter = value.parameter;
            value = value.value;
        }

        if (this.isResponsive(parameter)) {
            await this.updateComponentParameter({id: this.component.id, parameter, value: {[this.viewSize]: value}, merge: true});
        } else {
            await this.updateComponentParameter({id: this.component.id, parameter, value});
        }
        this.$forceUpdate();
        EventBus.emit('PageBuilder:update-parameter-after');
    }

    private async updateComputed(parameter: string, value: any) {
        // A control can override which field will be updated instead of itself
        if (value.hasOwnProperty('parameter') && value.hasOwnProperty('value')) {
            parameter = value.parameter;
            value = value.value;
        }

        await this.updateComponentComputedParameter({id: this.component.id, parameter, value});
        this.$forceUpdate();
        EventBus.emit('PageBuilder:update-parameter-after');
    }

    private fieldValue(field) {
        if (this.isResponsive(field)) {
            return this.component.parameters[field].hasOwnProperty(this.viewSize) ? this.component.parameters[field][this.viewSize] : '';
        }

        return this.component.parameters[field];
    }

    private isResponsive(field) {
        return this.component.responsive.includes(field);
    }

    private get form(): Form | null {
        return this.pageComponentForms[this.component.name] ?? null;
    }
}
</script>
