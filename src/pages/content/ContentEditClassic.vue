<!--
  - This file is part of the NumberNine package.
  -
  - (c) William Arin <williamarin.dev@gmail.com>
  -
  - For the full copyright and license information, please view the LICENSE
  - file that was distributed with this source code.
  -->

<template>
    <q-page>
        <div style="padding-top: 42px">
            <div class="row q-pa-md q-gutter-x-md" v-if="model">
                <div class="col-12 col-md-9">
                    <q-card flat>
                        <q-tabs v-model="tab"
                                align="left"
                                dense
                                inline-label
                                class="text-primary shadow-2"
                                active-color="primary"
                                indicator-color="primary">
                            <q-tab v-for="t in visibleTabs" :key="t.name" :name="t.name" :icon="t.icon" :label="$q.screen.gt.xs ? t.label : ''"/>
                        </q-tabs>

                        <q-separator/>

                        <q-tab-panels v-model="tab" keep-alive>
                            <q-tab-panel v-for="t in tabs" :key="t.name" :name="t.name">
                                <component :is="t.panel.component" v-model="model" v-bind="t.panel.props" v-on="{save, reload, ...t.panel.events}"/>
                            </q-tab-panel>
                        </q-tab-panels>
                    </q-card>
                </div>
                <div class="col q-gutter-y-md">
                    <component v-for="component in visibleSidebarComponents"
                               :key="component.id ? component.id : component.component"
                               :is="component.component"
                               v-model="model"
                               :delete-action.sync="deleteAction"
                               v-bind="{originalEntity, saveLoading, ...component.props}"
                               v-on="{save, reload, ...component.events}"/>
                </div>
            </div>
        </div>

        <q-dialog v-model="deleteAction" persistent>
            <q-card>
                <q-card-section class="row items-center">
                    <q-avatar icon="delete_forever" color="negative" text-color="white" />
                    <span class="q-ml-sm">Do you want to delete this {{ typeName }}?</span>
                </q-card-section>

                <q-card-actions align="right">
                    <q-btn flat label="No" color="secondary" @click="deleteAction = false" />
                    <q-btn flat label="Yes" color="primary" @click="confirmDelete" autofocus @keyup.enter="confirmDelete" :loading="deleteLoading"/>
                </q-card-actions>
            </q-card>
        </q-dialog>

        <MediaLibraryDialog/>

        <q-page-sticky expand position="top" style="z-index: 10">
            <q-toolbar class="bg-primary text-white">
                <q-toolbar-title v-if="id && model">{{ model.title }}</q-toolbar-title>
                <q-toolbar-title v-else>Loading...</q-toolbar-title>
                <q-btn v-if="model" flat dense color="white" icon="mdi-eye-outline" :href="model.publicUrl" type="a" target="_blank">
                    <q-tooltip>View</q-tooltip>
                </q-btn>
            </q-toolbar>
        </q-page-sticky>
    </q-page>
</template>

