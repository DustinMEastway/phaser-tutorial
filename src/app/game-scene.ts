import { GameObjects, Input, Physics, Scene, Types } from 'phaser';
import { gameConfig } from './game-config';

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
const KeyCodes = Input.Keyboard.KeyCodes;

const playerSpeed = 160;

export class GameScene extends Scene {
	protected _bombs: Group;
	protected _cursorKeys: CursorKeys;
	protected _gameOver: boolean;
	protected _player: PhysicsSprite;
	protected _score: number;
	protected _scoreText: Text;
	protected _stars: Group;

	protected get score(): number {
		return this._score;
	}
	protected set score(score: number) {
		this._score = score;
		this._scoreText.setText(`Score: ${this._score}`);
	}

	create(): void {
		this.add.image(0, 0, FileKeys.Sky).setOrigin(0, 0);

		const platforms = this.createPlatforms();
		this._player = this.createPlayer(platforms);
		this._bombs = this.createBombs(platforms, this._player);
		this._stars = this.createStars(platforms, this._player);
		this._scoreText = this.add.text(16, 16, '', { fontSize: '32px', fill: '#000' });
		this.startGameOver();

		this._cursorKeys = this.input.keyboard.createCursorKeys();
		this.input.keyboard.addListener('keydown', (event: KeyboardEvent) => {
			if (event.keyCode === KeyCodes.ESC) {
				this.startGameOver();
			}
		});
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

	protected startGameOver(): void {
		this.score = 0;
		this._gameOver = false;
		this._player.setPosition(100, 450);
		this._player.setTint();
		this._bombs.clear(true, true);
		this.resetStars();
		this.physics.resume();
	}

	protected collectStar(player: PhysicsSprite, collectedStar: PhysicsSprite): void {
		collectedStar.disableBody(true, true);
		this._scoreText.setText(`Score: ${++this._score}`);

		if (this._stars.countActive(true) === 0) {
			this.resetStars();
			this.dropBomb(player);
		}
	}

	protected createBombs(platforms: StaticGroup, player: PhysicsSprite): Group {
		const bombs = this.physics.add.group();
		this.physics.add.collider(bombs, platforms);
		this.physics.add.collider(player, bombs, this.hitBomb, null, this);

		return bombs;
	}

	protected createPlatforms(): StaticGroup {
		const platforms = this.physics.add.staticGroup();
		platforms.create(400, 568, FileKeys.Ground).setScale(2).refreshBody();
		platforms.create(600, 400, FileKeys.Ground);
		platforms.create(50, 250, FileKeys.Ground);
		platforms.create(750, 220, FileKeys.Ground);

		return platforms;
	}

	protected createPlayer(platforms: StaticGroup): PhysicsSprite {
		const player = this.physics.add.sprite(0, 0, FileKeys.Player);
		player.setBounce(0.2);
		player.setCollideWorldBounds(true);
		this.physics.add.collider(player, platforms);

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

		return player;
	}

	protected createStars(platforms: StaticGroup, player: PhysicsSprite): Group {
		const stars = this.physics.add.group({
			key: FileKeys.Star,
			repeat: 11,
			setXY: { x: 12, y: 0, stepX: 70 }
		});

		this.physics.add.collider(stars, platforms);
		this.physics.add.overlap(player, stars, this.collectStar, null, this);

		stars.children.iterate((star: PhysicsSprite) => {
			star.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
		});

		return stars;
	}

	protected dropBomb(player: PhysicsSprite): void {
		const width = parseInt(<string>gameConfig.width, 10);
		const quarterWidth = width / 4;
		const bombX = Phaser.Math.Between(player.x + quarterWidth, player.x + 3 * quarterWidth) % width;

		const bomb = this._bombs.create(bombX, 16, FileKeys.Bomb);
		bomb.setBounce(1);
		bomb.setCollideWorldBounds(true);
		bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
	}

	protected hitBomb(player: PhysicsSprite, bomb: PhysicsSprite): void {
		this.physics.pause();
		player.setTint(0xff0000);
		player.anims.play('turn');
		this._gameOver = true;
	}

	protected resetStars(): void {
		this._stars.children.iterate((star: PhysicsSprite) => {
			star.enableBody(true, star.x, 0, true, true);
		});
	}

	protected updatePlayer(): void {
		if (this._gameOver) {
			return;
		}

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
