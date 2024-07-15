import { Scene } from 'phaser';

export class Boot extends Scene {
    constructor() {
        super('Boot');
    }

    preload() {
        //  The Boot Scene is typically used to load in any assets you require for your Preloader, such as a game logo or background.
        //  The smaller the file size of the assets, the better, as the Boot Scene itself has no preloader.

        this.load.image('background', 'assets/images/background.png');
        this.load.image("spike", "assets/images/spike.png");
        this.load.atlas('player', 'assets/images/kenney_player.png', 'assets/images/kenney_player_atlas.json');
        this.load.image('tiles', 'assets/tilesets/platformPack_tilesheet.png');
        // Load the export Tiled JSON
        this.load.tilemapTiledJSON('map', 'assets/tilemaps/level1.json');

    }

    create() {
        const backgroundImage = this.add.image(0, 0,'background').setOrigin(0, 0);
        backgroundImage.setScale(2, 0.8);
        const map = this.make.tilemap({ key: 'map' });
        const tileset = map.addTilesetImage('kenney_simple_platformer', 'tiles');
        // 创建静态图层
        const platforms = map.createLayer('Platforms', tileset, 0, 0);

        // 设置碰撞属性
        platforms.setCollisionByProperty({ collides: true });

        this.matter.world.convertTilemapLayer(platforms);
        this.matter.world.setBounds();
console.log(this)
        this.player = this.matter.add.sprite(50, 0, 'player');
        this.player.setBounce(0.1);

        // this.matter.add.collider(this.player, platforms);

        // this.scene.start('Preloader');
    }
}