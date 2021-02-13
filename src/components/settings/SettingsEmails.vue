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
        <q-input v-model="senderName" filled label="Sender name" clearable/>
        <q-input v-model="senderAddress" type="email" filled label="Sender email address" clearable/>
    </div>
</template>
<script lang="ts">
import SettingsBaseComponent from 'components/settings/SettingsBaseComponent';
import ContentEntity from 'src/model/interfaces/ContentEntity';
import GenericObject from 'src/model/interfaces/GenericObject';
import { Component } from 'vue-property-decorator';
import { namespace } from 'vuex-class';

const ContentStore = namespace('Content');

@Component
export default class SettingsEmails extends SettingsBaseComponent {
    @ContentStore.State private contentEntities: GenericObject<ContentEntity[]>;
    @ContentStore.Action private fetchAll;

    private get senderName(): string|null {
        return this.getSettingAs('mailer_sender_name', 'string');
    }

    private set senderName(value: string|null) {
        this.setSettingAs<string>('mailer_sender_name', value);
    }

    private get senderAddress(): string|null {
        return this.getSettingAs('mailer_sender_address', 'string');
    }

    private set senderAddress(value: string|null) {
        this.setSettingAs<string>('mailer_sender_address', value);
    }
}
</script>
