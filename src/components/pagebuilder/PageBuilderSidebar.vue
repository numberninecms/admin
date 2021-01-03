<!--
  - This file is part of the NumberNine package.
  -
  - (c) William Arin <williamarin.dev@gmail.com>
  -
  - For the full copyright and license information, please view the LICENSE
  - file that was distributed with this source code.
  -->

<template>
    <div v-if="height">
        <q-toolbar class="bg-secondary text-white">
            <q-btn flat dense icon="save" @click="publishComponents" :loading="isPublishing">
                <q-tooltip>
                    Save page
                </q-tooltip>
            </q-btn>
            <q-btn v-if="hasClassicEditor" flat dense icon="mdi-file-document-edit" @click="openClassicEditor" label="Classic editor"/>
            <q-space/>
            <q-btn-toggle :value="viewSize"
                          @input="setView"
                          flat dense
                          :options="[
                              {value: 'sm', slot: 'sm'},
                              {value: 'md', slot: 'md'},
                              {value: 'lg', slot: 'lg'},
                          ]">
                <template v-slot:sm>
                    <q-icon name="smartphone"/>
                    <q-tooltip>Smartphone</q-tooltip>
                </template>
                <template v-slot:md>
                    <q-icon name="tablet_android"/>
                    <q-tooltip>Tablet</q-tooltip>
                </template>
                <template v-slot:lg>
                    <q-icon name="computer"/>
                    <q-tooltip>Desktop</q-tooltip>
                </template>
            </q-btn-toggle>
        </q-toolbar>

        <q-tabs v-model="tab" dense>
            <q-tab name="components" label="Components"/>
            <q-tab name="form" :label="selectedComponent.label" v-if="selectedComponent"/>
        </q-tabs>

        <q-tab-panels v-model="tab" keep-alive>
            <q-tab-panel name="components" :style="{maxHeight: (height - 120) + 'px'}">
                <PageBuilderComponentsTree @edit="tab = 'form'"/>
                <q-btn class="q-mt-md q-px-md" dense color="primary" label="Add to content" @click="openDialog = true" />
            </q-tab-panel>

            <q-tab-panel name="form" :style="{maxHeight: (height - 120) + 'px'}">
                <PageBuilderComponentForm :component="selectedComponent" v-if="selectedComponent" :key="selectedComponent.id"/>
            </q-tab-panel>
        </q-tab-panels>

        <PageBuilderAvailableComponentsDialog v-model="openDialog" @component-click="showComponentPresets" @close="closeDialog"/>

        <q-dialog v-model="presetsDialog">
            <q-card style="width: 700px; max-width: 80vw;">
                <q-card-section class="column wrap q-gutter-md">
                    <q-list bordered separator v-for="preset in componentPresets[componentToAdd]" :key="preset.name">
                        <q-item clickable v-ripple @click="addPresetToContent(preset)">
                            <q-item-section>{{ preset.name }}</q-item-section>
                        </q-item>
                    </q-list>
                </q-card-section>

                <q-card-actions align="right">
                    <q-btn flat label="Close" color="secondary" @click="presetsDialog = false"/>
                    <q-btn flat label="Add without preset" color="secondary" @click="addComponentToContent(componentToAdd)"/>
                </q-card-actions>
            </q-card>
        </q-dialog>

    </div>
</template>
<script lang="ts">
import Preset from 'src/model/interfaces/Preset';
import { assignNewUidToTree } from 'src/store/helpers/assignNewIdToTree';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { uid } from 'quasar';
import { cloneDeep } from 'lodash'
import { namespace } from 'vuex-class';
import { EventBus } from 'src/event/EventBus';
import PageComponent from 'src/model/interfaces/PageComponent';
import PageBuilderComponentForm from './PageBuilderComponentForm.vue';
import PageBuilderComponentsTree from './PageBuilderComponentsTree.vue';
import PageBuilderAvailableComponentsDialog from 'components/pagebuilder/PageBuilderAvailableComponentsDialog.vue';

const PageBuilderStore = namespace('PageBuilder');

@Component({
    components: { PageBuilderComponentsTree, PageBuilderComponentForm, PageBuilderAvailableComponentsDialog },
})
export default class PageBuilderSidebar extends Vue {
    @PageBuilderStore.State private selectedId;
    @PageBuilderStore.State private highlightedId;
    @PageBuilderStore.State private dropPosition;
    @PageBuilderStore.State private availablePageComponents;
    @PageBuilderStore.State private componentPresets: { [componentName: string]: Preset[] };
    @PageBuilderStore.State private viewSize;
    @PageBuilderStore.Action private publish;
    @PageBuilderStore.Action private insertComponent;
    @PageBuilderStore.Action private fetchPresets;
    @PageBuilderStore.Action private setViewSize;
    @PageBuilderStore.Getter private getComponentById;

    @Prop({type: Boolean})
    private hasClassicEditor: boolean;

    @Prop()
    private height: number;

    private panel = 'structure';
    private tab = 'components';
    private openDialog = false;
    private presetsDialog = false;
    private isPublishing = false;
    private componentToAdd: string | null = null;

    private created() {
        EventBus.on('PageBuilder:edit-component', () => {
            this.tab = 'form';
        });

        EventBus.on('PageBuilder:add-to-content', () => {
            this.openDialog = true;
        });
    }

    private get selectedComponent(): PageComponent | undefined {
        return this.getComponentById(this.selectedId);
    }

    private addComponentToContent(name: string): void {
        const component: PageComponent = cloneDeep(this.availablePageComponents[name]);
        component.id = uid();
        this.insertComponent({componentToInsert: component, siblingId: this.selectedId, position: this.dropPosition});
        this.closeDialog();
    }

    private addPresetToContent(preset: Preset): void {
        const components = cloneDeep(preset.components);
        assignNewUidToTree(components);

        components.forEach((component) => {
            this.insertComponent({componentToInsert: component, siblingId: this.selectedId, position: this.dropPosition});
        });

        this.closeDialog();
    }

    private async publishComponents(): Promise<void> {
        this.isPublishing = true;

        if (this.$route.params.id) {
            await this.publish({id: this.$route.params.id});
        } else if (this.$route.params.area) {
            await this.publish({area: this.$route.params.area});
        }

        this.isPublishing = false;
    }

    private async showComponentPresets(name: string): Promise<void> {
        this.componentToAdd = name;
        await this.fetchPresets(name);
        const presets = this.componentPresets[name];

        if (presets.length === 0) {
            this.addComponentToContent(name);
            this.closeDialog();
            return;
        }

        this.presetsDialog = true;
    }

    private closeDialog(): void {
        this.componentToAdd = null;
        this.openDialog = false;
        this.presetsDialog = false;
    }

    private setView(value): void {
        this.setViewSize(value);
        EventBus.emit('Frame:resize');
        EventBus.emit('Frame:manual-view-size');
    }

    private openClassicEditor(): void {
        this.$emit('open-classic-editor');
    }
}
</script>
<style lang="scss">
.tree-node-inner-back {
    margin-bottom: 0 !important;
}
</style>
