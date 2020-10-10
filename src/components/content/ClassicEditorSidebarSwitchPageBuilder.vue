<!--
  - This file is part of the NumberNine package.
  -
  - (c) William Arin <williamarin.dev@gmail.com>
  -
  - For the full copyright and license information, please view the LICENSE
  - file that was distributed with this source code.
  -->

<template>
    <div class="row justify-end">
        <q-btn label="Page builder"
               icon="mdi-toy-brick"
               color="primary"
               outline
               :class="{'full-width': $q.screen.lt.lg}"
               @click="goToPageBuilderAction = true" />

        <q-dialog v-model="goToPageBuilderAction" persistent>
            <q-card>
                <q-card-section class="row items-center">
                    <q-avatar icon="mdi-exclamation-thick" color="warning" text-color="white" />
                    <span class="q-ml-sm">Do you want to save this {{ typeName }} before switching to page builder?</span>
                </q-card-section>

                <q-card-actions align="right">
                    <q-btn flat label="Cancel" color="secondary" @click="goToPageBuilderAction = false" />
                    <q-btn flat label="No" color="secondary" @click="goToPageBuilder(false)" />
                    <q-btn flat label="Yes" color="primary" @click="goToPageBuilder(true)" autofocus @keyup.enter="goToPageBuilder(true)" :loading="saveLoading"/>
                </q-card-actions>
            </q-card>
        </q-dialog>
    </div>
</template>

<script lang="ts">
import ContentEntity from 'src/model/interfaces/ContentEntity';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';

const ContentTypeStore = namespace('ContentType');

@Component
export default class ClassicEditorSidebarSwitchPageBuilder extends Vue {
    @ContentTypeStore.Getter private findByName;

    @Prop()
    private value: ContentEntity;

    @Prop({type: Boolean})
    private saveLoading: boolean;

    private goToPageBuilderAction = false;

    private goToPageBuilder(save: boolean) {
        if (save) {
            this.$emit('save', () => {
                this.$router.push({name: this.value.type + '_edit', params: {id: this.value.id.toString()}});
            });

            return;
        }

        this.$router.push({name: this.value.type + '_edit', params: {id: this.value.id.toString()}});
    }

    private get typeName(): string {
        if (!this.value) {
            return '';
        }

        return this.findByName(this.value?.type).name.toLowerCase();
    }
}
</script>
