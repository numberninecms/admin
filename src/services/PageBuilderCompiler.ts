/*
 * This file is part of the NumberNine package.
 *
 * (c) William Arin <williamarin.dev@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Vue } from 'vue-property-decorator';
import PageBuilder from '../components/pagebuilder/PageBuilder.vue';
import PageBuilderComponent from '../components/pagebuilder/PageBuilderComponent.vue';
import store from '../store';
import * as changeCase from 'change-case';

class PageBuilderCompiler {
    public constructor() {
        Vue.component('PageBuilderStyle', {
            render: function(createElement) {
                return createElement('style', this.$slots.default)
            }
        });
    }

    public compile(element: Element) {
        const el = document.createElement('div');
        element.parentNode!.insertBefore(el, element);

        const res = Vue.compile(element.outerHTML);
        const pageBuilderComponent = new Vue({
            components: { PageBuilder },
            render: res.render,
            staticRenderFns: res.staticRenderFns,
            store,
        }).$mount(el);

        element.parentNode!.removeChild(element);

        return pageBuilderComponent;
    }

    public compileComponent(componentName: string, template: string) {
        const name = changeCase.pascalCase(componentName) + 'PageBuilderComponent';
        const componentExists = Object.keys((Vue as any).options.components).includes(name);

        if (!componentExists) {
            Vue.component(name, {
                components: {PageBuilderComponent, PageBuilderStyle: Vue.component('PageBuilderStyle')},
                template,
                props: ['parameters', 'responsive', 'computed', 'children', 'selfInstance', 'viewSize'],
                methods: {
                    isResponsive(field) {
                        return this.responsive.includes(field);
                    },
                    getResponsiveValue(field) {
                        if (!this.isResponsive(field)) {
                            return this.parameters[field];
                        }

                        return this.parameters[field].hasOwnProperty(this.viewSize) ? this.parameters[field][this.viewSize] : '';
                    }
                }
            });
        }
    }
}

const pageBuilderCompiler = new PageBuilderCompiler();
export default pageBuilderCompiler;
