const BULLET_SIZE = { w: 5, h: 5 };

export class BulletGroup extends Phaser.Physics.Arcade.Group {
  constructor(scene) {
    super(scene.physics.world, scene);
    this.scene = scene;
    this.immovable = true;
    this.runChildUpdate = true;
  }

  createBullet(shooter, color, damage) {
    const b = new Bullet(this.scene, this, shooter, color, damage);
    this.add(b);
  }

  bulletHitsEnemy(bullet, enemy) {
    const fBullet = this.children.getByName(bullet.name);
    if(fBullet) fBullet.hitEnemy(enemy);
  }

}

export class Bullet extends Phaser.GameObjects.Rectangle {
  constructor(scene, group, shooter, color = 0xff4400, damage = 5) {
    super(scene, shooter.x, shooter.y, BULLET_SIZE.w, BULLET_SIZE.h, color);
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
    const enemyHP = enemy.getData('hp');
    enemy.setData('hp', enemyHP - this.damage);
    this.shooter.setData('bulletHits', this.shooter.getData('bulletHits') + 1);
    this.cleanup();
  }

  cleanup() {
    this.group.remove(this);
    this.destroy();
  }
}