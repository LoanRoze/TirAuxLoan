//Variables de selection du HTML
const allPage = document.querySelector("body")
  //Selections de la partie "infos"
const infos = document.querySelector("#infos");
const compteurTitle = document.querySelector("#compteurTitle");
const compteurSpace = document.querySelector("#Compteur");
const timeSpace = document.querySelector("#TimeCompteur");
  //Selections de la partie game-screen quand le jeu se termine
const game = document.querySelector("#game-space");
const endSpace = document.querySelector("#Final-Screen");
const endScoreSpace = document.querySelector("#endscore");
const endScoreCompteur = document.querySelector("#Final-Score");
  //Selections de la partie game-screen avant que le jeu se lance
const titleGM = document.querySelector("#title");
const explanationSpace = document.querySelector("#ExplanationSpace");
const clignotingText = document.querySelector("#ClignotingText");
  //Selections des boutons du game-screen
const nextLevel = document.querySelector("#NextLevel");
const restartLevel = document.querySelector("#RestartLevel");
const restartAll = document.querySelector("#RestartAll");
const basicGM = document.querySelector("#BasicGM");
const timerGM = document.querySelector("#TimerGM");
const endlessGM = document.querySelector("#EndlessGM");
  //Autres selections
const warning = document.querySelector("#warnings");
const progressBar = document.querySelector("#progressBar");
  //Selections de la manette
const starting = document.querySelector("#buttonA");
const mute = document.querySelector("#volume");
const menu = document.querySelector("#buttonB");
const incrDif = document.querySelector("#croixTop");
const decrDif = document.querySelector("#croixDown");
const leftTheme = document.querySelector("#croixLeft");
const rightTheme = document.querySelector("#croixRight");
const leftFond = document.querySelector("#gachetteGauche");
const rightFond = document.querySelector("#gachetteDroite")
const led = document.querySelector("#LED");

//Initialisation
let score = 0; //Une variable qui compte le score
let time = 0; //Initialisation du temps à 0
let timesec = 0; //Une variable qui compte le temps en seconde
let timemin = 0; //Une variable qui compte le temps en min
let gameON = false; //On initialise le jeu a false
let LevelVar = 1; //On stock le niveau auquel on est
let gameMode = ""; //On definit que le mode de jeu n'est pas encore choisit
let muted = false; //On definit que le jeu n'est pas mute des le debut
let difficulties = ["easy", "medium", "hard"];  //les noms des difficultés
let diffCursor = 1; //Un curseur qui definit la difficulté de base
let difficulty = difficulties[diffCursor]; //On definit la difficulté actuelle
let levels;

//Variable a declarer pour la barre de progression
let currentBar = 0;
let intervalId;

//Variables d'audio
let laser = new Audio("assets/Piou.mp3");
let meteorexplosion = new Audio("assets/PiouMeteor.mp3");
let bombexplosion = new Audio("assets/Boom.mp3");
let youlose = new Audio("assets/LoseSound.mp3");
let youwin = new Audio("assets/WinSound.mp3");
let buttonpress = new Audio("assets/ButtonPress.mp3");
let warnSound = new Audio("assets/WarnSound.mp3");
warnSound.volume = 0.3;

// Couleurs de fond d'ecran
let colors = ["#404c87","#fcba03","#fcfc03","#03fc84","#03c6fc","#7f03fc","#c603fc","#fc0324"]
let colorCursor = 0
// Fonds d'ecrans
let fonds = ['url(assets/fond1.png)','url(assets/fond2.jpg)','url(assets/fond3.jpg)','url(assets/fond4.jpeg)','url(assets/fond5.jpg)','url(assets/fond6.jpg)']
let fondCursor = 0

//La class qui contient les propriétés de chaques niveaux
class Level {
  constructor(
    level,
    goal,
    meteorSpeed,
    spawnBombSpeed,
    spawnMeteorSpeed,
    limitedTime
  ) {
    this.level = level;
    this.goal = goal;
    this.meteorSpeed = meteorSpeed;
    this.spawnBombSpeed = spawnBombSpeed;
    this.spawnMeteorSpeed = spawnMeteorSpeed;
    this.limitedTime = limitedTime;
  }
}


//Les 5 niveaux dans les 3 difficultées
let LevelOneEasy = new Level(1, 30, 1, 9000, 900, 90);
let LevelTwoEasy = new Level(2, 50, 1, 8600, 800, 90);
let LevelThreeEasy = new Level(3, 55, 2, 8400, 700, 90);
let LevelFourEasy = new Level(4, 55, 2, 8200, 600, 90);
let LevelFiveEasy = new Level(5, 60, 3, 8000, 600, 90);

