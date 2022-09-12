import { PlayerGroup } from '../objects/Player.js';
import { SpawnerGroup } from '../objects/Spawners.js';
import { BulletGroup } from '../objects/Bullets.js';
import { Enemy, EnemyGroup } from '../objects/Enemies.js';
import { PotionGroup } from '../objects/HealthPotions.js';

export class MainLevel extends Phaser.Scene {
  constructor() {
    super({ key: 'main-level' });
  }

  preload() {
    console.log('loading MainLevel');
  }

  create() {
    this.level = 1;
    this.levelDisplay = this.add.text(350, 550, 'Level 1');
    this.score = 0;
    this.scoreDisplay = this.add.text(350, 565, 'Score: 0');
    this.timer = 0;
    this.timerDisplay = this.add.text(350, 580, 'Timer: 0');
    this.active = true;

    // create groups
    this.createGroups();
    
    // create player
    this.player = this.players.createPlayer(50, 300, 0xffffff);

    // create colliders
    this.createColliders();

    // create initial spawners
    this.createInitialSpawners();
  }
  
  update(ts, delta) {
    if (this.active) this.timer += delta;
    this.levelDisplay.setText(`Level ${this.level}`);
    this.scoreDisplay.setText(`Score: ${this.score}`);
    this.timerDisplay.setText(`Time: ${Math.round(this.timer, 2) / 1000}s`);

    if (this.spawners.countActive() + this.enemies.countActive() <= 0) {
      this.add.text(350, 280, 'YOU WIN!');
      this.active = false;
      this.scene.pause();
    }
  }

  createGroups() {
    // health potionss
    this.healthPotions = new PotionGroup(this);

    // bullets
    this.bullets = new BulletGroup(this);
    
    // player (in case we want multiple)
    this.players = new PlayerGroup(this, this.bullets);
    
    // enemies
    this.enemies = new EnemyGroup(this);
    
    // create spawner groups
    this.spawners = new SpawnerGroup(this, this.enemies);
  }

  createColliders() {
    // bullet hits enemy
    this.physics.add.collider(
      this.bullets,
      this.enemies,
      this.bulletHitsEnemy,
      null,
      this
    )

    // enemy hits player
    this.physics.add.collider(
      this.enemies,
      this.players,
      this.enemyHitsPlayer,
      null,
      this
    )

    // bullet hits spawner
    this.physics.add.collider(
      this.bullets,
      this.spawners,
      this.bulletHitsSpawn,
      null,
      this
    );

    // player runs into spawner
    this.physics.add.collider(
      this.players,
      this.spawners,
      this.playerHitsSpawn,
      null,
      this
    );

    // player gets health potion
    this.physics.add.collider(
      this.players,
      this.healthPotions,
      this.healthPotions.consume,
      null,
      this
    )

    // enemy makes it to base
    this.physics.add.collider(
      this.enemies,
      this.spawners,
      this.enemies.enemyGetsToBase,
      null,
      this
    )

  }

  createInitialSpawners() {
    this.spawners.createSpawner(this.enemies, this.player, 775, 25, { hp: 100 });
    this.spawners.createSpawner(this.enemies, this.player, 775, 575, { hp: 400 });
    this.spawners.createSpawner(this.enemies, this.player, 25, 25, { hp: 500 });
    this.spawners.createSpawner(this.enemies, this.player, 25, 575);
  } 

  bulletHitsEnemy(bullet, enemy) {
    const b = this.bullets.getBulletByName(bullet.name);
    const e = this.enemies.getEnemyByName(enemy.name);
    if(!b || !e) {
      console.log(`*OOPS* enemy or bullet not found during bulletHitsEnemy,enemy=${enemy.name}, bullet=${bullet.name}`);
      return;
    }
    e.takeDamage(b.damage);
    b.hitEnemy(e);

    // if enemy was killed, update score and change for potion
    if(e.state === Enemy.States.DYING) {
      this.score += e.maxHP;
      if(Math.random() < 0.25) {
        this.healthPotions.createPotion(e.x, e.y, e.maxHP);
      }
    }
  }

  enemyHitsPlayer(enemy, player) {
    const p = this.players.getPlayerByName(player.name);
    const e = this.enemies.getEnemyByName(enemy.name);
    e.hitTarget(e, p);
  }

  bulletHitsSpawn(bullet, spawner) {
    const b = this.bullets.getBulletByName(bullet.name);
    const s = this.spawners.getSpawnerByName(spawner.name);
    b.hitEnemy(s);
    s.takeDamage(b.damage);
    if(s.hp <= 0) {
      this.score += spawner.getData('maxHP');
      this.healthPotions.createPotion(s.x, s.y, 100);
    }
  }

  playerHitsSpawn(player, spawn) {
    const p = this.players.getPlayerByName(player.name);
    const s = this.spawners.getSpawnerByName(spawn.name);
    p.takeDamage(1);
    s.takeDamage(2);
  }

  playerGetsHealthPotion(player, potion) {
    const p = this.players.getPlayerByName(player.name);
    const h = this.healthPotions.getPotionByName(potion.name);
    p.heal(p.health);
    h.consumedBy(p);
  }
  
}