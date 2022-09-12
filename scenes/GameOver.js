import { Phaser } from "./phaser.js";

export class GameOver extends Phaser.Scene {
  constructor() {
    super({ key: "game-over" });
  }

  preload() {}

  create() {
    this.add.text(100, 100, "Game Over!");
  }

  update() {}
}
