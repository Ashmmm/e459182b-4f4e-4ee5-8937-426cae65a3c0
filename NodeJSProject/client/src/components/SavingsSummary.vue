<template>
  <div>
    <div v-if="title" style="font-weight: bold">
      {{ title }}
    </div>
    <div :style="descStyle">
      {{ description }}
    </div>
    <div :style="valueStyle">
      {{ savingsValue }}
    </div>
    <div :style="unitStyle">
      {{ unit }}
    </div>
  </div>
</template>

<script>
export default {
  name: "SavingsSummary",
  props: {
    // Strings
    title: String,
    description: String,
    savingsValue: String,
    unit: String,
    // Styles
    titleStyle: Object,
    descStyle: Object,
    valueStyle: Object,
    unitStyle: Object,
  },
};
</script>