<script lang="ts">
import { plainToClassFromExist } from 'class-transformer';
import ClassicEditorPanelContent from 'components/content/ClassicEditorPanelContent.vue';
import ClassicEditorPanelCustomFields from 'components/content/ClassicEditorPanelCustomFields.vue';
import ClassicEditorPanelRevisions from 'components/content/ClassicEditorPanelRevisions.vue';
import ClassicEditorPanelSEO from 'components/content/ClassicEditorPanelSEO.vue';
import ClassicEditorPanelDynamic from 'components/content/ClassicEditorPanelDynamic.vue';
import ClassicEditorSidebarTaxonomy from 'components/content/ClassicEditorSidebarTaxonomy.vue';
import ClassicEditorSidebarFeaturedImage from 'components/content/ClassicEditorSidebarFeaturedImage.vue';
import ClassicEditorSidebarPageTemplate from 'components/content/ClassicEditorSidebarPageTemplate.vue';
import ClassicEditorSidebarPublish from 'components/content/ClassicEditorSidebarPublish.vue';
import ClassicEditorSidebarSwitchPageBuilder from 'components/content/ClassicEditorSidebarSwitchPageBuilder.vue';
import ClassicEditorSidebarDynamic from 'components/content/ClassicEditorSidebarDynamic.vue';
import MediaLibraryDialog from 'components/medialibrary/MediaLibraryDialog.vue';
import MediaSelect from 'components/medialibrary/MediaSelect.vue';
import { cloneDeep } from 'lodash';
import { EventBus } from 'src/event/EventBus';
import ContentEntityImpl from 'src/model/classes/ContentEntityImpl';
import ContentEntity from 'src/model/interfaces/ContentEntity';
import DynamicComponent from 'src/model/interfaces/DynamicComponent';
import Revision from 'src/model/interfaces/Revision';
import Tab from 'src/model/interfaces/Tab';
import Taxonomy from 'src/model/interfaces/Taxonomy';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import 'reflect-metadata';
import EditorExtension from 'src/model/interfaces/EditorExtension';

const ContentTypeStore = namespace('ContentType');
const ContentStore = namespace('Content');
const TaxonomyStore = namespace('Taxonomy');

@Component({
    components: {
        ClassicEditorPanelContent,
        ClassicEditorPanelSEO,
        ClassicEditorPanelCustomFields,
        ClassicEditorPanelRevisions,
        ClassicEditorPanelDynamic,
        ClassicEditorSidebarPublish,
        ClassicEditorSidebarFeaturedImage,
        ClassicEditorSidebarSwitchPageBuilder,
        ClassicEditorSidebarPageTemplate,
        ClassicEditorSidebarTaxonomy,
        ClassicEditorSidebarDynamic,
        MediaSelect,
        MediaLibraryDialog
    },
})
export default class ContentEditClassic extends Vue {
    @ContentTypeStore.State private contentTypes;
    @ContentTypeStore.Action private fetchContentTypeEditorExtension;
    @ContentTypeStore.Getter private findByName;
    @ContentStore.State private contentEntitiesRevisions;
    @ContentStore.Action private fetchFullById;
    @ContentStore.Action private saveEntity;
    @ContentStore.Action private deleteEntity;
    @ContentStore.Action private fetchContentEntityRevisions;
    @TaxonomyStore.State private taxonomies: Taxonomy[];
    @TaxonomyStore.Action private fetchTaxonomies;

    @Prop()
    private id: number;

    @Prop()
    private type: string;

    private model: ContentEntity|null = null;

    private originalEntity: ContentEntity;
    private saveLoading = false;
    private deleteLoading = false;
    private deleteAction = false;

    private tab = 'content';
    private tabs: Tab[] = [
        {
            name: 'content',
            icon: 'mdi-file-document-edit-outline',
            label: 'Content',
            panel: {
                component: 'ClassicEditorPanelContent',
            },
        },
        {
            name: 'seo',
            icon: 'mdi-card-search-outline',
            label: 'SEO',
            panel: {
                component: 'ClassicEditorPanelSEO',
            },
        },
        {
            name: 'custom_fields',
            icon: 'mdi-form-textbox',
            label: 'Custom fields',
            panel: {
                component: 'ClassicEditorPanelCustomFields',
            },
        },
        {
            visible: (instance) => instance.revisions.length > 1,
            name: 'revisions',
            icon: 'mdi-timeline-text-outline',
            label: 'Revisions',
            panel: {
                component: 'ClassicEditorPanelRevisions',
            },
        },
    ];