let LevelOne = new Level(1, 30, 2, 8000, 900, 45);
let LevelTwo = new Level(2, 50, 3, 7000, 600, 45);
let LevelThree = new Level(3, 55, 4, 6500, 500, 45);
let LevelFour = new Level(4, 55, 5, 6250, 500, 45);
let LevelFive = new Level(5, 60, 6, 6000, 500, 45);

let LevelOneHard = new Level(1, 30, 4, 7000, 600, 20);
let LevelTwoHard = new Level(2, 50, 5, 6500, 500, 30);
let LevelThreeHard = new Level(3, 55, 6, 6000, 500, 30);
let LevelFourHard = new Level(4, 55, 7, 6000, 500, 30);
let LevelFiveHard = new Level(5, 60, 8, 6000, 500, 35);

//La class météorite
class Meteor {
  constructor(
    topPos,
    rightPos,
    startingPos,
    img = "assets/Meteorite.png",
    exist = true
  ) {
    this.topPos = topPos;
    this.rightPos = rightPos;
    this.startingPos = startingPos;
    this.meteorHTML;
    this.img = img;
    this.exist = exist;
  }

  //fonction qui permet de les créer en HTML
  CreateMeteor() {
    this.meteorHTML = document.createElement("img");
    this.meteorHTML.src = this.img;
    this.meteorHTML.draggable = false;
    this.meteorHTML.className = "meteor";
    this.meteorHTML.alt = "metorite";
    this.meteorHTML.style.height = "62px";
    this.meteorHTML.style.width = "100px";
    this.meteorHTML.style.position = "absolute";
  }

  //Fonctions qui permet de deplacer une meteorite a gauche ou en bas (ou a droit ou en haut en mettant des valeurs negative)
  moveLeft(pxAmount) {
    this.rightPos += pxAmount;
    this.updatePos();
  }
  moveDown(pxAmount) {
    this.topPos += pxAmount;
    this.updatePos();
  }

  //Fonctions qui permettent de repeter les fonctions au dessus avec une
  //action toutes les freshrates ms (30ms de base) pendant time ms (si = à 0, continue jusqu'a que la météorite disparaisse)
  moveLeftRepeat(pxAmount, time = 0, freshrate = 30) {
    let intervalId = setInterval(() => {
      if (this.exist === false) {
        //test de si la meteorite existe pour stopper l'action
        clearInterval(intervalId);
      }

      this.moveLeft(pxAmount); //déplacement de la meteorite
    }, freshrate);

    if (time > 0) {
      setTimeout(() => clearInterval(intervalId), time); //stoppe l'action au bout de time ms
    }
  }
  moveDownRepeat(pxAmount, time = 0, freshrate = 30) {
    let intervalId = setInterval(() => {
      if (this.exist === false) {
        clearInterval(intervalId);
      }

      this.moveDown(pxAmount);
    }, freshrate);
    if (time > 0) {
      setTimeout(() => clearInterval(intervalId), time);
    }
  }

  //met a jour la position de la meteorite sur l'écran
  updatePos() {
    this.meteorHTML.style.right = this.rightPos + "px";
    this.meteorHTML.style.top = this.topPos + "px";
    console.log(this.meteorHTML.style.right, this.meteorHTML.style.top);
  }

  //Fonction qui lance un deplacement qui s'arrete quand la météorite disparait, le déplacement change selon le niveaux et selon le côté
  //de départ de la météorite (la météorite tourne selon le bord depuis lequel elle arrive)
  MeteorMovement(CurrentLevel) {
    let pxAmount = CurrentLevel.meteorSpeed; //La distance que parcourera la météorite toutes les 30ms en px

    //Cas de niveau 1
    if (CurrentLevel.level === 1) {
      //deplacement horizontal
      this.moveLeftRepeat(pxAmount);
    }

    //Cas de niveau 2
    if (CurrentLevel.level === 2) {
      //deplacement diagonal
      this.moveDownRepeat(pxAmount * 0.5);
      this.moveLeftRepeat(pxAmount);
    }

    //Cas de niveaux 3, 4 et 5
    if (
      CurrentLevel.level === 3 ||
      CurrentLevel.level === 4 ||
      CurrentLevel.level === 5
    ) {
      let deplacement;
      if (CurrentLevel.level === 3) deplacement = "diagonal";
      if (CurrentLevel.level === 4) deplacement = "escalier";
      if (CurrentLevel.level === 5)
        deplacement = ["diagonal", "escalier"][Math.floor(Math.random() * 2)];
      //deplacement en escalier
      if (deplacement === "escalier") {
        let trigger = true;

        this.moveLeftRepeat(pxAmount * this.startingPos[0], 500); //On fait bouger la meteorite avant l'intervalle pour qu'elle ne reste pas immobile

        let intervalId = setInterval(() => {
          if (this.exist === false) clearInterval(intervalId);

          if (trigger === true)
            this.moveDownRepeat(pxAmount * this.startingPos[1], 500);
          //Si le trigger est true, on deplace sur l'axe Y pendant 500ms
          else this.moveLeftRepeat(pxAmount * this.startingPos[0], 500); //sinon sur l'axe X
          trigger = !trigger; //on change le trigger pour effectuer l'autre action
        }, 500);
      } else {
        this.moveDownRepeat(pxAmount * 0.5 * this.startingPos[1]);
        this.moveLeftRepeat(pxAmount * this.startingPos[0]);
      }
    }
  }

