import { Component } from 'vue';
import { SortableOptions } from 'sortablejs';
import {RuleConditions, RuleSetComparator} from "../src/constants";


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
  ruleComponent: Component,
  ruleData: any,
  ruleColumn: string,
  ruleCondition: RuleConditions,
  availableConditions: RuleConditions[],
  updateRuleData: (newData: any) => void,
  updateConditionRuleData: (newData: any) => void,
}
