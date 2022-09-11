export class Spawner extends Phaser.GameObjects.Ellipse {
  constructor(scene, group, enemyGroup, x, y, target, config = {}) {
    super(scene, x, y, config.width || 50, config.height || 50, 0x004400);
    // console.log('creating new Spawner')
    // super(scene);
    this.scene = scene;
    this.group = group;;
    this.active = true;
    this.target = target;
    this.enemyConfig = config.enemy || { hp: 10, speed: 75 };
    this.spawnTimer = 0;
    this.timeAlive = 0;
    this.level = 1;
    this.enemies = enemyGroup;

    // create the spawner
    this.active = true;
    this.target = target;
    this.maxHP = config.hp || 250;
    this.max = config.max || 25;
    this.hp = this.maxHP;
    this.spawnTimer = 0;
    this.setData('hp', this.hp);
    this.level = 1;

    // create the spawner
    this.scene.physics.add.existing(this);
    this.scene.add.existing(this);
    this.group.add(this);

    this.health = this.scene.add.text(this.x, this.y, this.hp, 0xffffff);
  }

  preUpdate(ts, delta) {
    this.timeAlive += delta;
    this.hp = this.getData('hp');
    this.health.setText(this.hp);
    Phaser.Display.Align.In.Center(this.health, this);

    // check if spawn point is alive
    if (this.hp <= 0) {
      this.health.destroy();
      this.group.remove(this, true, true);
      return;
    }

    if (this.timeAlive > 20000) {
      this.max += 2;
      this.enemyConfig.hp += 5;
      this.enemyConfig.speed += 10;
      this.level += 1;
      this.timeAlive = 0;
      this.level += 1;
      this.scene.level = this.level;
    }
    // try to spawn another
    if (this.spawnTimer <= 0 && this.enemies.countActive() < this.max) {
      this.enemies.createEnemy(this.scene, this.enemyGroup, this.x, this.y, this.target, this, this.enemyConfig);
      this.spawnTimer = 2000 + this.enemies.countActive() * 100;
    } else {
      this.spawnTimer -= delta;
    }
  }
}