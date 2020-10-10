<!--
  - This file is part of the NumberNine package.
  -
  - (c) William Arin <williamarin.dev@gmail.com>
  -
  - For the full copyright and license information, please view the LICENSE
  - file that was distributed with this source code.
  -->

<template>
    <div :style="{height: (height - 42) + 'px !important', width, margin: '0 auto'}">
        <iframe ref="dynamicFrame" :src="src" @load="onLoad" class="fit no-border"></iframe>

        <q-inner-loading :showing="loading" style="background-color: #ffffff">
            <q-spinner-oval size="50px" color="primary" />
        </q-inner-loading>
    </div>
</template>
<script lang="ts">
import { EventBus } from 'src/event/EventBus';
import {Component, Prop, Ref, Vue, Watch} from 'vue-property-decorator';
import pageBuilderCompiler from 'src/services/PageBuilderCompiler';
import { namespace } from 'vuex-class';

const PageBuilderStore = namespace('PageBuilder');

@Component
export default class DynamicFrame extends Vue {
    @PageBuilderStore.State private viewSize;

    @Ref('dynamicFrame')
    private iframe!: HTMLIFrameElement;

    @Prop()
    private src?: string;

    @Prop()
    private height: number;

    @Prop({type: Boolean})
    private loading: boolean;

    @Prop({type: Boolean})
    private disableLinks: boolean;

    private width: string | null = null;
    private pageBuilderComponent: any|null = null;

    private beforeDestroy(): void {
        this.pageBuilderComponent?.$destroy();
    }

    private onLoad() {
        const pageBuilder = this.iframe.contentDocument!.body.getElementsByTagName('page-builder');

        if (pageBuilder.length > 0) {
            this.pageBuilderComponent = pageBuilderCompiler.compile(pageBuilder[0]);
        }

        if (this.disableLinks) {
            const anchors = this.iframe.contentDocument!.body.getElementsByTagName('a');

            for (const anchor of anchors) {
                anchor.addEventListener('click', (e) => e.preventDefault());
            }
        }

        this.$emit('loaded');

        EventBus.on('Frame:manual-view-size', () => {
            this.width = this.viewWidth;
        });

        EventBus.on('Frame:auto-view-size', () => {
            this.width = null;
        });
    }

    @Watch('height')
    private onHeightChange() {
        this.iframe.height = `${this.height - 42}px`;
    }

    private get viewWidth(): string {
        switch (this.viewSize) {
            case 'sm':
                return '425px';
            case 'md':
                return '768px';
            default:
                return '100%';
        }
    }
}
</script>
