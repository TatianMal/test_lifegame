<template>
  <div :class="currentClass"></div>
</template>

<script>
export default {
  name: "GameFieldCell",
  props: {
    isActiveCurrentPlayer: {
      type: Boolean,
      default: false
    },
    isActiveOppositePlayer: {
      type: Boolean,
      default: false
    }
  },
  components: {
  },
  data () {
    return {};
  },
  computed: {
    currentClass () {
      if (this.isActiveCurrentPlayer && this.isActiveOppositePlayer) return 'cell-living-both'
      if (!this.isActiveCurrentPlayer && !this.isActiveOppositePlayer) return 'cell-empty'
      if (this.isActiveCurrentPlayer) return 'cell-living-player'
      else return 'cell-living-opponent'
    }
  },
  methods: {}
};
</script>

<style scoped>
  .cell-living-player { background-color: #759073; }
  .cell-empty { background-color: white; }
  .cell-living-opponent { background-color: #9d8277; }
  .cell-living-both { background-color: #d09b0b; }
</style>
