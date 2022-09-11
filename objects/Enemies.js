
export class EnemyGroup extends Phaser.Physics.Arcade.Group {
  constructor(scene) {
    super(scene.physics.world, scene);
    this.scene = scene;

    this.immovable = true;
    this.collideWorldBounds = true;
    this.runChildUpdate = true;
  }

  createEnemy(x, y, target, home, config) {
    this.add(new Enemy(this,scene, this, x, y, target, home, config));
  }

  getEnemyByName(name) {
    return this.children.getByName(name);
  }

  enemyHitsTarget(enemy, target) {
    const e = this.getEnemyByName(enemy.name);
    e.hitTarget(target);
  }

  enemyGetsToBase(enemy) {
    this.getEnemyByName(enemy.name).levelUp();
    e.setState(Enemy.States.ATTACKING);
  }
}
class Enemy extends Phaser.GameObjects.Ellipse {
  constructor(scene, group, x, y, target, home, config = {}) {
    super(scene, x, y, config.width || 25, config.height || 20, config.color || 0x004444)
    this.scene = scene;
    this.group = group;
    this.target = target;
    this.name = Date.now() + '' + Math.random();
    this.home = home;
    this.active = true;
    this.maxHP = config.hp || 10;
    this.hp = this.maxHP;
    this.speed = config.speed || 75;
    this.maxSpeed = this.speed;
    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);
    this.stunnedTimer = 500;
    this.setState(Enemy.States.STUNNED);
    this.health = this.scene.add.text(this.body.x, this.body.y, this.hp)
  }

  preUpdate(ts, delta) {
    // increase timer
    this.stunnedTimer -= delta;

    // recover speed
    if(this.speed < this.maxSpeed) this.speed += 1;
    this.speed = Math.min(this.maxSpeed, this.speed);
    
    Phaser.Display.Align.In.Center(this.health, this);
    this.health.setText(this.hp);
    switch(this.state) {
      case Enemy.States.DEAD: 
        this.group.remove(this, true, true);
        this.health.destroy();
        this.destroy();
        break;
      case Enemy.States.TAKING_DAMAGE:
        this.hp = Math.max(this.hp, 0);
        this.stunnedTimer = 250;
        this.setFillStyle(0xaa4444);
        this.setState(this.hp > 0 ? Enemy.States.STUNNED : Enemy.States.DEAD);
        this.stunnedTimer = 1000;
        break;
      case Enemy.States.STUNNED:
        this.body.setVelocity(0, 0);
        this.scene.physics.moveToObject(this, this.home, this.speed);
          
        if(this.stunnedTimer <= 0) {
          this.speed = this.speed * 0.75;
          // this.setFillStyle(0x004444);
          if(Phaser.Math.Distance.Between(this.x, this.y, this.home.x, this.home.y) > 100) {
            this.setState(Math.random() * 100 < 25 ? Enemy.States.HEALING : Enemy.States.ATTACKING);
          } else {
            this.setState(Enemy.States.ATTACKING);
          }
          
        }
        break;
      case Enemy.States.HEALING:
        this.scene.physics.moveToObject(this, this.home, this.speed);
      case Enemy.States.DYING:
        // TODO: death animation
        break;
      default:
        this.scene.physics.moveToObject(this, this.target.body, this.speed);
    }
  }

  levelUp() {
    this.maxHP = Math.round(this.maxHP * 1.5);
    this.hp = this.maxHP;
    this.stunnedTimer = 1000;
    this.setState(Enemy.States.STUNNED)
    // TODO: animate power up
  }

  hitTarget(target) {
    target.hp -= Math.round(enemy.hp / 5);
    this.hp -= 10;
    this.setState(Enemy.States.TAKING_DAMAGE);
  }
  
  static States = {
    ATTACKING: 0,
    TAKING_DAMAGE: 1,
    STUNNED: 2,
    HEALING: 3,
    DYING: 4,
    DEAD: 5
  }
}

