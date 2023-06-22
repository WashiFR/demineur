'use strict'

// ####################### Variables globales #######################

let grid = document.getElementById("grid")

let cells = []

let flagMode = false
let gameStarted = false

let timer = 0
let timerInterval = setInterval(increaseTimer, 1000)

let numberOfBombs = 0
let numberOfRows = 0
let numberOfColumns = 0
let numberOfCells = 0

let difficultyLevel = "easy"

let cellSize = 0

// ####################### Constantes globales #######################

const flagButton = document.getElementById("flag")
const restartButton = document.getElementById("restart")
const themeButton = document.getElementById("theme")
const difficultySelect = document.getElementById("difficulty")
const bombsElement = document.getElementById("bombs")
const timerElement = document.getElementById("timer")

const bombImage = '💣'
const flagImage = '🚩'

const difficulty = {
    easy: {
        numberOfBombs: 5,
        numberOfRows: 9,
        numberOfColumns: 9
    },
    medium: {
        numberOfBombs: 40,
        numberOfRows: 16,
        numberOfColumns: 16
    },
    hard: {
        numberOfBombs: 99,
        numberOfRows: 16,
        numberOfColumns: 30
    }
}

// ####################### Fonctions globales #######################

/**
 * Définit la taille de la grille de jeu en fonction de la difficulté
 * 
 * @param {string} diff 
 */
function setGameSize(diff = "easy") {

    numberOfBombs = difficulty[diff].numberOfBombs
    bombsElement.innerHTML = numberOfBombs
    numberOfRows = difficulty[diff].numberOfRows
    numberOfColumns = difficulty[diff].numberOfColumns
    numberOfCells = numberOfRows * numberOfColumns

    if (window.innerWidth > window.innerHeight) {
        grid.style.gridTemplateColumns = "repeat(" + numberOfColumns + ", 1fr)"
        grid.style.gridTemplateRows = "repeat(" + numberOfRows + ", 1fr)"
    }
    else {
        grid.style.gridTemplateColumns = "repeat(" + numberOfRows + ", 1fr)"
        grid.style.gridTemplateRows = "repeat(" + numberOfColumns + ", 1fr)"
    }
}

/**
 * Crée une grille de jeu
 * 
 * @returns {void}
 */
function createGrid() {

    for (let i = 0 ; i < numberOfRows ; i++) {
        cells[i] = []
        for (let j = 0 ; j < numberOfColumns ; j++) {
            // Création de la cellule
            let cell = document.createElement("div")
            cell.classList.add("cell")

            // Ajout des écouteurs d'événements
            cell.onclick = () => cellClick(i, j)
            
            cell.oncontextmenu = () => {
                if (!cell.classList.contains("green") && cell.innerHTML != flagImage) {
                    cell.innerHTML = flagImage
                    numberOfBombs--
                    bombsElement.innerHTML = numberOfBombs
                }
                else if (cell.innerHTML == flagImage) {
                    cell.innerHTML = ""
                    numberOfBombs++
                    bombsElement.innerHTML = numberOfBombs
                }
                // On empêche le menu contextuel de s'afficher
                return false
            }

            grid.appendChild(cell)
            cells[i][j] = cell
        }
    }

    setBombs()
}

/**
 * Attribut aléatoirement le nombre de bombes dans la grille
 * 
 * @returns {void}
 */
function setBombs() {
    let bombs = 0

    while (bombs < numberOfBombs) {
        let row = Math.floor(Math.random() * numberOfRows)
        let column = Math.floor(Math.random() * numberOfColumns)

        if (!cells[row][column].classList.contains("bomb")) {
            cells[row][column].classList.add("bomb")
            bombs++
        }
    }
}

/**
 * Ajoute les écouteurs d'événements sur la cellule
 * 
 * @returns {void}
 */
function cellClick(i, j) {

    if (!gameStarted)
        gameStarted = true

    // Si la cellule contient un drapeau, on ne fait rien
    if (cells[i][j].innerHTML == flagImage && !flagMode)
        return

    if (flagMode && !cells[i][j].classList.contains("green") && cells[i][j].innerHTML != flagImage) {
        cells[i][j].innerHTML = flagImage
        numberOfBombs--
        bombsElement.innerHTML = numberOfBombs
    }
    else if (flagMode && cells[i][j].innerHTML == flagImage) {
        cells[i][j].innerHTML = ""
        numberOfBombs++
        bombsElement.innerHTML = numberOfBombs
    }
    else {
        if (cells[i][j].classList.contains("bomb"))
            gameOver()
        else {
            cells[i][j].classList.add("green")
            let numberOfBombs = getNumberOfBombsAround(i, j)
            if (numberOfBombs > 0)
                cells[i][j].innerHTML = numberOfBombs
            else
                showEmptyCells(i, j)
        }
    }
}

