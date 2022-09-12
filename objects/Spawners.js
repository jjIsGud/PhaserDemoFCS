import { Phaser } from "../phaser.js";

export class SpawnerGroup extends Phaser.Physics.Arcade.Group {
  constructor(scene, enemyGroup) {
    super(scene.physics.world, scene);
    this.scene = scene;
    this.enemyGroup = enemyGroup;
    this.immovable = true;
    this.collideWorldBounds = true;
    this.runChildUpdate = true;
  }

  createSpawner(target, x, y, config = {}) {
    const spawner = new Spawner(
      this.scene,
      this,
      this.enemyGroup,
      x,
      y,
      target,
      config
    );
    this.add(spawner, true);
    return spawner;
  }

  getSpawnerByName(name) {
    const s = this.getMatching("name", name);
    if (s?.length > 0) return s[0];
  }
}

export class Spawner extends Phaser.GameObjects.Ellipse {
  constructor(scene, group, enemyGroup, x, y, target, config = {}) {
    super(scene, x, y, config.width || 50, config.height || 50, 0x004400);
    this.scene = scene;
    this.group = group;
    this.active = true;
    this.target = target;
    this.enemyConfig = config.enemy || { hp: 10, speed: 75 };
    this.spawnTimer = 0;
    this.timeAlive = 0;
    this.level = 1;
    this.enemies = enemyGroup;
    this.x = x;
    this.y = y;

    // create the spawner
    this.active = true;
    this.target = target;
    this.maxHP = config.hp || 250;
    this.max = config.max || 25;
    this.hp = this.maxHP;
    this.spawnTimer = 0;
    this.level = 1;

    // create the spawner
    this.scene.physics.add.existing(this);
    this.scene.add.existing(this);

    this.healthDisplay = this.scene.add.text(this.x, this.y, this.hp, 0xffffff);
  }

  preUpdate(ts, delta) {
    this.timeAlive += delta;
    this.healthDisplay.setText(this.hp);
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
      this.enemies.createEnemy(
        this.x,
        this.y,
        this.target,
        this,
        this.enemyConfig
      );
      this.spawnTimer = 2000 + this.enemies.countActive() * 100;
    } else {
      this.spawnTimer -= delta;
    }
  }

  takeDamage(damage) {
    if (damage >= this.hp) {
      this.hp = 0;
      this.cleanup();
      return;
    }
    this.hp -= damage;
  }

  cleanup() {
    this.healthDisplay.destroy();
    this.group.remove(this);
    this.destroy();
  }
}
