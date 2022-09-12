import { Phaser } from "./phaser.js";

export class StartMenu extends Phaser.Scene {
  constructor() {
    super({ key: "start-menu", active: true });
  }

  preload() {
    console.log("loading StartMenu");
  }

  create() {
    this.add.text(150, 150, "Press RT Button Fire in direction of Right Stick");
    this.add.text(150, 175, "Press LT to Sprint (watch stamina!)");
    this.add.text(150, 225, "Enemies get Stronger every 20s!");
    this.add.text(150, 250, "Injured Enemies might go home and get BEEFY!");
    this.add.text(150, 325, 'Press "A" to Start!');
  }

  update() {
    if (this.input.gamepad.total > 0) {
      const pad = this.input.gamepad.getPad(0);
      if (pad.A) {
        this.scene.start("main-level");
      }
    }
  }
}
