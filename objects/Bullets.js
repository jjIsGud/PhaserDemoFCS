export class BulletGroup extends Phaser.Physics.Arcade.Group {
  constructor(scene) {
    super(scene.physics.world, scene);
    this.scene = scene;

    this.immovable = true;
    this.collideWorldBounds = false;
    this.runChildUpdate = true;
  }

  createBullet(shooter, color, damage) {
    const bullet = new Bullet(this.scene, this, shooter, color, damage);
    this.add(bullet);
    return bullet;
  }
  
  getBulletByName(name) {
    const b = this.getMatching('name', name);
    if (b?.length > 0) return b[0];
  }
}

export class Bullet extends Phaser.GameObjects.Rectangle {
  constructor(scene, group, shooter, color = 0xff4400, damage = 5) {
    super(scene, shooter.x, shooter.y, 5, 5, color);
    this.scene = scene;
    this.group = group;
    this.name = Date.now() + '' + Math.random();
    this.shooter = shooter;
    this.damage = damage;
    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);
    this.first = true
  }

  preUpdate(ts, delta) {
  if(this.first) {
    this.scene.physics.velocityFromRotation(this.shooter.rotation, 500, this.body.velocity);
    this.first = false;
  }
    if (!Phaser.Geom.Rectangle.Overlaps(this.scene.physics.world.bounds, this.getBounds())) {
      this.cleanup();
    }
  }

  hitEnemy(enemy) {
    console.log(this.shooter);
    this.shooter.bulletHits++;
    this.cleanup();
  }

  cleanup() {
    this.group.remove(this);
    this.destroy();
  }
}