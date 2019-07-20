import { Physics, Scene, Types } from 'phaser';

enum FileKeys {
	Bomb = 'bomb',
	Ground = 'ground',
	Sky = 'sky',
	Star = 'star'
}

type ImageFileConfig = Types.Loader.FileTypes.ImageFileConfig;
type StaticGroup = Physics.Arcade.StaticGroup;

export class GameScene extends Scene {
	protected _platforms: StaticGroup;

	create(): void {
		this.add.image(0, 0, FileKeys.Sky).setOrigin(0, 0);

		const platforms = this.physics.add.staticGroup();
		platforms.create(400, 568, FileKeys.Ground).setScale(2).refreshBody();
		platforms.create(600, 400, FileKeys.Ground);
		platforms.create(50, 250, FileKeys.Ground);
		platforms.create(750, 220, FileKeys.Ground);

		this._platforms = platforms;
	}

	preload(): void {
		const imageConfigs: ImageFileConfig[] = [
			{ key: FileKeys.Bomb, url: 'images/bomb.png' },
			{ key: FileKeys.Ground, url: 'images/platform.png' },
			{ key: FileKeys.Sky, url: 'images/sky.png' },
			{ key: FileKeys.Star, url: 'images/star.png' }
		];

		this.load.image(imageConfigs);
		this.load.spritesheet('dude', 'images/dude.png', { frameWidth: 32, frameHeight: 48 });
	}
}
