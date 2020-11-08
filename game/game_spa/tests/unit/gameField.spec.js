import { expect } from "chai";
import { mount } from "@vue/test-utils";
import GameField from "@/components/GameField";
import GameFieldCell from "@/components/GameFieldCell";

const cellsPerSide = 15;

function genCells () {
  let rows = [];
  for (let i = 0; i < cellsPerSide; i++) {
    let cells = [];
    for (let j = 0; j < cellsPerSide; j++) {
      cells.push({
        status: false,
        y: i,
        x: j,
      });
    }
    rows.push(cells);
  }
  return rows;
}

describe("Test correct rendering field", () => {
  it("count of rendered cell must be 225 (15 cell per size)", () => {
    const playerCells = genCells();
    const wrapper = mount(GameField, {
      propsData: { playerCells }
    });
    const cells = wrapper.findAll(GameFieldCell);
    expect(cells.length).to.equal(225, "count of cells is not correct");
  });
});
