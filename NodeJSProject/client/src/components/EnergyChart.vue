<!--Component to show energy savings-->
<template>
  <div class="title">Estimated carbon savings and diesel savings</div>
  <div class="savingsTitle">Estimated carbon savings</div>
  <div class="subTitle">1 Tonne = 1,000 kg</div>
  <div class="summary">
    <div>
      <SavingsSummary
        :description="'Total'"
        :savingsValue="totalCarbonSavings.toFixed(1)"
        :unit="'Tonnes'"
        :descStyle="descStyle"
        :valueStyle="carbonValStyle"
        :unitStyle="carbonUnitStyle"
      />
    </div>
    <div>
      <SavingsSummary
        :description="'Monthly'"
        :savingsValue="averageMonthlyCarbonSavings.toFixed(1)"
        :unit="'Tonnes'"
        :descStyle="descStyle"
        :valueStyle="carbonValStyle"
        :unitStyle="carbonUnitStyle"
      />
    </div>
  </div>
  <div class="savingsTitle">Estimated diesel savings</div>
  <div class="summary">
    <div>
      <SavingsSummary
        :description="'Total'"
        :savingsValue="totalFuelSavings.toFixed(1)"
        :unit="'Litres'"
        :descStyle="descStyle"
        :valueStyle="dieselValStyle"
        :unitStyle="dieselUnitStyle"
      />
    </div>
    <div>
      <SavingsSummary
        :description="'Monthly'"
        :savingsValue="averageMonthlyFuelSavings.toFixed(1)"
        :unit="'Litres'"
        :descStyle="descStyle"
        :valueStyle="dieselValStyle"
        :unitStyle="dieselUnitStyle"
      />
    </div>
  </div>
  <div class="user">
    <label for="startDate">Start Date:</label>
    <input
      type="date"
      id="startDate"
      v-model="startDate"
      @change="dateRangeChanged"
    />
    -
    <label for="endDate">End Date:</label>
    <input
      type="date"
      id="endDate"
      v-model="endDate"
      @change="dateRangeChanged"
    />
  </div>
  <div class="user">
    <button @click="filterData('30days')">Last 30 days</button>
    <button @click="filterData('60days')">Last 60 Days</button>
    <button @click="filterData('year')">Last year</button>
  </div>
  <div class="summaryOnChart">
    <div>
      <SavingsSummary
        :title="'Estimated carbon savings'"
        :description="'Sum of selected date Range'"
        :savingsValue="totalCarbonSavings.toFixed(1)"
        :unit="'Tonnes'"
        :descStyle="descStyle"
        :valueStyle="carbonValStyle"
        :unitStyle="carbonUnitStyle"
      />
    </div>
    <div>
      <SavingsSummary
        :title="'Estimated diesel savings'"
        :description="'Sum of selected date range'"
        :savingsValue="(totalFuelSavings / 1000).toFixed(1) + 'k'"
        :unit="'Litres'"
        :descStyle="descStyle"
        :valueStyle="dieselValStyle"
        :unitStyle="dieselUnitStyle"
      />
    </div>
  </div>
  <div ref="chartContainer" style="height: 400px"></div>
</template>

<script>
import * as echarts from "echarts";
import dayjs from "dayjs";
import SavingsSummary from "./SavingsSummary.vue";