  //fonction qui supprime la météorite
  MeteorDelete() {
    this.meteorHTML.remove(); //suppression de la météorite du html
    this.exist = false; //On dit qu'elle n'existe plus car on ne peut pas vraiment la supprimer complétement
  }

  //Fonction qui check que la météorite n'est pas hors du cadre auquel cas il faut la supprimer
  meteorCheckIfDisapear() {
    let intervalId = setInterval(() => {
      if (
        this.rightPos >= 320 ||
        this.rightPos < 0 ||
        this.topPos >= 340 ||
        this.topPos < 0
      ) {
        this.MeteorDelete();
        clearInterval(intervalId);
      }
    }, 30);
  }
}

//La classe Bomb
class Bomb {
  constructor(topPos, rightPos, img = "assets/ryanbigbomb.png", exist = true) {
    this.topPos = topPos;
    this.rightPos = rightPos;
    this.firstPos = [rightPos, topPos];
    this.img = img;
    this.exist = exist;
  }

  //On créait la bombe en html
  CreateBomb() {
    this.bombHTML = document.createElement("img");
    this.bombHTML.src = this.img;
    this.bombHTML.className = "bomb";
    this.bombHTML.draggable = false;
    this.bombHTML.style.height = "190px";
    this.bombHTML.style.width = "200px";
    this.bombHTML.style.position = "absolute";
  }

  //Fonction qui met a jour la position de la bombe
  updatePos() {
    this.bombHTML.style.right = this.rightPos + "px";
    this.bombHTML.style.top = this.topPos + "px";
  }

  //Fonctions qui bougent les bombes comme pour les meteorites
  moveLeft(pxAmount) {
    this.rightPos += pxAmount;
    this.updatePos();
  }
  moveDown(pxAmount) {
    this.topPos += pxAmount;
    this.updatePos();
  }

  //Fonctions qui gere le mouvement des bombes, qui ne bougent pas au niv 1, qui ont un mouvement horizontal au 2
  //et aléatoirement horizontale, vertical ou diagonal au niv 3, 4 et 5
  BombMovement(CurrentLevel) {
    let deplacements = ["horizontal", "vertical", "diagonal"];
    let deplacement = "";
    //On donne le déplacement de la meteorite en fonction du niveau
    if (CurrentLevel.level === 1) return;
    if (CurrentLevel.level === 2) deplacement = deplacements[0];
    if (
      CurrentLevel.level === 3 ||
      CurrentLevel.level === 4 ||
      CurrentLevel.level === 5
    )
      deplacement = deplacements[Math.floor(Math.random() * 3)];
    //On bouge la bombe en fonction du déplacement
    if (deplacement === "horizontal") {
      let trigger = true;
      let intervalId = setInterval(() => {
        if (this.exist === false) {
          clearInterval(intervalId);
        }

        if (trigger === true) {
          if (this.rightPos > 200 || this.rightPos > this.firstPos[0] + 100) {
            trigger = !trigger;
          } else {
            this.moveLeft(1);
          }
        } else {
          if (this.rightPos < 0 || this.rightPos < this.firstPos[0] - 100) {
            trigger = !trigger;
          } else {
            this.moveLeft(-1);
          }
        }
      }, 30);
    }

    if (deplacement === "vertical") {
      let trigger = true;
      let intervalId = setInterval(() => {
        if (this.exist === false) {
          clearInterval(intervalId);
        }

        if (trigger === true) {
          if (this.topPos > 210 || this.topPos > this.firstPos[1] + 100) {
            trigger = !trigger;
          } else {
            this.moveDown(1);
          }
        } else {
          if (this.topPos < 0 || this.topPos < this.firstPos[1] - 100) {
            trigger = !trigger;
          } else {
            this.moveDown(-1);
          }
        }
      }, 30);
    }

    if (deplacement === "diagonal") {
      let trigger = true;
      let intervalId = setInterval(() => {
        if (this.exist === false) {
          clearInterval(intervalId);
        }

        if (trigger === true) {
          if (
            this.rightPos > 200 ||
            this.topPos > 210 ||
            this.rightPos > this.firstPos[0] + 100
          ) {
            trigger = !trigger;
          } else {
            this.moveLeft(1);
            this.moveDown(1);
          }
        } else {
          if (
            this.rightPos < 0 ||
            this.topPos < 0 ||
            this.rightPos < this.firstPos[0] - 100
          ) {
            trigger = !trigger;
          } else {
            this.moveLeft(-1);
            this.moveDown(-1);
          }
        }
      }, 30);
    }
  }

