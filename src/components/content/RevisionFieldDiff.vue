<!--
  - This file is part of the NumberNine package.
  -
  - (c) William Arin <williamarin.dev@gmail.com>
  -
  - For the full copyright and license information, please view the LICENSE
  - file that was distributed with this source code.
  -->

<template>
    <div v-if="hasFieldValueSinceVersion(field, version)">
        <p class="text-h6 q-ma-none">{{ title }}</p>
        <code-diff
            v-if="previous !== current"
            class="q-ma-none full-width"
            :old-string="previous"
            :new-string="current"
        />
        <p v-else v-html="current"></p>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import Revision from '../../model/interfaces/Revision';
import CodeDiff from 'vue-code-diff';

@Component({
    components: {CodeDiff}
})
export default class RevisionFieldDiff extends Vue {
    @Prop({type: String})
    private title: string;

    @Prop({type: String})
    private field: string;

    @Prop()
    private version: number;

    @Prop()
    private revisions: Revision[];

    private get previous(): string {
        return this.getFieldForVersion(this.field, this.version - 1);
    }

    private get current(): string {
        return this.getFieldForVersion(this.field, this.version);
    }

    private getFieldForVersion(fieldName: string, version: number): string {
        if (version <= 0) {
            return '';
        }

        const slice = this.revisions.slice(this.revisions.findIndex((r) => r.version === version));
        let fieldValue = slice[0][fieldName] ?? null;

        if (fieldValue) {
            return `${fieldValue}\n`;
        }

        for (let i = 1; i < slice.length; i++) {
            if (slice[i][fieldName]) {
                return `${slice[i][fieldName]}\n`;
            }
        }

        return '';
    }

    private hasFieldValueSinceVersion(fieldName: string, version: number): boolean {
        const slice = this.revisions.slice(this.revisions.findIndex((r) => r.version === version));

        for (const revision of slice) {
            if (revision[fieldName]) {
                return true;
            }
        }

        return false;
    }
}
</script>
