(function() {
  'use strict';
  var version = '##VERSION##';

  var GameState = {
    preload: function() {
      this.load.image('background', 'images/background.png');
      this.load.image('hand', 'images/hand.png');

      this.load.spritesheet('chicken', 'images/chicken.png', 202, 299, 3);
      this.load.spritesheet('cow', 'images/cow.png', 266, 300, 3);
      this.load.spritesheet('horse', 'images/horse.png', 252, 300, 3);
      this.load.spritesheet('pig', 'images/pig.png', 329, 300, 3);
      this.load.spritesheet('sheep', 'images/sheep.png', 288, 300, 3);

      this.load.audio('chickenCluck', ['sounds/chicken-cluck.ogg', 'sounds/chicken-cluck.mp3']);
      this.load.audio('cowMoo', ['sounds/cow-moo.ogg', 'sounds/cow-moo.mp3']);
      this.load.audio('horseTrot', ['sounds/horse-trot.ogg', 'sounds/horse-trot.mp3']);
      this.load.audio('pigOink', ['sounds/pig-oink.ogg', 'sounds/pig-oink.mp3']);
      this.load.audio('sheepBaa', ['sounds/sheep-baa.ogg', 'sounds/sheep-baa.mp3']);
    },
    create: function() {
      this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
      this.scale.pageAlignHorizontally = true;
      this.scale.pageAlignVertically = true;

      this.background = this.game.add.sprite(0, 0, 'background');

      var animals = [
        {key: 'chicken', text: 'CHICKEN', sound: 'chickenCluck'},
        {key: 'cow', text: 'COW', sound: 'cowMoo'},
        {key: 'horse', text: 'HORSE', sound: 'horseTrot'},
        {key: 'pig', text: 'PIG', sound: 'pigOink'},
        {key: 'sheep', text: 'SHEEP', sound: 'sheepBaa'}
      ];

      this.animalsGroup = this.game.add.group();

      animals.forEach(function(element) {
        var animal = this.animalsGroup.create(this.game.world.centerX - this.game.width, this.game.world.centerY - 20, element.key, 0);

        animal.params = {text: element.text, sound: this.game.add.audio(element.sound)};

        animal.anchor.setTo(0.5);

        animal.animations.add('interact', [0, 1, 0, 1, 0, 2, 0], 4, false).onComplete.add(function() {
          animal.play('blink');
        }, this);
        animal.animations.add('blink', [0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 1], 4, true);

        animal.inputEnabled = true;
        animal.input.pixelPerfectClick = true;
        animal.events.onInputDown.add(this.interact, this);
      }.bind(this));

      this.current = this.animalsGroup.cursor;
      this.current.position.x = this.game.world.centerX;
      this.current.play('blink');

      this.text = this.game.add.text(this.game.world.centerX, this.game.height * 0.94, '', {
        font: 'bold 30pt Gill Sans, Arial, sans-serif',
        fill: 'white',
        stroke: 'black',
        strokeThickness: 5,
        align: 'center'
      });
      this.text.anchor.setTo(0.5);
      this.text.setText(this.current.params.text);

      this.version = this.game.add.text(5, this.game.height, '', {
        font: 'bold 8pt monospace',
        fill: 'white',
        boundsAlignV: 'bottom'
      });
      this.version.anchor.setTo(0, 0.8);
      this.version.setText(version);
      this.version.alpha = 0.2;

      this.leftArrow = this.game.add.sprite(75 + 20, this.game.world.centerY, 'hand');
      this.leftArrow.anchor.setTo(0.5);
      this.leftArrow.scale.x = -1;
      this.leftArrow.params = { direction: -1 };

      this.leftArrow.inputEnabled = true;
      this.leftArrow.events.onInputDown.add(this.change, this);
      this.game.add.tween(this.leftArrow).to( { x: 75 }, 500, "Linear", true, 0, -1, true);

      this.rightArrow = this.game.add.sprite(565 - 20, this.game.world.centerY, 'hand');
      this.rightArrow.anchor.setTo(0.5);
      this.rightArrow.params = { direction: 1 };

      this.rightArrow.inputEnabled = true;
      this.rightArrow.events.onInputDown.add(this.change, this);
      this.game.add.tween(this.rightArrow).to( { x: 565 }, 500, "Linear", true, 0, -1, true);
    },
    change: function(sprite) {
      if(this.isChanging) {
        return false;
      }

      this.isChanging = true;
      this.text.visible = false;
      this.leftArrow.visible = false;
      this.rightArrow.visible = false;

      var nextAnimal, currentAnimalDestX;
      if(sprite.params.direction > 0) {
        nextAnimal = this.animalsGroup.previous();
        nextAnimal.x = this.game.world.centerX - this.game.width;
        currentAnimalDestX = this.game.world.centerX + this.game.width;
      } else {
        nextAnimal = this.animalsGroup.next();
        nextAnimal.x = this.game.world.centerX + this.game.width;
        currentAnimalDestX = this.game.world.centerX - this.game.width;
      }

      // move out old
      var currentAnimalTween = this.game.add.tween(this.current);
      currentAnimalTween.to({x: currentAnimalDestX});
      currentAnimalTween.start();

      // move in new
      var nextAnimalTween = this.game.add.tween(nextAnimal);
      nextAnimalTween.to({x: this.game.world.centerX});
      nextAnimalTween.onComplete.add(function() {
        this.text.setText(this.current.params.text);
        this.text.visible = true;

        this.leftArrow.visible = true;
        this.rightArrow.visible = true;

        this.current.play('blink');

        this.isChanging = false;
      }, this);
      nextAnimalTween.start();

      this.current = nextAnimal;
    },
    interact: function(sprite) {
      if(this.isChanging) {
        return false;
      }
      sprite.play('interact');
      sprite.params.sound.play();
    }
  };

  var game = new Phaser.Game(640, 360, Phaser.AUTO);

  game.state.add('GameState', GameState);
  game.state.start('GameState');
})();
