import { GameObjects, Physics, Scene, Types } from 'phaser';

enum FileKeys {
	Bomb = 'bomb',
	Ground = 'ground',
	Player = 'player',
	Sky = 'sky',
	Star = 'star'
}

type CursorKeys = Types.Input.Keyboard.CursorKeys;
type ImageFileConfig = Types.Loader.FileTypes.ImageFileConfig;
type PhysicsSprite = Physics.Arcade.Sprite;
type Group = Physics.Arcade.Group;
type StaticGroup = Physics.Arcade.StaticGroup;
type Text = GameObjects.Text;

const playerSpeed = 160;

export class GameScene extends Scene {
	protected _cursorKeys: CursorKeys;
	protected _platforms: StaticGroup;
	protected _player: PhysicsSprite;
	protected _score = 0;
	protected _scoreText: Text;
	protected _stars: Group;

	create(): void {
		this.add.image(0, 0, FileKeys.Sky).setOrigin(0, 0);
		this.createPlatforms();
		this.createPlayer();
		this.createStars();
		this._scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });

		this.physics.add.collider(this._player, this._platforms);
		this.physics.add.collider(this._stars, this._platforms);
		this.physics.add.overlap(this._player, this._stars, this.collectStar, null, this);

		this._cursorKeys = this.input.keyboard.createCursorKeys();
	}

	preload(): void {
		const imageConfigs: ImageFileConfig[] = [
			{ key: FileKeys.Bomb, url: 'images/bomb.png' },
			{ key: FileKeys.Ground, url: 'images/platform.png' },
			{ key: FileKeys.Sky, url: 'images/sky.png' },
			{ key: FileKeys.Star, url: 'images/star.png' }
		];

		this.load.image(imageConfigs);
		this.load.spritesheet(FileKeys.Player, 'images/dude.png', { frameWidth: 32, frameHeight: 48 });
	}

	update(): void {
		this.updatePlayer();
	}

	protected collectStar(player: PhysicsSprite, star: PhysicsSprite): void {
		star.disableBody(true, true);
		this._scoreText.setText(`Score: ${++this._score}`);
	}

	protected createPlatforms(): void {
		const platforms = this.physics.add.staticGroup();
		platforms.create(400, 568, FileKeys.Ground).setScale(2).refreshBody();
		platforms.create(600, 400, FileKeys.Ground);
		platforms.create(50, 250, FileKeys.Ground);
		platforms.create(750, 220, FileKeys.Ground);

		this._platforms = platforms;
	}

	protected createPlayer(): void {
		const player = this.physics.add.sprite(100, 450, FileKeys.Player);
		player.setBounce(0.2);
		player.setCollideWorldBounds(true);
		this._player = player;

		this.anims.create({
			key: 'left',
			frames: this.anims.generateFrameNumbers(FileKeys.Player, { start: 0, end: 3 }),
			frameRate: 10,
			repeat: -1
		});

		this.anims.create({
			key: 'turn',
			frames: [ { key: FileKeys.Player, frame: 4 } ],
			frameRate: 20
		});

		this.anims.create({
			key: 'right',
			frames: this.anims.generateFrameNumbers(FileKeys.Player, { start: 5, end: 8 }),
			frameRate: 10,
			repeat: -1
		});
	}

	protected createStars(): void {
		this._stars = this.physics.add.group({
			key: FileKeys.Star,
			repeat: 11,
			setXY: { x: 12, y: 0, stepX: 70 }
		});

		this._stars.children.iterate((star: PhysicsSprite) => {
			star.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
		});
	}

	protected updatePlayer(): void {
		if (this._cursorKeys.left.isDown) {
			this._player.setVelocityX(-playerSpeed);
			this._player.anims.play('right', true);
		} else if (this._cursorKeys.right.isDown) {
			this._player.setVelocityX(playerSpeed);
			this._player.anims.play('left', true);
		} else {
			this._player.setVelocityX(0);
			this._player.anims.play('turn', true);
		}

		const playerTouching = this._player.body.touching;
		if (this._cursorKeys.up.isDown && (playerTouching.left || playerTouching.right || playerTouching.down)) {
			this._player.setVelocityY(-2 * playerSpeed);
		}
	}
}
