import Phaser from "phaser";

export default class AirplaneScene extends Phaser.Scene {
  constructor() {
    super({ key: "AirplaneScene" });
    this.health = 10; // Set initial health to 5
    this.birds = []; // Array to hold bird references
    this.amp = 2;
    this.score = 0;
    this.highscore = localStorage.getItem("airplane");
    this.gamePaused = false;
    this.pause = false;
  }
  count() {
    this.point++;
    console.log(this.point);
  }

  handleCollisionWithBird(bird) {
    bird.destroy(); // Destroy the bird on collision
    this.health -= 1; // Decrease health
    console.log(`Health: ${this.health}`);
    this.healthText.setText(`Health: ${this.health}`); // Update health display
    this.airplane.setVelocityX(0);
    if (this.health > 5) this.amp++;
    else if (this.health <= 5 && this.health > 3) this.amp *= 3;
    else this.amp *= 5;
    // Check if health is 0 or less
    if (this.health <= 0) {
      this.gameOver();
    }
  }

  startGame() {
    this.gamePaused = false;
  }

  pauseGame() {
    this.pause = true;
  }

  gameOver() {
    console.log("Game Over!");
    // Stop the physics and end the game
    this.physics.pause();
    this.gamePaused = true; // Set game to paused
    if (this.highscore < this.score)
      localStorage.setItem("airplane", this.score);
    this.add
      .text(400, 300, "Game Over", { fontSize: "60px", color: "#ff0000" })
      .setOrigin(0.5);

    // Create a "Restart" button
    const restartButton = this.add
      .text(400, 400, "Restart", {
        fontSize: "40px",
        color: "#ffffff",
        backgroundColor: "#000000",
      })
      .setOrigin(0.5)
      .setInteractive(); // Make the text interactive

    restartButton.on("pointerdown", () => {
      this.scene.restart(); // Restart the scene
      this.health = 10;
      this.amp = 2;
      this.gamePaused = false; // Reset the paused state
      this.score = 0; // Reset score
      this.highscore = localStorage.getItem("airplane");
    });
  }

  preload() {
    // Load airplane, bird, and other assets here
    this.load.image("airplane", "/assets/airplane.png");
    this.load.image("sky", "/assets/sky.jpg");
    this.load.image("ground", "/assets/ground.jpeg");
    this.load.image("bird", "/assets/bird.png");
    this.load.image("play_btn", "/assets/play_btn.png");
  }

  create() {
    // Set up sky background
    this.sky = this.physics.add.sprite(150, 200, "sky");
    this.sky.setScale(1.8);

    // Set up ground as a static body (immovable)
    this.ground = this.add.tileSprite(400, 750, 1200, 600, "ground");
    this.ground.setScale(1.15);

    // Pause the game initially
    this.physics.pause();
    this.gamePaused = true;

    // Add play button
    const playButton = this.add
      .image(400, 300, "play_btn")
      .setInteractive()
      .setScale(0.4);

    playButton.on("pointerdown", () => {
      // Start the game when the play button is clicked
      playButton.destroy(); // Remove the play button
      this.physics.resume(); // Resume the game physics
      this.startGame(); // Call the start game method to initialize everything
    });

    // Display airplane only after the game starts
    this.airplane = this.physics.add.sprite(100, 100, "airplane");
    this.airplane.setFlipX(true);
    this.airplane.setCollideWorldBounds(true);
    this.airplane
      .setSize(this.airplane.width / 5, this.airplane.height / 5)
      .setOffset(this.airplane.width / 15, this.airplane.height / 4);

    // Add collision detection between airplane and ground
    this.physics.add.collider(
      this.airplane,
      this.ground,
      this.handleCollision,
      null,
      this
    );

    // Create birds and add to the birds group
    this.createBirds();

    this.birds.forEach((bird) => {
      this.physics.add.collider(
        this.airplane,
        bird,
        (airplane, bird) => {
          this.handleCollisionWithBird(bird);
        },
        null,
        this
      );
    });

    // Score, health, and birds will only be initialized when the game starts
    this.scoreText = this.add.text(16, 12, `Score: ${this.score}`, {
      fontSize: "28px",
      fill: "#fdd023",
      fontStyle: "bold",
    });

    if (this.pause) {
      this.pausetext = this.add.text(170, 12, "||", {
        fontSize: "28px",
        fill: "#ffffff",
        fontStyle: "bold",
      });
    }

    this.healthText = this.add.text(650, 16, `Health: ${this.health}`, {
      fontSize: "20px",
      fill: "#ff0000",
      fontStyle: "bold",
    });

    this.hightScoreText = this.add.text(
      300,
      16,
      `High Score: ${this.highscore || 0}`,
      {
        fontSize: "20px",
        fill: "#276221",
        fontStyle: "bold",
      }
    );

    this.time.addEvent({
      delay: 1000, // 1000 ms = 1 second
      callback: () => {
        if (!this.gamePaused) {
          this.score += 1; // Increase score by 1
          this.scoreText.setText(`Score: ${this.score}`); // Update score display
        }
      },
      loop: true,
    });

    this.cursors = this.input.keyboard.createCursorKeys(); // Airplane controls
  }

  createBirds() {
    for (let i = 0; i < this.health * this.amp; i++) {
      // Create 5 birds
      const bird = this.physics.add.sprite(
        Phaser.Math.Between(850, 3000),
        Phaser.Math.Between(50, 400),
        "bird"
      ); // Initial X position off the right edge
      bird.setVelocityX(Phaser.Math.Between(-100, -250)); // Move left
      bird.setScale(0.15); // Adjust size
      bird.setFlipX(true);
      bird.checkWorldBounds = true;
      bird.outOfBoundsKill = false; // Allow birds to go off-screen without killing them
      this.birds.push(bird); // Store reference to the bird
    }
  }

  update() {
    setInterval(() => this.point++, 1000);
    if (!this.gamePaused) {
      this.ground.tilePositionX += 0.8;
    }

    // Reset positions of birds that go off-screen
    this.birds.forEach((bird, index) => {
      if (bird.x < -50) {
        bird.x = Phaser.Math.Between(850, 3000); // Reset to the right edge
        bird.y = Phaser.Math.Between(0, 400); // Assign a new random Y position
      }
    });

    // Airplane movement controls
    if (this.cursors.up.isDown) {
      this.airplane.setVelocityY(-200);
    } else if (this.cursors.down.isDown && this.airplane.y < 350) {
      this.airplane.setVelocityY(200);
    } else {
      this.airplane.setVelocityY(0);
    }

    // Handle airplane movement on the X-axis
    if (this.cursors.left.isDown) {
      this.airplane.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.airplane.setVelocityX(200);
    } else {
      this.airplane.setVelocityX(0);
    }

    // Ensure the airplane doesn't go below y = 600
    if (this.airplane.y >= 400) {
      this.airplane.y = 400;
    }

    if (Phaser.Input.Keyboard.JustDown(this.cursors.space)) {
      if (!this.gamePaused) {
        this.physics.pause(); // Pause the game physics
        this.gamePaused = true;
        this.pausetext = this.add.text(180, 12, "||", {
          fontSize: "28px",
          fill: "#ffffff",
          fontStyle: "bold",
        });
      } else {
        this.physics.resume(); // Resume the game physics
        this.gamePaused = false;
        this.pausetext.setVisible(false);
      }
    }
  }
}
