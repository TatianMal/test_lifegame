<template>
  <div class="game-field">
    <template v-for="row in playerCells">
      <game-field-cell
        v-for="cell in row"
        :key="genKeyForCell(cell)"
      ></game-field-cell>
    </template>
  </div>
</template>

<script>
import GameFieldCell from "@/components/GameFieldCell";

export default {
  name: "GameField",
  props: {
    playerCells: {
      type: Array
    },
    opponentCells: {
      type: Array
    },
  },
  components: {
    GameFieldCell
  },
  data () {
    return {
    }
  },
  computed: {},
  methods: {
    genKeyForCell (cell) {
      return `${cell.x} ${cell.y}`
    }
  },
};
</script>

<style scoped>
  .game-field {
    width: 60vw;
    height: 60vh;
    display: flex;
    flex-wrap: wrap;
  }
</style>
