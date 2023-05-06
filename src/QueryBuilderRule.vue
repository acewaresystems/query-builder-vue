<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { Component as VueComponent } from 'vue';
import {
  QueryBuilderConfig, Rule, RuleConditions, RuleDefinition, RuleSlotProps,
} from '@/types';
import { isQueryBuilderConfig } from '@/guards';

@Component
export default class QueryBuilderRule extends Vue {
  @Prop({
    required: true,
    validator: param => isQueryBuilderConfig(param),
  }) readonly config!: QueryBuilderConfig

  @Prop() readonly query!: Rule

  get definition(): RuleDefinition {
    const ruleDefinition = this.config
      .rules
      .find(rule => rule.column === this.query.column);

    if (ruleDefinition) {
      return ruleDefinition;
    }

    throw new Error(`Invalid column "${this.query.column}": no rule definition available.`);
  }

  get component(): VueComponent {
    return this.definition.component;
  }

  get ruleCondition(): any {
    return this.query.condition;
  }

  set ruleCondition(update: any) {
    this.ruleConditionUpdate(update);
  }

  get ruleData(): any {
    return this.query.value;
  }

  set ruleData(update: any) {
    this.ruleUpdate(update);
  }

  get ruleSlotProps(): RuleSlotProps {
    return {
      ruleComponent: this.component,
      ruleData: this.query.value,
      ruleColumn: this.query.column,
      ruleCondition: this.query.condition,
      availableConditions: this.definition.conditions,
      updateConditionRuleData: (ruleData: any) => this.ruleConditionUpdate(ruleData),
      updateRuleData: (ruleData: any) => this.ruleUpdate(ruleData),
    };
  }

  ruleUpdate(update: any) {
    this.$emit(
      'query-update',
      {
        column: this.query.column,
        value: update,
        condition: this.query.condition,
      } as Rule,
    );
  }

  ruleConditionUpdate(update: any) {
    this.$emit(
      'query-update',
      {
        column: this.query.column,
        value: this.query.value,
        condition: update,
      } as Rule,
    );
  }

  get showDragHandle(): boolean {
    if (this.config.dragging) {
      return !this.config.dragging.disabled;
    }

    return false;
  }
}
</script>

<template>
  <div class="query-builder-rule" >
    <img
      v-if="showDragHandle"
      class="query-builder__draggable-handle"
      src="./grip-vertical-solid.svg"
      alt="Drag element to target"
    >
    <template v-if="$scopedSlots.rule">
      <slot
          name="rule"
          v-bind="ruleSlotProps"
      />
    </template>
    <template v-else>
      <span class="query-builder-rule__name" v-text="definition.column" />
      <select v-model="ruleCondition">
        <option disabled value="">Select a condition</option>
        <option
          v-for="rule in definition.conditions"
          :key="rule"
          :value="rule"
          v-text="rule"
        />
      </select>
      <div class="query-builder-rule__component-container">
        <component
          :is="component"
          v-model="ruleData"
        />
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.query-builder-rule {
  position: relative;
  background-color: hsl(0, 0, 95%);
  padding: 16px;
  padding-right: 32px;
  display: flex;
  flex-direction: row;

  .query-builder__draggable-handle {
    display: none;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    left: 4px;
    width: 8px;
    cursor: move;
  }

  &:hover .query-builder__draggable-handle {
    display: block;
  }
}

.query-builder-rule__name {
  margin-right: 16px;
  font-weight: bold;
}

.query-builder-rule__component-container {
  flex: 1;
}
</style>