  //Fonction qui supprime une bombe
  BombDelete() {
    this.bombHTML.remove();
    this.exist = false;
  }
}

//Fonction qui enleve tout ce qu'il y a sur l'ecran
function clearGameDisplay() {
  endScoreSpace.style.display = "none";
  endSpace.style.display = "none";
  endScoreCompteur.style.display = "none";
  titleGM.style.display = "none";
  explanationSpace.style.display = "none";
  clignotingText.style.display = "none";
  nextLevel.style.display = "none";
  restartLevel.style.display = "none";
  restartAll.style.display = "none";
  basicGM.style.display = "none";
  timerGM.style.display = "none";
  endlessGM.style.display = "none";
}

//Fonction qui ajoute 1 au temps en sec, gere le cas des min pour améliorer l'affichage
//Met a jour le temps sur la page
function timer(maxTime = 0) {
  time += 1;
  timesec += 1;
  if (timesec >= 60) {
    timesec = 0;
    timemin += 1;
  }
  if (timesec < 10) {
    timeSpace.textContent = timemin + ":0" + timesec;
  } else {
    timeSpace.textContent = timemin + ":" + timesec;
  }
  if (timesec >= maxTime && maxTime != 0) {
    GameOVER();
  }
}

//Fonction qui enleve 1 au temps en sec.
function timerReverse() {
  time -= 1;
  timesec -= 1;
  if (timesec < 0) {
    timesec = 59;
    timemin -= 1;
  }
  if (timesec < 10) {
    timeSpace.textContent = timemin + ":0" + timesec;
  } else {
    timeSpace.textContent = timemin + ":" + timesec;
  }
  if (time === 0) {
    GameOVER();
  }
}

//Fonction qui met fin au jeu et enleve les meteorites/ bombes de l'ecran
function GameOFF() {
  gameON = false;
  led.src = "assets/LEDOFF.png"
  clearGameDisplay();
  document.querySelectorAll(".meteor").forEach((element) => element.remove());
  document.querySelectorAll(".bomb").forEach((element) => element.remove());
}

//Fonction de quand on perd, gere les modes de jeux
function GameOVER() {
  GameOFF();
  if (gameMode === "basic") {
    restartAll.style.display = "";
    endScoreSpace.textContent = "Your time |";
    endScoreCompteur.textContent = timeSpace.textContent;
  } else {
    endScoreSpace.textContent = "Your score |";
    endScoreCompteur.textContent = score;
  }

  endScoreCompteur.style.display = "";
  endScoreSpace.style.display = "";
  endSpace.style.display = "";
  restartLevel.style.display = "";
  youlose.play(); //gameover.play()
  endSpace.src = "assets/GameOverScreen.png";
}

//Fonction de quand on gagne, augmente 1 au niveau actuel a moins qu'on soit au niv 5. On ne peut gager que dans le mode de jeu basic
function YouWin() {
  youwin.play();
  GameOFF();
  endScoreSpace.style.display = "";
  endScoreCompteur.style.display = "";
  endSpace.style.display = "";
  restartLevel.style.display = "";
  restartAll.style.display = "";
  endSpace.src = "assets/YouWinScreen.png";
  endScoreSpace.textContent = "Your time |";
  endScoreCompteur.textContent = timeSpace.textContent;
  if (LevelVar < 5) {
    nextLevel.style.display = "";
  }
}

