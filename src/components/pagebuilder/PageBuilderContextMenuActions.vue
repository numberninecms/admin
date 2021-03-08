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
        <q-dialog v-model="deleteAction" persistent>
            <q-card>
                <q-card-section class="row items-center">
                    <q-avatar icon="delete_forever" color="negative" text-color="white" />
                    <span class="q-ml-sm">Do you want to delete this component?</span>
                </q-card-section>

                <q-card-actions align="right">
                    <q-btn flat label="No" color="secondary" @click="$emit('update:delete-action', false)" />
                    <q-btn flat label="Yes" color="primary" @click="confirmDelete" autofocus @keyup.enter="confirmDelete"/>
                </q-card-actions>
            </q-card>
        </q-dialog>

        <q-dialog v-model="presetAction" persistent>
            <q-card style="width: 450px; max-width: 80vw">
                <q-card-section>
                    <div class="text-h6">New preset name</div>
                </q-card-section>

                <q-card-section class="q-pt-none">
                    <q-input dense filled v-model="presetName" autofocus @keyup.enter="savePreset"/>
                </q-card-section>

                <q-card-actions align="right" class="text-primary">
                    <q-btn flat label="Cancel" color="secondary" @click="$emit('update:preset-action', false)" />
                    <q-btn flat label="Save preset" color="primary" @click="savePreset"/>
                </q-card-actions>
            </q-card>
        </q-dialog>

        <q-dialog v-model="shortcodeAction" persistent>
            <q-card style="width: 450px; max-width: 80vw">
                <q-card-section class="row items-center">
                    <textarea class="fit" readonly rows="15" :value="shortcodeCode"/>
                </q-card-section>

                <q-card-actions align="right">
                    <q-btn flat label="Close" color="secondary" @click="closeShortcodeDialog"/>
                </q-card-actions>
            </q-card>
        </q-dialog>
    </div>
</template>
<script lang="ts">
import PageComponent from 'src/model/interfaces/PageComponent';
import { Routing } from 'src/utils/routing';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';

const PageBuilderStore = namespace('PageBuilder');

@Component
export default class PageBuilderContextMenuActions extends Vue {
    @PageBuilderStore.State private selectedId;
    @PageBuilderStore.Action private duplicateComponent;
    @PageBuilderStore.Action private deleteComponent;
    @PageBuilderStore.Action private saveShortcodePreset;
    @PageBuilderStore.Action private hideContextMenu;
    @PageBuilderStore.Getter private getComponentById;

    @Prop()
    private duplicateAction: boolean;

    @Prop()
    private presetAction: boolean;

    @Prop()
    private shortcodeAction: boolean;

    @Prop()
    private deleteAction: boolean;

    private presetName = '';
    private shortcodeCode = '';

    @Watch('duplicateAction')
    private onDuplicateActionChanged() {
        if (this.duplicateAction) {
            this.duplicateComponent(this.selectedId);
            this.$emit('update:duplicate-action', false);
            this.hideContextMenu();
        }
    }

    private confirmDelete() {
        this.$emit('update:delete-action', false);
        this.deleteComponent(this.selectedId);
        this.hideContextMenu();
    }

    private savePreset() {
        this.$emit('update:preset-action', false);

        this.saveShortcodePreset({
            name: this.presetName,
            content: this.component,
        });

        this.$q.notify({
            message: `Preset "${this.presetName}" has been saved successfully.`,
        });

        this.presetName = '';
        this.hideContextMenu();
    }

    @Watch('shortcodeAction')
    private async onShortcodeActionChanged() {
        if (this.shortcodeAction) {
            const response = await this.$axios.post(Routing.generate('numbernine_admin_page_builder_generate_shortcode'), {component: this.component});
            this.shortcodeCode = response.data;
            this.hideContextMenu();
        }
    }

    private closeShortcodeDialog() {
        this.shortcodeCode = '';
        this.$emit('update:shortcode-action', false);
    }

    private get component(): PageComponent | undefined {
        return this.getComponentById(this.selectedId);
    }
}
</script>
