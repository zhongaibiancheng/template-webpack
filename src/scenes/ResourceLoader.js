import { Scene } from 'phaser';

export class ResourceLoader extends Scene {
    constructor() {
        super('ResourceLoader');
    }

    preload() {
        this.load.image('left-cap', 'assets/images/health_bar/barHorizontal_green_left.png')
        this.load.image('middle', 'assets/images/health_bar/barHorizontal_green_mid.png')
        this.load.image('right-cap', 'assets/images/health_bar/barHorizontal_green_right.png')

        this.load.image('left-cap-shadow', 'assets/images/health_bar/barHorizontal_shadow_left.png')
        this.load.image('middle-shadow', 'assets/images/health_bar/barHorizontal_shadow_mid.png')
        this.load.image('right-cap-shadow', 'assets/images/health_bar/barHorizontal_shadow_right.png')
        this.load.image('background', 'assets/images/background.png');
        this.load.image("spike", "assets/images/spike.png");
        this.load.atlas('player', 'assets/images/kenney_player.png', 'assets/images/kenney_player_atlas.json');
        this.load.image('tiles', 'assets/tilesets/platformPack_tilesheet.png');
        // Load the export Tiled JSON
        this.load.tilemapTiledJSON('map', 'assets/tilemaps/levels/level1/level1.json');

        this.load.image('red_ball', 'assets/images/bomb.png');

        this.load.audio('walk1', 'assets/audio/SoundEffects/steps1.mp3');
        this.load.audio('walk2', 'assets/audio/SoundEffects/steps2.mp3');
        this.load.audio('star', 'assets/audio/SoundEffects/pickup.wav');

    }


    create() {
        this.scene.start("Boot");
    }

}