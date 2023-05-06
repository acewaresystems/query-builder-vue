import { Component } from 'vue';
import { SortableOptions } from 'sortablejs';
export enum RuleSetComparator {
  AND = 'AND',
  OR = 'OR'
}

export enum RuleConditions {
  EQUALS='EQUALS',
  NOT_EQUALS='NOT_EQUALS',
  GREATER_THAN='GREATER_THAN',
  LESS_THAN='LESS_THAN',
  LIKE='LIKE',
  STARTS_WITH='STARTS_WITH',
  ENDS_WITH='ENDS_WITH',
  CONTAINS='CONTAINS',
  IS_NULL='IS_NULL',
  NOT_NULL='NOT_NULL'
}

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
  currentOperator: string,
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
  ruleComponent: Component | string,
  ruleData: any,
  ruleIdentifier: string,
  updateRuleData: (newData: any) => void,
}
