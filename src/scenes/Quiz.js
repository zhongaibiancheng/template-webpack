import { Scene } from 'phaser';

export class Quiz extends Scene {
    constructor() {
        super('Quiz');
    }

    preload() {
        this.load.image('tiles', 'assets/tilesets/platformPack_tilesheet.png');
        this.load.tilemapTiledJSON('map_level1_quiz1', 'assets/tilemaps/levels/level1/level1_quiz1.json');
    }

    init() {
        this.fullWidth = 300;
    }

    create() {
        console.log("quiz class loading ************");
        this.walk1 = this.sound.add("walk1");
        this.walk2 = this.sound.add("walk2");
        this.star = this.sound.add("star");

        this.sound.pauseOnBlur = true;

        const backgroundImage = this.add.image(0, 0, 'background').setOrigin(0, 0);
        backgroundImage.setScale(2, 0.8);

        const coinText = this.add.text(10, 24, '金币:0', { fontFamily: 'Arial', fontSize: 14, color: '#00ff00' }).setOrigin(0, 0.5);

        const map = this.make.tilemap({ key: 'map_level1_quiz1' });
        const tileset = map.addTilesetImage('kenney_simple_platformer', 'tiles');
        // 创建静态图层
        const platforms = map.createLayer('Platforms', tileset, 0, 0);
        // 设置碰撞属性
        platforms.setCollisionByProperty({ collides: true });
        this.matter.world.convertTilemapLayer(platforms, { label: 'floor' });

        const coins = map.createLayer("Coins", tileset, 0, 0);
        coins.setCollisionByProperty({ collides: true });
        this.matter.world.convertTilemapLayer(coins, { label: 'coin' });

        // 为玩家角色添加传感器来检测是否在地面上
        const { Body, Bodies } = Phaser.Physics.Matter.Matter;

        this.player = this.matter.add.sprite(50, 0, 'player', null, {});
        this.player.setRectangle(64, 90);

        // this.player.setBounce(0.2);

        this.player.setFixedRotation();

        this.player.body.label = "player";

        this.player.isOnGround = true;

        // this.player.setFrictionAir(0.01);

        const objectsGroup = this.add.group();
        // 获取对象层
        // const objectsLayer = map.getObjectLayer('Spikes');
        // if (objectsLayer) {
        //     objectsLayer.objects.forEach(object => {
        //         const { x, y, width, height } = object;

        //         // 创建一个 Matter.js 物体
        //         const matterObject = this.matter.add.rectangle(x + width / 2, y - height / 2, width, height, { isStatic: true });
        //         matterObject.label = "spike";

        //         // 创建一个对应的游戏对象（sprite 或 image）并添加到 Group 中
        //         const gameObject = this.add.image(x + width / 2, y - height / 2, 'spike');
        //         objectsGroup.add(gameObject);
        //         gameObject.setData('matterBody', matterObject); // 将 Matter.js 物体关联到游戏对象
        //     });
        // } else {
        //     console.error('ObjectsLayer not found in tilemap');
        // }


        let coin_count = 0;
        // 监听碰撞事件
        this.matter.world.on('collisionstart', (event, bodyA, bodyB) => {
            const pairs = event.pairs;

            for (let i = 0; i < pairs.length; i++) {
                const pair = pairs[i];

                if (pair.bodyA.label === "player" || pair.bodyB.label === "player") {
                    const target = pair.bodyA.label === 'player' ? pair.bodyB.label : pair.bodyA.label;
                    const target_body = pair.bodyA.label === 'player' ? pair.bodyB : pair.bodyA;

                    if (target === 'floor') {
                        this.player.isOnGround = true;
                    } else {
                        this.player.isOnGround = false;
                        if (target === 'spike') {
                            // this.playerHit(this.player, target);
                            // this.scene.start("GameOver");

                        } else if (target === 'coin') {
                            const tileWrapper = target_body.gameObject;
                            const tile = tileWrapper.tile;

                            // Only destroy a tile once
                            if (tile.properties.isBeingDestroyed) {
                                continue;
                            }
                            tile.properties.isBeingDestroyed = true;

                            this.star.play();
                            // Since we are using ES5 here, the local tile variable isn't scoped to this block -
                            // bind to the rescue.
                            this.tweens.add({
                                targets: tile,
                                alpha: { value: 0, duration: 100, ease: 'Power1' },
                                onComplete: this.destroyTile.bind(this, tile)
                            });
                            coin_count++;

                            coinText.setText("金币:" + coin_count);
                        }
                    }
                }
            }
        });

        this.matter.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels); // 设置边界宽度为1600，高度为600
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels); // 设置相机边界与物理世界边界一致
        this.cameras.main.startFollow(this.player, true);
        // this.cameras.main.setZoom(0.6);

        window.jump = () => {
            this.player.setVelocityY(-10);
            this.player.setVelocityX(10);
            this.player.play('jump', true);
        }

    }
    destroyTile(tile) {
        const layer = tile.tilemapLayer;
        layer.removeTileAt(tile.x, tile.y);
        tile.physics.matterBody.destroy();
    }

    update() {
        // if (this.leftKey.isDown) {
        //     this.player.setVelocityX(-5);
        //     if (this.player.isOnGround) {
        //         this.player.play('walk', true);
        //         this.walk1.play();
        //     }
        // } else if (this.rightKey.isDown) {
        //     this.player.setVelocityX(5);
        //     if (this.player.isOnGround) {
        //         this.player.play('walk', true);
        //         this.walk1.play();
        //     }
        // } else {
        //     this.player.setVelocityX(0);
        //     if (this.player.isOnGround) {
        //         this.player.play('idle', true);
        //     }
        // }
        // if ((this.jumpKey.isDown || this.upKey.isDown) && this.player.isOnGround) {
        //     this.player.setVelocityY(-20);
        //     this.player.play('jump', true);
        //     this.player.isOnGround = false;
        // }

        // if (this.player.body.velocity.x > 0) {
        //     this.player.setFlipX(false);
        // } else if (this.player.body.velocity.x < 0) {
        //     this.player.setFlipX(true);
        // }
    }
}