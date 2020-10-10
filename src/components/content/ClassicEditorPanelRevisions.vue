<!--
  - This file is part of the NumberNine package.
  -
  - (c) William Arin <williamarin.dev@gmail.com>
  -
  - For the full copyright and license information, please view the LICENSE
  - file that was distributed with this source code.
  -->

<template>
    <div v-if="revisions.length > 1">
        <div class="row q-gutter-x-xl items-center">
            <q-slider
                class="col q-mt-lg"
                v-model="currentRevisionStep"
                color="primary"
                markers snap label label-always
                :label-value="currentRevisionDate"
                :min="0"
                :step="1"
                :max="revisions.length - 1"
            />
            <q-btn
                class="col-auto"
                color="primary"
                label="Revert"
                :disable="currentRevisionVersion === revisions[0].version"
                @click="confirmRevert = true"
            />
        </div>

        <RevisionFieldDiff title="Title" field="title" :version="currentRevisionVersion" :revisions="revisions" />
        <RevisionFieldDiff title="Slug" field="slug" :version="currentRevisionVersion" :revisions="revisions" />
        <RevisionFieldDiff title="Excerpt" field="excerpt" :version="currentRevisionVersion" :revisions="revisions" />
        <RevisionFieldDiff title="Content" field="content" :version="currentRevisionVersion" :revisions="revisions" />

        <q-dialog :value="confirmRevert">
            <q-card f>
                <q-card-section>
                    <div class="text-h6">{{currentRevisionDate}} version</div>
                    <q-separator/>
                </q-card-section>
                <q-card-section class="row items-center">
                    <q-avatar icon="mdi-alert-remove" color="warning" text-color="white" />
                    <span class="q-ml-sm text-subtitle1">Do you want to revert this {{ value.type }}?</span>
                </q-card-section>
                <q-card-section>
                    <span>All revisions past <q-badge :label="currentRevisionDate" color="warning"/> will be permanently deleted.</span>
                </q-card-section>

                <q-card-actions align="right">
                    <q-btn flat label="No" color="secondary" @click="confirmRevert = false" />
                    <q-btn flat :loading="revertLoading" label="Yes" color="primary" @click="confirmRevertAction" autofocus @keyup.enter="confirmRevertAction"/>
                </q-card-actions>
            </q-card>
        </q-dialog>
    </div>
</template>

<script lang="ts">
import RevisionFieldDiff from 'components/content/RevisionFieldDiff.vue';
import dateFormat from 'dateformat';
import Revision from 'src/model/interfaces/Revision';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import ContentEntity from '../../model/interfaces/ContentEntity';

const ContentStore = namespace('Content');

@Component({
    components: {RevisionFieldDiff}
})
export default class ClassicEditorPanelRevisions extends Vue {
    @ContentStore.State private contentEntitiesRevisions;
    @ContentStore.Action private revertEntity;

    @Prop()
    private value: ContentEntity;

    private currentRevisionStep = 0;
    private confirmRevert = false;
    private revertLoading = false;

    private activated() {
        this.currentRevisionStep = this.revisions.length - 1;
    }

    private get revisions(): Revision[] {
        if (this.contentEntitiesRevisions.hasOwnProperty(this.value.type) && this.contentEntitiesRevisions[this.value.type].hasOwnProperty(this.value.id.toString())) {
            return this.contentEntitiesRevisions[this.value.type][this.value.id.toString()] ?? [];
        }

        return [];
    }

    private get currentRevisionDate(): string | undefined {
        const revisionDate = this.revisions.find((r) => r.version === this.currentRevisionVersion)?.date;
        return revisionDate ? dateFormat(revisionDate, 'mmmm d, yyyy HH:MM') : this.currentRevisionVersion.toString();
    }

    private get currentRevisionVersion(): number {
        if (this.currentRevisionStep > this.revisions.length - 1) {
            return 0;
        }

        return this.revisions[this.revisions.length - this.currentRevisionStep - 1].version;
    }

    private async confirmRevertAction() {
        await this.revertEntity({entity: this.value, version: this.currentRevisionVersion});
        this.$emit('reload');
        this.confirmRevert = false;
    }
}
</script>
