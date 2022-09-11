export class PotionGroup extends Phaser.Physics.Arcade.Group {
  // https://www.codecaptain.io/blog/game-development/shooting-bullets-phaser-3-using-arcade-physics-groups/696
  constructor(scene) {
    super(scene.physics.world, scene);
    this.scene = scene;
    this.immovable = true;
  }

  createPotion(x, y, value) {
    this.add(new HealthPotion(this.scene, this, x, y, value), true);
  }

  consume(player, potion) {
    const fPotion = this.children.getByName(potion.name);
    fPotion.consumedBy(player);
  }
}

class HealthPotion extends Phaser.GameObjects.Star {
  constructor(scene, group, x, y, startingHP) {
    super(scene, x, y, 3, 5, 10, 0xff0000);
    this.x = x;
    this.y = y;
    this.name = Date.now() + '' + Math.random();
    this.scene = scene;
    this.group = group;
    this.health = startingHP;
    this.scene.add.existing(this);

    this.healthDisplay = this.scene.add.text(this.x, this.y, Math.round(this.health), { fontSize: 10 });
    Phaser.Display.Align.In.Center(this.healthDisplay, this);
  }

  preUpdate(ts, delta) {
    // remove hp from potion over time
    this.health -= delta / 500;

    // remove it from the game when it hits 0
    if (this.health <= 0) {
      this.healthDisplay.destroy();
      this.group.remove(this, true, true);
      this.destroy();
      return;
    }

    // show health in potion (temporary)
    this.healthDisplay.setText(Math.round(this.health));
    Phaser.Display.Align.In.Center(this.healthDisplay, this);
  }

  consumedBy(player) {
    const playerHP = player.getData('hp');
    const playerMaxHP = player.getData('maxHP');
    player.setData('hp', Math.min(playerMaxHP, playerHP + this.health));
    this.healthDisplay.destroy();
    this.group.killAndHide(this);
  }

}