//Fonction qui permet de faire clignoter un objet html
function blink(Object) {
  if (Object.style.visibility === "visible") Object.style.visibility = "hidden";
  else Object.style.visibility = "visible";
}

//Fonction qui affiche un avertissement de Bombe
function warnprint() {
  if (gameON === false) {
    clearInterval(warnInter);
    return;
  }
  warning.style.opacity = 1
  warning.textContent = "WARNING !! BigRyanBomb INCOMING";
  //L'avertissement clignotte pour plus de style
  let clign = 200;
  let intervalId = setInterval(() => {
    if (gameON === false) {
      clearInterval(intervalId);
      warning.style.visibility = "hidden";
    }
    if (warnSound.paused) warnSound.play();
    else warnSound.currentTime = 0;
    blink(warning);
  }, clign);

  setTimeout(() => {
    clearInterval(intervalId);
    warning.style.visibility = "hidden";
    return;
  }, 2000);
}

//bar de progression score
function LoadbarBasic(goal) {
  progressBar.value = currentBar;
  progressBar.max = goal;
  intervalId = setInterval(() => {
    currentBar = score;
    if (currentBar > goal || gameON === false) {
      clearInterval(intervalId);
    }
    progressBar.value = currentBar;
  }, 30);
}

//bar de progression temps
function LoadBarTimer() {
  progressBar.value = time;
  progressBar.max = time;
  intervalId = setInterval(() => {
    if (time === 0 || gameON === false) {
      clearInterval(intervalId);
    }
    progressBar.value = time;
  }, 30);
}

//fonction a executer avant de jouer, qui affiche le demarrage
function BeforeStartGame() {
  clearGameDisplay();
  titleGM.textContent = gameMode + " Game Mode";
  titleGM.style.display = "";

  if (gameMode === "basic") {
    explanationSpace.textContent =
      "In this Game Mode, you will have 5 sections to clear. Watch out, time is limited and meteorites are smarter as you go ! Shoot meteorites with your left click and avoid clicking on the bombs if you don't want to explode.";
  }
  if (gameMode === "timer") {
    explanationSpace.textContent =
      "In this Game Mode, you will have 2 minutes to shoot the most meteorites while avoiding the bombs. Left click on the meteorites to shoot them.";
  }
  if (gameMode === "endless") {
    explanationSpace.textContent =
      "In this Game Mode, every 20 seconds, meteorites will evolve until reaching the 80 seconds. The game won't end until you click on a bomb. Left click on the meteorites to shoot them.";
  }

  explanationSpace.style.display = "";

  clignotingText.textContent = "Press A to Start";
  clignotingText.style.display = "";
}

//Fonction qui met a jour la variable levels pour y mettre les niveaux appropriés a la difficulté
function updateDifficulty() {
  if (difficulty === "easy") {
    levels = [
      LevelOneEasy,
      LevelTwoEasy,
      LevelThreeEasy,
      LevelFourEasy,
      LevelFiveEasy,
    ];
  }
  if (difficulty === "medium") {
    levels = [
      LevelOne,
      LevelTwo,
      LevelThree,
      LevelFour,
      LevelFive,
    ];
  }
  if (difficulty === "hard") {
    levels = [
      LevelOneHard,
      LevelTwoHard,
      LevelThreeHard,
      LevelFourHard,
      LevelFiveHard,
    ];
  }
}

//Fonction qui affiche le menu (en gros)
function InitBeforeStart() {
  clearGameDisplay();
  updateDifficulty();
  endSpace.src = "assets/menu.png"; 
  endSpace.style.display = "";
  clignotingText.textContent = "Select Game Mode !";
  clignotingText.style.display = "";
  basicGM.style.display = "";
  timerGM.style.display = "";
  endlessGM.style.display = "";
  progressBar.style.visibility = "hidden";
  infos.style.visibility = "hidden";
}

