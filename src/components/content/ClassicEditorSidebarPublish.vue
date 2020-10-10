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
            <div class="text-h6">Publish</div>
            <q-separator/>
        </q-card-section>
        <q-card-section>
            <q-select v-model="value.status"
                      label="Status"
                      filled
                      :options="statusOptions"
                      map-options
                      emit-value
            />
        </q-card-section>
        <q-card-actions align="between">
            <q-btn flat color="negative" icon="mdi-delete" class="q-ma-sm" @click="$emit('update:delete-action', true)"/>
            <q-btn color="primary" :label="publishActionText" class="q-ma-sm" @click="$emit('save')" :loading="saveLoading"/>
        </q-card-actions>
    </q-card>
</template>
<script lang="ts">
import ContentEntity from 'src/model/interfaces/ContentEntity';
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class ClassicEditorSidebarPublish extends Vue {
    @Prop()
    private value: ContentEntity;

    @Prop()
    private originalEntity: ContentEntity;

    @Prop({type: Boolean})
    private saveLoading: boolean;

    @Prop({type: Boolean})
    private deleteAction: boolean;

    private statusOptions = [
        {label: 'Draft', value: 'draft'},
        {label: 'Private', value: 'private'},
        {label: 'Pending review', value: 'pending_review'},
        {label: 'Published', value: 'publish'},
    ];

    private get publishActionText() {
        if (!this.value) {
            return '';
        }

        if (this.originalEntity.status !== 'publish' && this.value.status === 'publish') {
            return 'Publish';
        }

        return 'Update';
    }
}
</script>