    private sidebarComponents: DynamicComponent[] = [
        { component: 'ClassicEditorSidebarSwitchPageBuilder' },
        { component: 'ClassicEditorSidebarPublish' },
        { component: 'ClassicEditorSidebarFeaturedImage' },
        { component: 'ClassicEditorSidebarPageTemplate' },
        {
            id: 'ClassicEditorSidebarTaxonomy_category',
            visible: () => this.doesContentTypeHasTaxonomy('category'),
            component: 'ClassicEditorSidebarTaxonomy',
            props: {
                taxonomy: 'category',
            }
        },
        {
            id: 'ClassicEditorSidebarTaxonomy_tag',
            visible: () => this.doesContentTypeHasTaxonomy('tag'),
            component: 'ClassicEditorSidebarTaxonomy',
            props: {
                taxonomy: 'tag',
            }
        },
    ];

    private created() {
        EventBus.on('ContentType:loaded', () => { this.getEntity(); });

        this.fetchTaxonomies();

        if(this.contentTypes.length > 0) {
            this.getEntity();
        }
    }

    private async getEntity() {
        this.originalEntity = await this.fetchFullById({type: this.type, id: this.id});
        this.model = plainToClassFromExist(new ContentEntityImpl(), cloneDeep(this.originalEntity));
        this.fetchContentEntityRevisions(this.model);

        const extension: EditorExtension = await this.fetchContentTypeEditorExtension(this.type);
        extension.tabs.forEach((tab) => {
            this.tabs.push({
                name: tab.name,
                icon: tab.parameters.icon ?? 'mdi-file-document-edit-outline',
                label: tab.parameters.label,
                panel: {
                    component: 'ClassicEditorPanelDynamic',
                    props: {
                        'extension': tab,
                    }
                },
            });
        });

        extension.sidebarComponents.forEach((sidebarComponent) => {
            this.sidebarComponents.push({
                id: `ClassicEditorSidebarDynamic_${sidebarComponent.name}`,
                component: 'ClassicEditorSidebarDynamic',
                props: {
                    'extension': sidebarComponent,
                },
            });
        });

        EventBus.emit('ContentEditClassic:sidebarComponents', {type: this.type, sidebarComponents: this.sidebarComponents});
        EventBus.emit('ContentEditClassic:tabs', {type: this.type, tabs: this.tabs});
    }

    private async save(done: () => void) {
        if (!this.model) {
            return;
        }

        this.saveLoading = true;
        let newModel = cloneDeep(this.model);
        newModel = await this.saveEntity(newModel);
        this.model = plainToClassFromExist(new ContentEntityImpl(), newModel);
        this.saveLoading = false;

        if (done) {
            done();
        }

        await this.fetchContentEntityRevisions(this.model);
    }

    private reload() {
        this.getEntity();
    }

    private get typeName(): string {
        if (!this.model) {
            return '';
        }

        return this.findByName(this.model?.type).name.toLowerCase();
    }

    private async confirmDelete() {
        this.deleteLoading = true;
        await this.deleteEntity(this.model);
        this.deleteLoading = false;
        this.deleteAction = false;
        await this.$router.push({name: this.type + '_index'});
    }

    private get revisions(): Revision[] {
        if (this.contentEntitiesRevisions.hasOwnProperty(this.type) && this.contentEntitiesRevisions[this.type].hasOwnProperty(this.id.toString())) {
            return this.contentEntitiesRevisions[this.type][this.id.toString()] ?? [];
        }

        return [];
    }

    @Watch('revisions')
    private onRevisionsChanged(): void {
        if (this.tab === 'revisions' && this.revisions.length <= 1) {
            this.tab = 'content';
        }
    }

    private doesContentTypeHasTaxonomy(taxonomy: string): boolean {
        return this.taxonomies.filter((t) => t.contentTypes?.includes(this.type) && t.name === taxonomy).length > 0;
    }

    private get visibleTabs(): Tab[] {
        return this.tabs.filter((tab) => !tab.visible || tab.visible(this));
    }

    private get visibleSidebarComponents(): DynamicComponent[] {
        return this.sidebarComponents.filter((sidebarComponent) => !sidebarComponent.visible || sidebarComponent.visible(this));
    }
}
</script>
