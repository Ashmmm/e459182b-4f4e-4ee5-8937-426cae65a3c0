<template>
  <div>
    <h1>Energy Saving</h1>
    <br />
    <div class="content">
      <div>
        <EnergyChart :energyData="energyData" />
      </div>
    </div>
    <br />
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
  computed: {},
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