/**
 * Retourne le nombre de bombes autour d'une cellule
 * 
 * @param {number} i L'indice de la ligne de la cellule
 * @param {number} j L'indice de la colonne de la cellule
 * @returns {number} Le nombre de bombes autour de la cellule
 */
function getNumberOfBombsAround(i, j) {
    let numberOfBombs = 0

    for (let x = i - 1 ; x <= i + 1 ; x++) {
        for (let y = j - 1 ; y <= j + 1 ; y++) {
            // On vérifie que les coordonnées sont valides et que la cellule n'est pas la cellule elle-même
            if (x >= 0 && x < numberOfRows && y >= 0 && y < numberOfColumns && !(x == i && y == j)) {
                if (cells[x][y].classList.contains("bomb"))
                    numberOfBombs++
            }
        }
    }

    return numberOfBombs
}

/**
 * Affiche toutes les cellules vides autour d'une cellule, et les cellules vides autour de ces cellules, etc.
 * 
 * @param {number} i L'indice de la ligne de la cellule
 * @param {number} j L'indice de la colonne de la cellule
 * @returns {void}
 */
function showEmptyCells(i, j) {
    for (let x = i - 1 ; x <= i + 1 ; x++) {
        for (let y = j - 1 ; y <= j + 1 ; y++) {
            // On vérifie que les coordonnées sont valides et que la cellule n'a pas déjà été cliquée
            if (x >= 0 && x < numberOfRows && y >= 0 && y < numberOfColumns && !cells[x][y].classList.contains("green")) {
                cells[x][y].classList.add("green")
                let numberOfBombs = getNumberOfBombsAround(x, y)
                if (numberOfBombs > 0)
                    cells[x][y].innerHTML = numberOfBombs
                else
                    showEmptyCells(x, y)
            }
        }
    }
}

/**
 * Incrémente le timer
 * 
 * @returns {void}
 */
function increaseTimer() {
    if (gameStarted) {
        timer++
        timerElement.innerHTML = timer
    }
}

/**
 * Défaite du joueur
 * 
 * @returns {void}
 */
function gameOver() {
    // On affiche toutes les bombes
    cells.forEach(row => {
        row.forEach(cell => {
            if (cell.classList.contains("bomb")) {
                cell.innerHTML = bombImage
                cell.classList.add("red")
            }
        })
    })

    // On désactive les écouteurs d'événements
    cells.forEach(row => {
        row.forEach(cell => {
            cell.onclick = null
        })
    })

    alert("Game over !")

    gameStarted = false
}

/**
 * Démarre le jeu
 * 
 * @returns {void}
 */
function startGame() {
    setGameSize(difficultyLevel)

    createGrid()

    // Vérifie si le joueur a gagné (toutes les cellules sans bombe ont été cliquées)
    setInterval(() => {
        let greenCells = document.getElementsByClassName("green")
        if (greenCells.length == numberOfCells - difficulty[difficultyLevel].numberOfBombs) {
            alert(
                "You win !\n",
                "Difficulty : " + difficultyLevel + "\n",
                "Your time : " + Math.floor(timer / 60) % 60 + "min " + timer % 60 + "s"
                )
            gameStarted = false

            restartGame()
        }
    }, 1000)

    // On ajoute les écouteurs d'événements sur les boutons

    difficultySelect.onchange = () => {
        difficultyLevel = difficultySelect.value
        restartGame()
    }

    flagButton.onclick = () => {
        flagMode = !flagMode
        flagButton.classList.toggle("green")
    }

    restartButton.onclick = () => restartGame()

    themeButton.onclick = () => {
        document.body.classList.toggle("dark-mode")
        themeButton.classList.toggle("dark-mode")
        if (document.body.classList.contains("dark-mode"))
            themeButton.innerHTML = "☀️"
        else
            themeButton.innerHTML = "🌙"
    }
}

/**
 * Recommence le jeu
 * 
 * @returns {void}
 */
function restartGame() {
    // On supprime toutes les cellules
    grid.innerHTML = ""
    cells = []

    gameStarted = false
    timer = 0
    timerElement.innerHTML = timer

    setGameSize(difficultyLevel)

    // On recrée la grille
    createGrid()
}

// ####################### Programme principal #######################

window.addEventListener("load", startGame)

window.addEventListener("resize", () => {
    setGameSize(difficultyLevel)
    restartGame()
})