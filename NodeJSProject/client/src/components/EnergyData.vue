<template>
  <div>
    <h1>Energy Saving</h1>
    <br />
    <div class="content">
      <!--
      <div>Total Carbon Saved: {{ totalCarbonSaved }}</div>
      -->
      <div>
        <EnergyChart :energyData="energyData" />
      </div>
    </div>
    <br />
    <!--
    <ul>
      <li v-for="entry in energyData" :key="entry.id">
        Device ID: {{ entry.device_id }} - Carbon Saved:
        {{ entry.carbon_saved }}
      </li>
    </ul>
    -->
  </div>
</template>

<script>
import EnergyChart from "./EnergyChart.vue";

import axios from "axios";
export default {
  name: "EnergyData",
  components: {
    EnergyChart,
  },
  data() {
    return {
      energyData: [],
      error: null,
    };
  },
  computed: {
    /*
    totalCarbonSaved() {
      return this.energyData
        .reduce((total, item) => {
          return total + parseFloat(item.carbon_saved);
        }, 0)
        .toFixed(1);
    },
    */
  },
  mounted() {
    this.fetchEnergyData();
  },
  methods: {
    // Method to fetch data from the API
    fetchEnergyData() {
      axios
        .get("http://localhost:3000/api/energy-data")
        .then((response) => {
          this.energyData = response.data; // Set the fetched data to energyData
          console.log("Received data:", this.energyData.slice(0, 20));
        })
        .catch((error) => {
          this.error = "Failed to load data: " + error.message; // Handle any errors
          console.error(this.error);
        });
    },
  },
};
</script>

<style scoped>
.content {
  width: 90%;
  margin: auto;
  font-family: "Trebuchet MS", sans-serif;
}
</style>
