<!-- <template> -->
  <!-- <div ></div> -->
   <div :style="{ width: width + 'px', height: height + 'px' }"></div>
<!-- </template> -->

<script>
import { Bar, mixins } from 'vue-chartjs'
const { reactiveProp } = mixins

export default {
  name: 'BarChart',
  extends: Bar,
  mixins: [reactiveProp],
  props: {
    chartData: { type: Object, required: true },
    options: { type: Object, default: () => ({ responsive: true, maintainAspectRatio: false }) },
    width: { type: Number, default: 400 },
    height: { type: Number, default: 300 }
  },
  mounted () {
    this.renderChart(this.chartData, this.options)
  },
  watch: {
    options: {
      deep: true,
      handler () {
        this.renderChart(this.chartData, this.options)
      }
    }
  },
  data() {
    return {
      
    }
  }
}
</script>
<!-- 
<style scoped>
div { height: 320px; }
</style> -->