//La fonction qu'on appelle pour demarrer le jeu
function Start() {
  //On empeche le joueur de lancer le jeu si il est deja en cours (meme si ça ne devrait pas etre possible, c'est juste au cas ou)
  if (gameON === true) return;

  //Reinitialisation
  infos.style.visibility = "visible";
  gameON = true;
  clearGameDisplay();
  led.src = "assets/LEDON.png"

  //On met dans currentlevel le niveau et on fait l'initialisation qui correspond au mode de jeu 
  if (gameMode === "basic") {
    CurrentLevel = levels[LevelVar - 1];
    time = 0;
    timesec = 0;
    timemin = 0;
    compteurTitle.textContent = "Level | ";
    compteurSpace.textContent = LevelVar;
    timeSpace.textContent = 0 + ":0" + 0;
  }
  if (gameMode === "timer") {
    CurrentLevel = levels[4];
    time = 120;
    timesec = 0;
    timemin = 2;
    compteurTitle.textContent = "Score | ";
    compteurSpace.textContent = score;
    timeSpace.textContent = timemin + ":0" + 0;
  }
  if (gameMode === "endless") {
    CurrentLevel = levels[0];
    time = 0;
    timesec = 0;
    timemin = 0;
    compteurTitle.textContent = "Score | ";
    compteurSpace.textContent = score;
    timeSpace.textContent = 0 + ":0" + 0;
  }

  score = 0;

  //Chargement de la bar de score
  if (gameMode === "basic") {
    progressBar.style.visibility = "visible";
    LoadbarBasic(CurrentLevel.goal);
  }
  if (gameMode === "timer") {
    progressBar.style.visibility = "visible";
    LoadBarTimer();
  }

  if (gameMode === "endless") {
    //boucle qui augmente le niveau toutes les 20sec jusqu'a atteindre le niv 5
    let levelUpgrade = setInterval(() => {
      if (CurrentLevel.level >= 5) {
        clearInterval(levelUpgrade);
        clearInterval(verifUpgrade);
      }
      else CurrentLevel = levels[CurrentLevel.level];

    }, 20000);
    //boucle qui met fin a la precedente si le jeu est finit
    let verifUpgrade = setInterval(() => {
      if (gameON === false) {
        clearInterval(levelUpgrade);
        clearInterval(verifUpgrade);
      }
    }, 20);
  }

  //On verifie que le jeu tourne encore toutes les 20ms
  let verification_boucle = setInterval(() => {
    if (gameON === false) {
      clearInterval(bombInter);
      clearInterval(timerInter);
      clearInterval(bombInter);
      clearInterval(verification_boucle);
    }
  }, 20);

  if (gameMode === "endless" || gameMode === "timer") {
    //une boucle qui met a jour le score sur la div compteur toutes les 20ms
    let updatescore = setInterval(() => {
      if (gameON === false) {
        clearInterval(updatescore);
      }

      compteurSpace.textContent = score;
    }, 20);
  }

  //Intervalle qui fait apparaitre des bombes
  let bombInter = setInterval(() => {
    if (gameON === false) {
      clearInterval(bombInter);
      return;
    }
    //On affiche un avertissement
    warnprint();

    //On créait la bombe et on supprime le msg d'avertissement 2 sec apres l'apparition de l'avertissement
    setTimeout(() => {
      if (gameON === false) {
        clearInterval(bombInter);
        return;
      }

      //position aléatoire pour la bombe
      let newBombRightPos = Math.random() * 210;
      let newBombTopPos = Math.random() * 200;
      //Création de la bombe
      let new_bomb = new Bomb(newBombRightPos, newBombTopPos);
      new_bomb.CreateBomb();
      new_bomb.updatePos();
      //On ajoute un click event pour arreter le jeu quand on clique sur une bombe
      new_bomb.bombHTML.addEventListener("click", () => {
        bombexplosion.play();
        clearInterval(bombInter);
        new_bomb.bombHTML.src = "assets/Explosion.png";
        setTimeout(() => {
          new_bomb.BombDelete();
          GameOVER();
        }, 100);
      });
      //On la fait se déplacer
      new_bomb.BombMovement(CurrentLevel);
      //On l'ajoute a l'écran
      game.append(new_bomb.bombHTML);
      let verification_boucle = setInterval(() => {
        if (gameON === false) {
          clearInterval(bombInter);
          return;
        }
      }, 20);
      //On supprime la bombe 2 secondes avant qu'une autre apparaisse
      setTimeout(() => {
        new_bomb.BombDelete();
        clearInterval(verification_boucle);
      }, CurrentLevel.spawnBombSpeed - 2000);
    }, 2000);
  }, CurrentLevel.spawnBombSpeed);

  //Intervalle qui avance le timer
  let timerInter = setInterval(() => {
    if (gameON === false) {
      //cette ligne a chaque fois permet d'eviter de laisser la boucle tourner alors que le jeu est fini
      clearInterval(timerInter);
      return;
    }
    if (gameMode === "timer") timerReverse();
    if (gameMode === "basic") timer(CurrentLevel.limitedTime);
    if (gameMode === "endless") timer();
  }, 1000);

  //Intervalle qui fait apparaitre les meteorites
  let meteorInter = setInterval(() => {
    if (gameON === false) {
      clearInterval(meteorInter);
      return;
    }

    //Initisation
    let newMeteorTopPos = 0;
    let newMeteorRightPos = 0;
    let newMeteorPos = "";
    let newMeteorImg = "";
    //Cas de niveaux 1 et 2
    if (CurrentLevel.level === 1) {
      newMeteorTopPos = Math.random() * 300;
      newMeteorRightPos = Math.random() * 160;
      newMeteorImg = "assets/Meteorite.png";
    }
    if (CurrentLevel.level === 2) {
      newMeteorTopPos = Math.random() * 200;
      newMeteorRightPos = Math.random() * 160;
      newMeteorImg = "assets/Meteorite.png";
    }
    if (
      CurrentLevel.level === 3 ||
      CurrentLevel.level === 4 ||
      CurrentLevel.level === 5
    ) {
      newMeteorRightPos = Math.random() * 320;
      newMeteorTopPos = Math.random() * 300;
      if (newMeteorTopPos > 150) {
        if (newMeteorRightPos > 160) {
          newMeteorPos = [-1, -1]; // [a gauche, en bas] (-1 = false, 1 = true)
          newMeteorImg = "assets/MeteoriteGoingUpFromLeft.png";
        } else {
          newMeteorPos = [1, -1];
          newMeteorImg = "assets/MeteoriteGoingUp.png";
        }
      } else {
        if (newMeteorRightPos > 150) {
          newMeteorPos = [-1, 1];
          newMeteorImg = "assets/MeteoriteFromLeft.png";
        } else {
          newMeteorPos = [1, 1];
          newMeteorImg = "assets/Meteorite.png";
        }
      }
    }
    //On créait la météorite avec les attributs aléatoires qu'on a definit juste au dessus
    let new_meteor = new Meteor(
      newMeteorTopPos,
      newMeteorRightPos,
      newMeteorPos,
      newMeteorImg
    );
    //On fait toutes les fonctions qui nous sont utiles pour créer la meteorite
    new_meteor.CreateMeteor();
    new_meteor.meteorHTML.addEventListener("click", () => {
      if (meteorexplosion.paused) {
        meteorexplosion.play();
      } else {
        meteorexplosion.currentTime = 0;
      }
      score++; //Incrémentation du score
      new_meteor.meteorHTML.src = "assets/Explosion.png"; //Petite animation stylée
      // meteorexplosion.play();                       //Bruit d'explosion de météorite
      setTimeout(() => new_meteor.MeteorDelete(), 100); //On attend 100ms pour voir l'explosion
      if (score >= CurrentLevel.goal && gameMode === "basic") {
        YouWin(CurrentLevel); //Si le score a atteint l'objectif, on met fin au jeu avec la fonction adequate
      }
    });
    new_meteor.updatePos();
    new_meteor.MeteorMovement(CurrentLevel);
    new_meteor.meteorCheckIfDisapear();
    //On l'ajoute a l'ecran
    game.append(new_meteor.meteorHTML);
    //on verifie toutes les 20 ms que la meteorite n'a pas été supprimée pour reset l'interval
    let verification_boucle = setInterval(() => {
      if (gameON === false) {
        clearInterval(meteorInter);
        return;
      }
    }, 20);
  }, CurrentLevel.spawnMeteorSpeed);

  return;
}


