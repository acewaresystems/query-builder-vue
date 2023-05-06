import { mount } from '@vue/test-utils';
import Draggable from 'vuedraggable';
import {
  QueryBuilderConfig, RuleConditions, RuleSet, RuleSetComparator,
} from '@/types';
import QueryBuilder from '@/QueryBuilder.vue';
import QueryBuilderGroup from '@/QueryBuilderGroup.vue';
import QueryBuilderChild from '@/QueryBuilderChild.vue';
import Component from '../components/Component.vue';

describe('Testing drag\'n\'drop related features', () => {
  const config: QueryBuilderConfig = {
    operators: [
      {
        name: 'and',
        identifier: RuleSetComparator.AND,
      },
      {
        name: 'or',
        identifier: RuleSetComparator.OR,
      },
    ],
    rules: [
      {
        column: 'txt',
        conditions: [],
        component: Component,
        initialValue: 'foo',
      },
      {
        column: 'num',
        conditions: [],
        component: Component,
        initialValue: 10,
      },
    ],
  };

  const value: RuleSet = {
    comparator: RuleSetComparator.OR,
    children: [{
      comparator: RuleSetComparator.AND,
      children: [{
        column: 'txt',
        condition: RuleConditions.EQUALS,
        value: 'A',
      }, {
        column: 'txt',
        condition: RuleConditions.EQUALS,
        value: 'B',
      }, {
        column: 'txt',
        condition: RuleConditions.EQUALS,
        value: 'C',
      }, {
        comparator: RuleSetComparator.AND,
        children: [{
          column: 'txt',
          condition: RuleConditions.EQUALS,
          value: 'c',
        }, {
          column: 'txt',
          condition: RuleConditions.EQUALS,
          value: 'd',
        }, {
          comparator: RuleSetComparator.AND,
          children: [{
            column: 'txt',
            condition: RuleConditions.EQUALS,
            value: 'a',
          }, {
            column: 'txt',
            condition: RuleConditions.EQUALS,
            value: 'b',
          }],
        }],
      }],
    }, {
      comparator: RuleSetComparator.AND,
      children: [{
        column: 'txt',
        condition: RuleConditions.EQUALS,
        value: 'X',
      }, {
        column: 'txt',
        condition: RuleConditions.EQUALS,
        value: 'Y',
      }, {
        column: 'txt',
        condition: RuleConditions.EQUALS,
        value: 'Z',
      }, {
        comparator: RuleSetComparator.AND,
        children: [{
          column: 'txt',
          condition: RuleConditions.EQUALS,
          value: '',
        }, {
          comparator: RuleSetComparator.AND,
          children: [{
            column: 'txt',
            condition: RuleConditions.EQUALS,
            value: '',
          }, {
            comparator: RuleSetComparator.AND,
            children: [{
              comparator: RuleSetComparator.AND,
              children: [{
                column: 'txt',
                condition: RuleConditions.EQUALS,
                value: '',
              }, {
                column: 'num',
                condition: RuleConditions.EQUALS,
                value: 10,
              }],
            }],
          }],
        }],
      }],
    }],
  };

  it('asserts nothing happens if colors are not configured', () => {
    const app = mount(QueryBuilder, {
      propsData: {
        value,
        config,
      },
    });

    const groups = app.findAllComponents(QueryBuilderGroup);
    expect(groups).toHaveLength(9);

    groups.wrappers
      .forEach(w => {
        expect(w.vm.$props).toHaveProperty('depth');
        const el = (w.findComponent(QueryBuilderChild)).element as HTMLDivElement;
        expect(el.style.borderColor).toBeFalsy();
      });
  });

  it('checks border colors are applied properly', () => {
    const colors = [
      'hsl(88, 50%, 55%)',
      'hsl(187, 100%, 45%)',
      'hsl(15, 100%, 55%)',
    ];
    const newConfig: QueryBuilderConfig = { ...config, colors };

    const app = mount(QueryBuilder, {
      propsData: {
        value,
        config: newConfig,
      },
    });

    const groups = app.findAllComponents(QueryBuilderGroup);
    expect(groups).toHaveLength(9);

    groups.wrappers
      .forEach(w => {
        expect(w.vm.$props).toHaveProperty('depth');
        const el = (w.findComponent(Draggable)).element as HTMLDivElement;
        const targetIdx = w.vm.$props.depth % w.vm.$props.config.colors.length;
        expect(el.style).toHaveProperty('borderColor', colors[targetIdx]);
      });
  });
});
