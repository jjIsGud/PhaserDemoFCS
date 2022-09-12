import { Phaser } from "../phaser.js";

export class Walls extends Phaser.Physics.Arcade.Group {
  constructor(scene) {
    super(scene.physics.world, scene);
    this.scene = scene;
  }
}
