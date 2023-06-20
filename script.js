'use strict'

// ######################
// # Variables globales #
// ######################

let grid = document.getElementById("grid")
let cells = []
let flagMode = false
let isGameStarted = false
let timer = 0
let timerInterval = setInterval(increaseTimer, 1000)

let flagButton = document.getElementById("flag")
let restartButton = document.getElementById("restart")
let themeButton = document.getElementById("theme")
let timerElement = document.getElementById("timer")

// #######################
// # Constantes globales #
// #######################

const bombImage = '💣'
const flagImage = '🚩'

// ######################
// # Fonctions globales #
// ######################

/**
 * Crée une grille de 100 cellules
 * 
 * @returns {void}
 */
function createGrid() {
    for (let i = 0 ; i < 100 ; i++) {
        let cell = document.createElement("div")
        // On ajoute un écouteur d'événement sur la cellule
        cell.onclick = cellClick.bind(this, cell)
        // On ajoute un écouteur d'événement sur le clic droit
        cell.oncontextmenu = () => {
            if (!cell.classList.contains("green") && cell.innerHTML != flagImage)
                cell.innerHTML = flagImage
            else if (cell.innerHTML == flagImage)
                cell.innerHTML = ""
            // On empêche le menu contextuel de s'afficher
            return false
        }
        cell.classList.add("cell")
        grid.appendChild(cell)
        cells.push(cell)
    }

    setBombs()
}

/**
 * Attribut les bombes dans la grille
 * 
 * @returns {void}
 */
function setBombs() {
    cells.forEach(cell => {
        // 20% de chance d'avoir une bombe dans la cellule
        if (Math.random() < 0.2)
            cell.classList.add("bomb")
    })
}

/**
 * Ajoute les écouteurs d'événements sur la cellule
 * 
 * @param {HTMLElement} cell La cellule
 * @returns {void}
 */
function cellClick(cell) {

    if (!isGameStarted)
        isGameStarted = true

    // Si la cellule contient un drapeau, on ne fait rien
    if (cell.innerHTML == flagImage && !flagMode)
        return

    if (flagMode && !cell.classList.contains("green") && cell.innerHTML != flagImage)
        cell.innerHTML = flagImage
    else if (flagMode && cell.innerHTML == flagImage)
        cell.innerHTML = ""
    else {
        if (cell.classList.contains("bomb"))
            gameOver()
        else {
            cell.classList.add("green")
            let numberOfBombs = getNumberOfBombsAround(cell)
            if (numberOfBombs > 0)
                cell.innerHTML = numberOfBombs
            else
                showEmptyCells(cell)
        }
    }
}

/**
 * Retourne le nombre de bombes autour d'une cellule
 * 
 * @param {HTMLElement} cell La cellule
 * @returns {number} Le nombre de bombes autour de la cellule
 */
function getNumberOfBombsAround(cell) {
    let numberOfBombs = 0
    let cellIndex = cells.indexOf(cell)
    let cellRow = Math.floor(cellIndex / 10)
    let cellColumn = cellIndex % 10

    for (let i = cellRow - 1 ; i <= cellRow + 1 ; i++) {
        for (let j = cellColumn - 1 ; j <= cellColumn + 1 ; j++) {
            // On vérifie que les coordonnées sont valides
            if (i >= 0 && i < 10 && j >= 0 && j < 10) {
                let index = i * 10 + j
                // Si la cellule contient une bombe, on incrémente le nombre de bombes
                if (cells[index].classList.contains("bomb"))
                    numberOfBombs++
            }
        }
    }

    return numberOfBombs
}

/**
 * Affiche toutes les cellules vides autour d'une cellule, et les cellules vides autour de ces cellules, etc.
 * 
 * @param {HTMLElement} cell La cellule
 * @returns {void}
 */
function showEmptyCells(cell) {
    let cellIndex = cells.indexOf(cell)
    let cellRow = Math.floor(cellIndex / 10)
    let cellColumn = cellIndex % 10

    for (let i = cellRow - 1 ; i <= cellRow + 1 ; i++) {
        for (let j = cellColumn - 1 ; j <= cellColumn + 1 ; j++) {
            // On vérifie que les coordonnées sont valides
            if (i >= 0 && i < 10 && j >= 0 && j < 10) {
                let index = i * 10 + j
                // Si la cellule n'a pas encore été affichée, on l'affiche
                if (!cells[index].classList.contains("green")) {
                    cells[index].classList.add("green")
                    let numberOfBombs = getNumberOfBombsAround(cells[index])
                    // Si la cellule a des bombes autour, on affiche le nombre de bombes
                    if (numberOfBombs > 0)
                        cells[index].innerHTML = numberOfBombs
                    // Sinon, on affiche les cellules vides autour de cette cellule
                    else
                        showEmptyCells(cells[index])
                }
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
    if (isGameStarted) {
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
    cells.forEach(cell => {
        if (cell.classList.contains("bomb")) {
            cell.classList.add("red")
            cell.innerHTML = bombImage
        }
    })

    isGameStarted = false

    alert("Game over !")

    // On désactive les écouteurs d'événements
    cells.forEach(cell => {
        cell.onclick = null
    })
}

/**
 * Démarre le jeu
 * 
 * @returns {void}
 */
function startGame() {
    createGrid()

    // Vérifie si le joueur a gagné (toutes les cellules sans bombe ont été cliquées)
    setInterval(() => {
        let win = true
        cells.forEach(cell => {
            // Si la cellule n'est pas une bombe et n'a pas été cliquée, le joueur n'a pas gagné
            if (!cell.classList.contains("bomb") && !cell.classList.contains("green"))
                win = false
        })

        if (win) {
            alert(
                "You win !\n" +
                "Your time : " + Math.floor(timer / 60) % 60 + "min " + timer % 60 + "s"
                )
            cells.forEach(cell => {
                cell.onclick = null
            })
            restartGame()
        }
    }, 100)

    // On ajoute les écouteurs d'événements sur les boutons
    flagButton.onclick = () => {
        flagMode = !flagMode
        flagButton.classList.toggle("green")
    }

    restartButton.onclick = restartGame

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
    cells.forEach(cell => {
        cell.remove()
    })
    cells = []

    isGameStarted = false
    timer = 0
    timerElement.innerHTML = timer

    // On recrée la grille
    createGrid()
}

// ######################
// # Programme principal #
// ######################

window.addEventListener("load", startGame)
