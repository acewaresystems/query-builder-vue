import { shallowMount } from '@vue/test-utils';
import Vue, { Component as VueComponent } from 'vue';
import QueryBuilderChild from '@/QueryBuilderChild.vue';
import {
  QueryBuilderConfig,
  Rule,
  RuleConditions,
  RuleDefinition,
  RuleSet,
  RuleSetComparator,
} from '@/types';
import Component from '../components/Component.vue';

interface QueryBuilderChildInterface extends Vue {
  component: VueComponent,
  definition: RuleDefinition | null,
  ruleDefinition: RuleDefinition | null,
}

describe('Testing QueryBuilderChild', () => {
  const config: QueryBuilderConfig = {
    operators: [
      {
        name: 'AND',
        identifier: RuleSetComparator.AND,
      },
      {
        name: 'OR',
        identifier: RuleSetComparator.OR,
      },
    ],
    rules: [
      {
        column: 'txt',
        conditions: [],
        component: Component,
        initialValue: '',
      },
      {
        column: 'num',
        conditions: [],
        component: Component,
        initialValue: 10,
      },
    ],
    dragging: {
      animation: 300,
      disabled: false,
      ghostClass: 'ghost',
    },
  };

  it('tests if QueryBuilderChild handles rule query', () => {
    const query: Rule = {
      column: 'txt',
      condition: RuleConditions.EQUALS,
      value: 'A',
    };

    const child = shallowMount(QueryBuilderChild, {
      propsData: {
        config: { ...config },
        query: { ...query },
      },
    });

    expect((child.vm as QueryBuilderChildInterface).component.name).toBe('QueryBuilderRule');
    expect((child.vm as QueryBuilderChildInterface).definition).not.toBeNull();
    expect((child.vm as QueryBuilderChildInterface).ruleDefinition).not.toBeNull();
  });

  it('tests if QueryBuilderChild handles group query', () => {
    const query: RuleSet = {
      comparator: RuleSetComparator.AND,
      children: [{
        column: 'txt',
        condition: RuleConditions.EQUALS,
        value: 'X',
      }],
    };

    const child = shallowMount(QueryBuilderChild, {
      propsData: {
        config: { ...config },
        query: { ...query },
      },
    });

    expect((child.vm as QueryBuilderChildInterface).component.name).toBe('QueryBuilderGroup');
    expect((child.vm as QueryBuilderChildInterface).definition).toBeNull();
    expect((child.vm as QueryBuilderChildInterface).ruleDefinition).toBeNull();
  });
});
