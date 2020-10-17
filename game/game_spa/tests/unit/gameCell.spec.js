import { expect } from "chai";
import { mount } from "@vue/test-utils";
import GameFieldCell from "@/components/GameFieldCell";

describe("Test correct rendering with several states", () => {
  it("if only current player is owner of the cell, it must have class for living player", () => {
    const isActiveCurrentPlayer = true;
    const className = "cell-living-player";
    const wrapper = mount(GameFieldCell, {
      propsData: { isActiveCurrentPlayer }
    });
    expect(wrapper.classes()).to.include(className);
  });

  it("if no one is owner of the cell, it must have empty class", () => {
    const className = "cell-empty";
    const wrapper = mount(GameFieldCell, {});
    expect(wrapper.classes()).to.include(className);
  });

  it("if only opponent is owner of the cell, it must have class for opponent", () => {
    const isActiveOppositePlayer = true;
    const className = "cell-living-opponent";
    const wrapper = mount(GameFieldCell, {
      propsData: { isActiveOppositePlayer }
    });
    expect(wrapper.classes()).to.include(className);
  });

  it("if both players are owners of the cell, it must have class for both", () => {
    const isActiveCurrentPlayer = true;
    const isActiveOppositePlayer = true;
    const className = "cell-living-both";
    const extraClasses = ["cell-living-opponent", "cell-living-player"];
    const wrapper = mount(GameFieldCell, {
      propsData: {
        isActiveCurrentPlayer,
        isActiveOppositePlayer,
      }
    });
    const classes = wrapper.classes()
    expect(classes.length).to.not.include(extraClasses, 'has extra classes!')
    expect(classes).to.include(className);
  });
});
