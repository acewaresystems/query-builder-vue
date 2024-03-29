import Vue, { Component } from 'vue';
import { SortableOptions } from 'sortablejs';
import {RuleConditions, RuleSetComparator} from "../types/constants";

export interface Rule {
  column: string
  condition: RuleConditions
  value: any
}

export interface RuleSet {
  comparator: RuleSetComparator,
  children: Array<RuleSet | Rule>,
}

export interface OperatorDefinition {
  identifier: RuleSetComparator,
  name: string,
}

export interface RuleDefinition {
  column: string,
  conditions: RuleConditions[]
  component: Component,
  initialValue?: any,
}

export interface QueryBuilderConfig {
  operators: OperatorDefinition[],
  rules: RuleDefinition[],
  maxDepth?: number,
  colors?: string[],
  dragging?: SortableOptions,
}

export interface GroupOperatorSlotProps {
  currentOperator: RuleSetComparator,
  operators: OperatorDefinition[],
  updateCurrentOperator: (newOperator: string) => void,
}

export interface GroupCtrlSlotProps {
  maxDepthExeeded: boolean,
  rules: RuleDefinition[],
  addRule: (newRule: string) => void,
  newGroup: () => void,
}

export interface RuleSlotProps {
  ruleComponent: Component,
  ruleData: any,
  ruleColumn: string,
  ruleCondition: RuleConditions,
  availableConditions: RuleConditions[],
  updateRuleData: (newData: any) => void,
  updateConditionRuleData: (newData: any) => void,
}

export const QueryBuilderGroupSym = Symbol('QueryBuilderGroup');

export interface QueryBuilderGroup extends Vue {
  comparator: RuleSetComparator,
  depth: number,
  trap: ((position: number, newChild: RuleSet | Rule) => void) | null,
  children: Array<RuleSet | Rule>,
  type: Symbol,
}

export interface ComponentRegistration {
  component: QueryBuilderGroup,
  ev: RuleSet,
  adding: boolean,
  affectedIdx: number,
}

export interface MergeTrap {
  registerSortUpdate(update: ComponentRegistration): void,
}
