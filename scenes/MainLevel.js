import { Player } from '../objects/Player.js';
import { Spawner } from '../objects/Spawners.js';
import { Bullet, BulletGroup } from '../objects/Bullets.js';
import { EnemyGroup } from '../objects/Enemies.js';
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
    this.player = new Player(this, this.players);

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

    // player (in case we want multiple)
    this.players = this.physics.add.group({
      key: 'players',
      collideWorldBounds: true,
      runChildUpdate: true,
      immovable: true
    });
    this.players.clear(true, true);
    
    // create spawner groups
    this.spawners = this.physics.add.group({
      key: 'spawners',
      collideWorldBounds: true,
      runChildUpdate: true,
      immovable: true
    });
    this.spawners.clear(true, true);

    // enemies
    this.enemies = new EnemyGroup(this);

    // bullets
    this.bullets = new BulletGroup(this);
  }

  createColliders() {
    // bullet hits enemy
    this.physics.add.collider(
      this.bullets,
      this.enemies,
      this.bullets.bulletHitsEnemy,
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
    new Spawner(this, this.spawners, this.enemies, 775, 25, this.player, { hp: 100 });
    new Spawner(this, this.spawners, this.enemies, 775, 575, this.player, { hp: 500 });
    new Spawner(this, this.spawners, this.enemies, 25, 25, this.player, { hp: 1000 });
    new Spawner(this, this.spawners, this.enemies, 25, 575, this.player);
  } 

  bulletHitsEnemy(bullet, enemy) {
    if(bullet.state === Bullet.States.FINISHED) return;
    const bulletDamage = bullet.getData('damage');
    const enemyHP = enemy.getData('hp');
    if(enemyHP > 0) {
      bullet.setState(Bullet.States.FINISHED);
      enemy.setData('hp', enemyHP - bulletDamage);
      if (enemyHP - bulletDamage <= 0) {
        this.score += enemy.getData('maxHP');
        if(Math.random() < 0.25) {
          this.healthPotions.createPotion(enemy.x, enemy.y, 25);
        }
        enemy.setState(Enemy.States.DEAD);
      } else {
        enemy.setState(Enemy.States.TAKING_HIT);
      }
    }
  }

  enemyHitsPlayer(enemy, player) {
    const t = this.player;   // todo: get player from group
    this.enemies.enemyHitsTarget(enemy, t);
  }

  bulletHitsSpawn(bullet, spawner) {
    // if (bullet.state === Bullet.States.FINISHED) return;
    const spawnHP = spawner.getData('hp');
    const bulletDamage = 5;
    //bullet.setState(Bullet.States.FINISHED);
    spawner.setData('hp', spawnHP - bulletDamage);
    if (spawnHP - bulletDamage <= 0) {
      this.score += spawner.getData('maxHP');
      this.healthPotions.createPotion(spawner.x, spawner.y, 100);
    }

    this.bullets.remove(bullet);
    bullet.destroy();
  }

  playerHitsSpawn(player, spawn) {
    const playerHP = player.getData('hp');
    const spawnHP = spawn.getData('hp');
    player.setData('hp', playerHP - 1);
    spawn.setData('hp', spawnHP - 2);
  }

  // playerGetsHealthPotion(player, potion) {
  //   this.healthPotions
  //   let playerHP = player.getData('hp');
  //   const playerMaxHP = player.getData('maxHP');
  //   if(playerHP >= playerMaxHP) return;
    
  //   const potionHP = potion.getData('hp');    
  //   player.setData('hp', Math.min(playerHP + potionHP, playerMaxHP));
  //   potion.healthDisplay.destroy();
  //   potion.destroy();
  //   potion.group.remove(potion);
  // }
  
}