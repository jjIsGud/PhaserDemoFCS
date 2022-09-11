
export class Player extends Phaser.GameObjects.Rectangle {
  constructor(scene, group, config = {}) {
    super(scene, 90, 295, 20, 10, 0xffffff);
    this.scene = scene;
    this.group = group;
    this.config = config;

    this.scene.add.existing(this);
    this.group.add(this);

    // create the bullets group
    this.bulletsFired = 0;
    this.bulletsHit = 0;
    this.setData('bulletsHit', this.bulletsHit);

    // create the player object
    this.setState(Player.States.ALIVE);
    this.nextFire = 0;
    this.runSpeed = this.config.runSpeed || 4;
    this.maxHealth = this.maxHealth || 50;
    this.hp = this.maxHealth;
    this.setData('hp', this.hp);
    this.setData('maxHP', this.maxHealth);
    this.maxStamina = this.maxStamina || 50;
    this.staminaRegenS = this.config.staminaRegenS || 10;    // stamina refresh per second
    this.boostCostS = this.config.boostCostS || 25;         // boost cost per second
    this.stamina = this.maxStamina;
    this.healthBar = this.scene.add.rectangle(300, 10, 100, 10, 0xff0000);
    this.staminaBar = this.scene.add.rectangle(300, 25, 100, 10, 0x00ff00);

    this.accuracyDisplay = this.scene.add.text(300, 35, 'Fired:  0  Hits:  0  Accuracy%: 00.00%');
    // get out if there is no controller connected
    if (this.scene.input.gamepad.total === 0) return;

    // get the active gamepad (do we need to do this every time?)
    this.pad = this.scene.input.gamepad.getPad(0);
  }

  preUpdate(ts, delta) {
    this.nextFire -= delta;

    // place hp on data so external calls can have access
    this.hp = this.getData('hp');
    this.hp = Math.max(this.hp, 0);
    if (this.hp <= 0) {
      this.setFillStyle(0x444444);
      this.scene.add.text(350, 280, 'YOU LOSE!');
      this.scene.active = false;
      this.scene.physics.pause();
      this.setState(Player.States.DEAD);
    };

    if (this.state === Player.States.DEAD) return;

    // increase speed if left trigger is pressed
    if (this.pad.L2 > 0 && this.stamina > 0) {
      this.runSpeed = 8;
      // use stamina to boost
      this.stamina -= delta / 1000 * this.boostCostS;
    } else {
      this.runSpeed = 4;
      // stamina regen
      this.stamina += delta / 1000 * this.staminaRegenS;
      if (this.stamina > this.maxStamina) this.stamina = this.maxStamina;
    }

    // move the player based on left stick
    this.setPosition(
      this.x + this.runSpeed * this.pad.leftStick.x,
      this.y + this.runSpeed * this.pad.leftStick.y
    )

    // check to see if the right stick is engaged
    if (this.pad.rightStick.x || this.pad.rightStick.y) {
      // set the angle
      this.angle = Math.atan2(this.pad.rightStick.y, this.pad.rightStick.x) * (180 / Math.PI);
      this.setAngle(this.angle);
    }
    
    // attempt to fire weapon
    if (this.nextFire <= 0) {
      let color;
      if (this.pad.R1 > 0) color = 0x0000dd;
      if (this.pad.R2 > 0) color = 0x00dd00;
      if (this.pad.L1 > 0) color = 0xdd0000;
      if (color) {
        this.scene.bullets.createBullet(this, color, 5);
        this.nextFire = 250;
      }
    }
    
    this.healthBar.width = this.hp / this.maxHealth * 100;
    this.staminaBar.width = this.stamina / this.maxStamina * 100;

    this.bulletsHit = this.getData('bulletsHit');
    this.accuracyDisplay.setText(`Bullets: ${this.bulletsFired}  Hits: ${this.bulletsHit}  Accuracy: ${Math.round(this.bulletsFired / this.bulletsHit * 10000, 2) / 100}%`)
  }

  static States = {
    ALIVE: 1,
    DEAD: 2
  }
}