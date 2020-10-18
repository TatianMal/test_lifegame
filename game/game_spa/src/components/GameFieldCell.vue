<template>
  <div :class="currentClass" @click="onClick"></div>
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
    return {
      state: undefined,
      isOwnsCurrentPlayer: this.isActiveCurrentPlayer
    };
  },
  computed: {
    currentClass () {
      if (this.isOwnsCurrentPlayer && this.isActiveOppositePlayer) return 'cell-living-both'
      if (!this.isOwnsCurrentPlayer && !this.isActiveOppositePlayer) return 'cell-empty'
      if (this.isOwnsCurrentPlayer) return 'cell-living-player'
      else return 'cell-living-opponent'
    }
  },
  watch: {
    isActiveCurrentPlayer () {
      this.isOwnsCurrentPlayer = this.isActiveCurrentPlayer
    }
  },
  methods: {
    onClick () {
      this.isOwnsCurrentPlayer = !this.isOwnsCurrentPlayer
      this.$emit('input', this.isOwnsCurrentPlayer) // for v-model
    }
  }
};
</script>

<style scoped>
  .cell-living-player { background-color: #759073; }
  .cell-empty { background-color: white; }
  .cell-living-opponent { background-color: #9d8277; }
  .cell-living-both { background-color: #d09b0b; }
</style>
