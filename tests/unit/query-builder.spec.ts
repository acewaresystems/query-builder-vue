import { mount } from '@vue/test-utils';
import QueryBuilder from '@/QueryBuilder.vue';
import QueryBuilderGroup from '@/QueryBuilderGroup.vue';
import QueryBuilderRule from '@/QueryBuilderRule.vue';
import { QueryBuilderConfig } from '@/types';
import App from '../components/App.vue';
import Component from '../components/Component.vue';
import {RuleConditions, RuleSetComparator} from "../../types/constants";

interface QueryBuilderTemplate {
  value: any,
  config: QueryBuilderConfig,
}

describe('Test basic functionality of QueryBuilder.vue', () => {
  const getTemplate = (): QueryBuilderTemplate => ({
    value: null,
    config: {
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
    },
  });

  it('it renders with blank configuration', () => {
    const template = getTemplate();

    template.config.operators = [];
    template.config.rules = [];

    // The bare minimum configuration.
    // It entirely useless, but according to the spec, this is a valid configuration and show not
    // fail.
    mount(QueryBuilder, {
      propsData: template,
    });
  });

  it('selects an operator', () => {
    const app = mount(App, {
      data: getTemplate,
    });
    const wrapper = app.findComponent(QueryBuilder);

    // Assert operators are available
    const options = wrapper.find('.query-builder-group__group-selection select').findAll('option');
    expect(options).toHaveLength(3);
    expect(options.at(0).text()).toBe('Select an operator');
    expect(options.at(0).element.attributes.getNamedItem('disabled')).toBeTruthy();
    expect(options.at(1).text()).toBe('AND');
    expect((options.at(1).element as HTMLOptionElement).value).toBe(RuleSetComparator.AND);
    expect(options.at(2).text()).toBe('OR');
    expect((options.at(2).element as HTMLOptionElement).value).toBe(RuleSetComparator.OR);

    // Assert update has propagated
    options.at(2).setSelected();
    expect(wrapper.emitted('input')).toHaveLength(1);
    expect(wrapper.emitted('input')).toStrictEqual([[{ comparator: RuleSetComparator.OR, children: [] }]]);
  });

  it('selects a rule', async () => {
    const app = mount(App, {
      data: getTemplate,
    });
    const wrapper = app.findComponent(QueryBuilder);

    // Assert rules are available
    const rules = wrapper.find('.query-builder-group__group-control select').findAll('option');
    expect(rules).toHaveLength(3);
    expect(rules.at(0).text()).toBe('Select a rule');
    expect(rules.at(0).element.attributes.getNamedItem('disabled')).toBeTruthy();
    expect(rules.at(1).text()).toBe('txt');
    expect((rules.at(1).element as HTMLOptionElement).value).toBe('txt');
    expect(rules.at(2).text()).toBe('num');
    expect((rules.at(2).element as HTMLOptionElement).value).toBe('num');

    const addRuleBtn = wrapper.find('.query-builder-group__rule-adding-button');
    expect((addRuleBtn.element as HTMLButtonElement).disabled).toBeTruthy();

    // Assert update has propagated with default value
    rules.at(2).setSelected();
    await wrapper.vm.$nextTick();
    expect((addRuleBtn.element as HTMLButtonElement).disabled).toBeFalsy();
    addRuleBtn.trigger('click');
    expect(wrapper.emitted('input')).toHaveLength(1);
    expect(wrapper.emitted('input')).toStrictEqual([[{ comparator: RuleSetComparator.AND, children: [{ column: 'num', value: 10 }] }]]);

    // Manually update value
    await wrapper.vm.$nextTick();
    const num = wrapper.findComponent(Component);
    num.vm.$emit('input', 20);
    expect(wrapper.emitted('input')).toHaveLength(2);
    expect((wrapper.emitted('input') as any)[1]).toStrictEqual([{ comparator: RuleSetComparator.AND, children: [{ column: 'num', value: 20 }] }]);
  });

  it('makes use of an initial value\'s factory function', async () => {
    const initialValue = jest.fn(() => 'Hello World');

    const data = getTemplate();
    data.config.rules = [
      {
        column: 'txt',
        conditions: [],
        component: Component,
        initialValue,
      },
    ];

    const app = mount(App, {
      data() {
        return { ...data };
      },
    });
    const wrapper = app.findComponent(QueryBuilder);

    // Assert rules are available
    const group = wrapper.findComponent(QueryBuilderGroup);
    const rules = group.find('.query-builder-group__group-control select').findAll('option');
    const addRuleBtn = group.find('.query-builder-group__rule-adding-button');

    // Assert update has propagated with default value
    rules.at(1).setSelected();
    await group.vm.$nextTick();
    addRuleBtn.trigger('click');
    expect(group.emitted('query-update')).toHaveLength(1);
    expect((group.emitted('query-update') as any)[0]).toStrictEqual([{ comparator: RuleSetComparator.AND, children: [{ column: 'txt', value: 'Hello World' }] }]);
    expect(wrapper.emitted('input')).toHaveLength(1);
    expect((wrapper.emitted('input') as any)[0]).toStrictEqual([{ comparator: RuleSetComparator.AND, children: [{ column: 'txt', value: 'Hello World' }] }]);
    expect(initialValue).toHaveBeenCalled();
  });

  it('deletes a rule', () => {
    const data = () => ({
      query: {
        comparator: RuleSetComparator.AND,
        children: [
          {
            column: 'txt',
            condition: RuleConditions.EQUALS,
            value: 'A',
          },
          {
            column: 'txt',
            condition: RuleConditions.EQUALS,
            value: 'B',
          },
          {
            column: 'txt',
            condition: RuleConditions.EQUALS,
            value: 'C',
          },
        ],
      },
      config: {
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
      },
    });

    const app = mount(App, {
      data,
    });

    app.findAllComponents(QueryBuilderRule)
      .filter(({ vm }) => vm.$props.query.column === 'txt' && vm.$props.query.value === 'B')
      .at(0)
      .vm
      .$parent?.$emit('delete-child');

    expect(app.vm.$data.query).toStrictEqual({
      comparator: RuleSetComparator.AND,
      children: [
        {
          column: 'txt',
          condition: RuleConditions.EQUALS,
          value: 'A',
        },
        {
          column: 'txt',
          condition: RuleConditions.EQUALS,
          value: 'C',
        },
      ],
    });
  });

  it('renders a complex dataset', async () => {
    const data = () => ({
      query: {
        comparator: RuleSetComparator.AND,
        children: [
          {
            comparator: RuleSetComparator.AND,
            children: [
              {
                column: 'txt',
                condition: RuleConditions.EQUALS,
                value: 'A',
              },
              {
                column: 'txt',
                condition: RuleConditions.EQUALS,
                value: 'B',
              },
              {
                column: 'txt',
                condition: RuleConditions.EQUALS,
                value: 'C',
              },
              {
                comparator: RuleSetComparator.AND, // <-- on this group, we're performing our tests
                children: [
                  {
                    column: 'txt',
                    condition: RuleConditions.EQUALS,
                    value: 'c',
                  },
                  {
                    column: 'txt',
                    condition: RuleConditions.EQUALS,
                    value: 'd',
                  },
                  {
                    comparator: RuleSetComparator.AND,
                    children: [
                      {
                        column: 'txt',
                        condition: RuleConditions.EQUALS,
                        value: 'a',
                      },
                      {
                        column: 'txt',
                        condition: RuleConditions.EQUALS,
                        value: 'b',
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            comparator: RuleSetComparator.AND,
            children: [
              {
                column: 'txt',
                condition: RuleConditions.EQUALS,
                value: 'X',
              },
              {
                column: 'txt',
                condition: RuleConditions.EQUALS,
                value: 'Y',
              },
              {
                column: 'txt',
                condition: RuleConditions.EQUALS,
                value: 'Z',
              },
            ],
          },
        ],
      },
      config: {
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
            component: Component,
            initialValue: '',
          },
          {
            column: 'num',
            component: Component,
            initialValue: 10,
          },
        ],
      },
    });

    const app = mount(App, {
      data,
    });
    const wrapper = app.findComponent(QueryBuilder);

    const qbGroup = wrapper.findAllComponents(QueryBuilderGroup)
      .filter(
        ({ vm }) => (vm as (QueryBuilderGroup &
            { readonly selectedOperator: string })).selectedOperator === RuleSetComparator.AND
            && vm.$props.query.children.length === 3
            && vm.$props.query.children[0].column === 'txt'
            && vm.$props.query.children[0].value === 'c',
      )
      .at(0);

    // Assert operators are available
    const options = qbGroup.find('.query-builder-group__group-selection select').findAll('option');
    expect(options).toHaveLength(3);
    expect(options.at(0).text()).toBe('Select an operator');
    expect(options.at(0).element.attributes.getNamedItem('disabled')).toBeTruthy();
    expect(options.at(1).text()).toBe(RuleSetComparator.AND);
    expect((options.at(1).element as HTMLOptionElement).value).toBe(RuleSetComparator.AND);
    expect(options.at(2).text()).toBe(RuleSetComparator.OR);
    expect((options.at(2).element as HTMLOptionElement).value).toBe(RuleSetComparator.OR);

    // Assert update has propagated
    options.at(2).setSelected();
    expect(app.vm.$data.query).toStrictEqual({
      comparator: RuleSetComparator.OR,
      children: [
        {
          comparator: RuleSetComparator.AND,
          children: [
            {
              column: 'txt',
              value: 'A',
            },
            {
              column: 'txt',
              value: 'B',
            },
            {
              column: 'txt',
              value: 'C',
            },
            {
              comparator: RuleSetComparator.OR, // <-- changed
              children: [
                {
                  column: 'txt',
                  value: 'c',
                },
                {
                  column: 'txt',
                  value: 'd',
                },
                {
                  comparator: RuleSetComparator.AND,
                  children: [
                    {
                      column: 'txt',
                      value: 'a',
                    },
                    {
                      column: 'txt',
                      value: 'b',
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          comparator: RuleSetComparator.AND,
          children: [
            {
              column: 'txt',
              value: 'X',
            },
            {
              column: 'txt',
              value: 'Y',
            },
            {
              column: 'txt',
              value: 'Z',
            },
          ],
        },
      ],
    });

    // Edit a rule
    expect(qbGroup.vm.$props.query.children).toHaveLength(3);
    const rules = qbGroup.findAllComponents(QueryBuilderRule);
    expect(rules).toHaveLength(4);
    const rule = rules
      .filter(({ vm: { $props } }) => $props.query.column === 'txt' && $props.query.value === 'd')
      .at(0);

    await wrapper.vm.$nextTick();
    rule.find('.dummy-component').vm.$emit('input', 'D');
    expect(app.vm.$data.query).toStrictEqual({
      comparator: RuleSetComparator.OR,
      children: [
        {
          comparator: RuleSetComparator.AND,
          children: [
            {
              column: 'txt',
              value: 'A',
            },
            {
              column: 'txt',
              value: 'B',
            },
            {
              column: 'txt',
              value: 'C',
            },
            {
              comparator: RuleSetComparator.OR,
              children: [
                {
                  column: 'txt',
                  value: 'c',
                },
                {
                  column: 'txt',
                  value: 'D', // <-- changed
                },
                {
                  comparator: RuleSetComparator.AND,
                  children: [
                    {
                      column: 'txt',
                      value: 'a',
                    },
                    {
                      column: 'txt',
                      value: 'b',
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          comparator: RuleSetComparator.AND,
          children: [
            {
              column: 'txt',
              value: 'X',
            },
            {
              column: 'txt',
              value: 'Y',
            },
            {
              column: 'txt',
              value: 'Z',
            },
          ],
        },
      ],
    });

    // Add another group
    await wrapper.vm.$nextTick();
    qbGroup.find('.query-builder-group__group-adding-button')
      .trigger('click');
    expect(app.vm.$data.query).toStrictEqual({
      comparator: RuleSetComparator.OR,
      children: [
        {
          comparator: RuleSetComparator.AND,
          children: [
            {
              column: 'txt',
              value: 'A',
            },
            {
              column: 'txt',
              value: 'B',
            },
            {
              column: 'txt',
              value: 'C',
            },
            {
              comparator: RuleSetComparator.OR,
              children: [
                {
                  column: 'txt',
                  value: 'c',
                },
                {
                  column: 'txt',
                  value: 'D',
                },
                {
                  comparator: RuleSetComparator.AND,
                  children: [
                    {
                      column: 'txt',
                      value: 'a',
                    },
                    {
                      column: 'txt',
                      value: 'b',
                    },
                  ],
                },
                { // <-- Added
                  comparator: RuleSetComparator.AND,
                  children: [],
                },
              ],
            },
          ],
        },
        {
          comparator: RuleSetComparator.AND,
          children: [
            {
              column: 'txt',
              value: 'X',
            },
            {
              column: 'txt',
              value: 'Y',
            },
            {
              column: 'txt',
              value: 'Z',
            },
          ],
        },
      ],
    });

    // Remove a rule
    await wrapper.vm.$nextTick();
    rule.vm.$parent?.$emit('delete-child');
    expect(app.vm.$data.query).toStrictEqual({
      comparator: RuleSetComparator.OR,
      children: [
        {
          comparator: RuleSetComparator.AND,
          children: [
            {
              column: 'txt',
              value: 'A',
            },
            {
              column: 'txt',
              value: 'B',
            },
            {
              column: 'txt',
              value: 'C',
            },
            {
              comparator: RuleSetComparator.OR,
              children: [
                {
                  column: 'txt',
                  value: 'c',
                },
                // Delete child here
                {
                  comparator: RuleSetComparator.AND,
                  children: [
                    {
                      column: 'txt',
                      value: 'a',
                    },
                    {
                      column: 'txt',
                      value: 'b',
                    },
                  ],
                },
                { // <-- Added
                  comparator: RuleSetComparator.AND,
                  children: [],
                },
              ],
            },
          ],
        },
        {
          comparator: RuleSetComparator.AND,
          children: [
            {
              column: 'txt',
              value: 'X',
            },
            {
              column: 'txt',
              value: 'Y',
            },
            {
              column: 'txt',
              value: 'Z',
            },
          ],
        },
      ],
    });
  });
});