//Les boutons et ce qui se passe quand on clique dessus
  //Boutons de modes de jeux
basicGM.addEventListener("click", () => {
  buttonpress.play();
  gameMode = "basic";
  BeforeStartGame();
});
timerGM.addEventListener("click", () => {
  buttonpress.play();
  gameMode = "timer";
  BeforeStartGame();
});
endlessGM.addEventListener("click", () => {
  buttonpress.play();
  gameMode = "endless";
  BeforeStartGame();
});

//Boutons qui s'affichent quand on perd/gagne
nextLevel.addEventListener("click", () => {
  buttonpress.play();
  LevelVar += 1;
  // updateLevel(levelVar);
  Start();
});
restartLevel.addEventListener("click", () => {
  buttonpress.play();
  Start();
});
restartAll.addEventListener("click", () => {
  buttonpress.play();
  LevelVar = 1;
  // updateLevel(levelVar);
  BeforeStartGame();
});

  //Boutons presents sur la console
starting.addEventListener("click", () => {
  buttonpress.play();
  starting.src = "assets/ButtonAPress.png"
  setTimeout(() => starting.src = "assets/ButtonA.png", 100);
  if (gameON === false && gameMode != "") Start();
});
menu.addEventListener("click", () => {
  buttonpress.play();
  menu.src = "assets/ButtonBPress.png"
  setTimeout(() => menu.src = "assets/ButtonB.png", 100);
  if (gameON === true) GameOFF();
  gameMode = ""
  InitBeforeStart();
});
incrDif.addEventListener("click", () => {
  clearInterval(intervalId)
  buttonpress.play();
  incrDif.src = "assets/CroixTopPress.png"
  setTimeout(() => incrDif.src = "assets/CroixTop.png", 100);
  warning.style.opacity = 1;
  warning.style.visibility = "visible"
  if (diffCursor < 2 && gameON === false) {
    diffCursor += 1;
    difficulty = difficulties[diffCursor];
    warning.textContent = "Difficulty increased";
  } else warning.textContent = "Cannot raise difficulty";
  
  updateDifficulty()
  intervalId = setInterval(() => {
    if (warning.style.opacity < 0) {
      clearInterval(intervalId)
      warning.style.opacity = 0
    }
    else warning.style.opacity -= 0.1
  }, 80);
});
decrDif.addEventListener("click", () => {
  clearInterval(intervalId)
  buttonpress.play();
  decrDif.src = "assets/CroixDownPress.png"
  setTimeout(() => decrDif.src = "assets/CroixDown.png", 100);
  warning.style.opacity = 1
  warning.style.visibility = "visible"
  if (diffCursor > 0 && gameON === false) {
    diffCursor -= 1;
    difficulty = difficulties[diffCursor];
    warning.textContent = "Difficulty decreased";
  } else warning.textContent = "Cannot lower difficulty";
  
  updateDifficulty()
  intervalId = setInterval(() => {
    if (warning.style.opacity < 0) {
      clearInterval(intervalId)
      warning.style.opacity = 0
    }
    else warning.style.opacity -= 0.1
  }, 80);
});
rightTheme.addEventListener("click", () => {
  buttonpress.play();
  rightTheme.src = "assets/CroixRightPress.png"
  setTimeout(() => rightTheme.src = "assets/CroixRight.png", 100);
  if (colorCursor === colors.length - 1) colorCursor = 0
  else colorCursor += 1
  allPage.style.backgroundColor = colors[colorCursor]
})
leftTheme.addEventListener("click", () => {
  buttonpress.play();
  leftTheme.src = "assets/CroixLeftPress.png"
  setTimeout(() => leftTheme.src = "assets/CroixLeft.png", 100);
  if (colorCursor === 0) colorCursor = colors.length - 1
  else colorCursor -= 1
  allPage.style.backgroundColor = colors[colorCursor]
})
rightFond.addEventListener("click", () => {
  buttonpress.play();
  rightFond.src = "assets/GachetteDroitePress.png"
  setTimeout(() => rightFond.src = "assets/GachetteDroite.png", 100);
  if (fondCursor === fonds.length - 1) fondCursor = 0
  else fondCursor += 1
  game.style.backgroundImage = fonds[fondCursor]
})
leftFond.addEventListener("click", () => {
  buttonpress.play();
  leftFond.src = "assets/GachetteGauchePress.png"
  setTimeout(() => leftFond.src = "assets/GachetteGauche.png", 100);
  if (fondCursor === 0) fondCursor = fonds.length - 1
  else fondCursor -= 1
  game.style.backgroundImage = fonds[fondCursor]
})

mute.addEventListener("click", () => {
  if (muted) {
    muted = false;
    buttonpress.play();
    laser.volume = 1;
    meteorexplosion.volume = 1;
    bombexplosion.volume = 1;
    youlose.volume = 1;
    youwin.volume = 1;
    buttonpress.volume = 1;
    warnSound.volume = 0.3;
    mute.src = "assets/ButtonTestModeActivated.png";
  } else {
    muted = true;
    laser.volume = 0;
    meteorexplosion.volume = 0;
    bombexplosion.volume = 0;
    youlose.volume = 0;
    youwin.volume = 0;
    buttonpress.volume = 0;
    warnSound.volume = 0;
    mute.src = "assets/ButtonTestMode.png";
  }
});

//Quand on tire sur l'ecran, ça fait piou piou
game.addEventListener("click", (event) => {
  if (event.target === game && gameON === true) {
    if (laser.paused) laser.play();
    else laser.currentTime = 0;
  }
});

setInterval(() => blink(clignotingText), 800);
InitBeforeStart();