export default {
  name: "EnergyChart",
  props: {
    energyData: Array,
  },
  components: {
    SavingsSummary,
  },
  data() {
    return {
      chart: null,
      startDate: "",
      endDate: "",
      filteredData: [],
      // For Summaries
      totalCarbonSavings: 0,
      averageMonthlyCarbonSavings: 0,
      totalFuelSavings: 0,
      averageMonthlyFuelSavings: 0,
      totalFuel: "", // Formatted with thousands-seperator
      monthlyFuel: "", // Formatted with thousands-seperator
      // Styles passing into component
      descStyle: {
        color: "rgb(110, 117, 142)",
      },
      carbonValStyle: {
        color: "rgb(0, 204, 176)",
        fontSize: "30px",
      },
      dieselValStyle: {
        color: "rgb(62, 57, 255)",
        fontSize: "30px",
      },
      carbonUnitStyle: {
        color: "rgb(65, 209, 168)",
      },
      dieselUnitStyle: {
        color: "rgb(94, 76, 255)",
      },
    };
  },
  mounted() {
    this.initDates();
    this.initChart();
    this.calculateSummary();
  },
  watch: {
    energyData: {
      immediate: true, // Trigger the watcher immediately when the component is created
      handler(newData) {
        if (newData.length > 0) {
          this.initDates(); // Force ini chart again with the new data
          this.calculateSummary();
        }
      },
    },
  },
  methods: {
    initDates() {
      if (this.energyData.length > 0) {
        this.startDate = this.energyData[0].timestamp.slice(0, 10); // Input labels won't store this string if without slice
        this.endDate = this.energyData[
          this.energyData.length - 1
        ].timestamp.slice(0, 10); // Input labels won't store this string if without slice
        this.applyFilter(dayjs(this.startDate), dayjs(this.endDate));
      }
    },
    initChart() {
      this.chart = echarts.init(this.$refs.chartContainer);
      this.updateChart(this.filteredData);
    },
    dateRangeChanged() {
      this.applyFilter(dayjs(this.startDate), dayjs(this.endDate));
      this.calculateSummary();
    },
    calculateSummary() {
      // Calculate total carbon savings and total fuel savings
      this.totalCarbonSavings =
        this.filteredData.reduce(
          (total, data) => total + parseFloat(data.carbon_saved),
          0
        ) / 1000;
      this.totalFuelSavings = this.filteredData.reduce(
        (total, data) => total + parseFloat(data.fueld_saved),
        0
      );

      // Calculate total months
      const startDate = dayjs(this.startDate);
      const endDate = dayjs(this.endDate);
      const totalMonths = endDate.diff(startDate, "month") + 1;

      // Calculate average monthly carbon savings and average monthly fuel savings
      this.averageMonthlyCarbonSavings = this.totalCarbonSavings / totalMonths;
      this.averageMonthlyFuelSavings = this.totalFuelSavings / totalMonths;
      /*
      this.totalFuel = this.totalFuelSavings
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      this.monthlyFuel = this.averageMonthlyFuelSavings
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      */
    },
    filterData(period) {
      let endDate = dayjs();
      let startDate = endDate;

      switch (period) {
        case "year":
          startDate = endDate.subtract(1, "year");
          break;
        case "60days":
          startDate = endDate.subtract(60, "days");
          break;
        case "30days":
          startDate = endDate.subtract(30, "days");
          break;
      }

      this.startDate = startDate.format("YYYY-MM-DD");
      this.endDate = endDate.format("YYYY-MM-DD");

      this.applyFilter(startDate, endDate);
      this.calculateSummary();
    },
    applyFilter(startDate, endDate) {
      this.filteredData = this.energyData.filter(
        (d) =>
          dayjs(d.timestamp).isAfter(startDate) &&
          dayjs(d.timestamp).isBefore(endDate)
      );
      this.updateChart(this.filteredData);
    },
    updateChart(data) {
      const processedData = this.aggregateDataByMonth(data);
      if (this.chart) {
        this.chart.setOption(this.getOption(processedData), true);
      }
    },
    aggregateDataByMonth(data) {
      const aggregatedData = data.reduce((acc, cur) => {
        const month = cur.timestamp.slice(0, 7);
        if (!acc[month]) {
          acc[month] = { timestamp: month, carbon_saved: 0, fueld_saved: 0 };
        }
        acc[month].carbon_saved += parseFloat(cur.carbon_saved);
        acc[month].fueld_saved += parseFloat(cur.fueld_saved);
        return acc;
      }, {});
      return Object.values(aggregatedData);
    },
    getOption(data) {
      const xAxisData = data.map((item) => item.timestamp);
      const carbonData = data.map((item) => item.carbon_saved / 1000); // Convert to tonnes
      const fuelData = data.map((item) => item.fueld_saved);

      return {
        tooltip: {
          show: true,
          trigger: "item",
          formatter: function (params) {
            const value = params.value.toFixed(1);
            return params.seriesName + ": " + value;
          },
        },
        legend: {
          data: ["Carbon savings", "Diesel savings"],
          bottom: 10,
        },
        xAxis: {
          type: "category",
          data: xAxisData.map((date) => dayjs(date).format("MMM YYYY")),
        },
        yAxis: [
          {
            type: "value",
            name: "",
          },
          {
            type: "value",
            name: "",
            axisLabel: {
              formatter: function (value) {
                return value / 1000 + "k";
              },
            },
          },
        ],
        series: [
          {
            name: "Carbon savings",
            type: "bar",
            data: carbonData,
            yAxisIndex: 0,
            itemStyle: {
              color: "rgb(13, 207, 167)",
            },
          },
          {
            name: "Diesel savings",
            type: "bar",
            data: fuelData,
            yAxisIndex: 1,
            itemStyle: {
              color: "rgb(74, 70, 255)",
            },
          },
        ],
      };
    },
  },
};
</script>

<style scoped>
.title {
  border-top-left-radius: 15px;
  border-top-right-radius: 15px;
  background-color: rgb(233, 251, 247);
  border-bottom: 1px solid rgb(223, 223, 223);
  color: rgb(29, 208, 173);
  font-size: 30px;
  text-align: left;
  padding-left: 20px;
  padding-top: 10px;
  padding-bottom: 10px;
}

.savingsTitle {
  font-weight: bold;
  font-size: 20px;
  padding-left: 20px;
  padding-top: 10px;
  text-align: left;
}

.subTitle {
  color: rgb(123, 118, 137);
  padding-left: 20px;
  text-align: left;
}

.summary {
  border-bottom: 1px solid rgb(223, 223, 223);
  padding-left: 20px;
  padding-top: 10px;
  padding-bottom: 10px;
  display: flex;
  flex-direction: row;
}

.summaryOnChart {
  padding-left: 20px;
  padding-top: 10px;
  padding-bottom: 10px;
  display: flex;
  flex-direction: row;
}

.summaryOnChart > div {
  flex: 1 1 auto;
  text-align: center;
}

.summary > div {
  flex: 1 1 auto;
  text-align: center;
}

.user {
  padding: 10px;
}
</style>
