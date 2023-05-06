<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { RuleSlotProps } from '@/types';

@Component
export default class RuleSlot extends Vue {
  @Prop({ required: true }) readonly ruleCtrl!: RuleSlotProps

  get ruleData(): any {
    return this.ruleCtrl.ruleData;
  }

  get ruleColumn(): string {
    return this.ruleCtrl.ruleColumn;
  }

  get ruleCondition(): any {
    return this.ruleCtrl.ruleCondition;
  }

  set ruleCondition(update: any) {
    this.updateConditionRuleData(update);
  }

  updateConditionRuleData(newData: any) {
    this.ruleCtrl.updateConditionRuleData(newData);
  }

  set ruleData(newData: any) {
    this.ruleCtrl.updateRuleData(newData);
  }
}
</script>

<template>
  <div>
    <span class="slot-text">{{ruleColumn}}</span>
   <select v-model="ruleCondition">
        <option disabled value="">Select a condition</option>
        <option
          v-for="rule in ruleCtrl.availableConditions"
          :key="rule"
          :value="rule"
          v-text="rule"
        />
      </select>
    <component
      :is="ruleCtrl.ruleComponent"
      v-model="ruleData"
    />
  </div>
</template>

<style lang="scss" scoped>
.slot-text {
  margin-right: 8px;
}
</style>
