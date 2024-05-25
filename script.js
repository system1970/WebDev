document.addEventListener("DOMContentLoaded", function () {
  document.addEventListener("keypress", rotate);
  const board = document.getElementById("board");
  const turnDisplay = document.getElementById("current-turn");

  let currentPlayer = "red";
  let selectedPiece = null;
  let shootingAnimationPlaying = false;
  turnDisplay.textContent = capitalize(currentPlayer);

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  const pieces = ["Titan", "Riccochet", "Semi-Riccochet", "Cannon", "Tank"];
  
  function createPiece(color, name) {
    const piece = document.createElement("div");
    piece.classList.add("piece", color);
    if(name=="Riccochet") {
      const icon = document.createElement("i");
      icon.classList.add("fa-solid" , "fa-minus");

      icon.style.transform = "rotate(-45deg) scale(4)";
      piece.appendChild(icon);

      piece.addEventListener("click", selectPiece2);
    }else if(name=="Semi-Riccochet"){
      const icon = document.createElement("div");
      icon.classList.add("semi-ricc")

      icon.style.transform = "rotate(180deg)";
      piece.appendChild(icon);

      piece.addEventListener("click", selectPiece2);
    }else{
      piece.textContent = name;
      piece.addEventListener("click", selectPiece);
    }
    piece.setAttribute("draggable", "true");
    piece.setAttribute("name", name);
    return piece;
  }

  function rotate(e){
    console.log(selectedPiece)
    if(!selectedPiece || String.fromCharCode(e.keyCode)!="r") return;
    // && selectedPiece.classList.contains(currentPlayer)
    if(selectedPiece.getAttribute("name")=="Riccochet"){
      console.log(selectedPiece.style)
      selectedPiece.style.transform = selectedPiece.style.transform == "rotate(-90deg)" ? "rotate(0deg)" : "rotate(-90deg)";
    } else if(selectedPiece.getAttribute("name")=="Semi-Riccochet"){
      if(selectedPiece.style.transform == "rotate(180deg)"){

      }
      selectedPiece.style.transform = selectedPiece.style.transform == "rotate(-90deg)" ? "rotate(0deg)" : "rotate(-90deg)";
      currentPlayer = currentPlayer === "red" ? "blue" : "red";
    }
    currentPlayer = currentPlayer === "red" ? "blue" : "red";
    turnDisplay.textContent = capitalize(currentPlayer);
    clearHighlights(currentPlayer);
  
    // alert(String.fromCharCode(keynum));
  }

  function highlightMoves(piece) {
    if (!selectedPiece) return;
    boardCells.forEach((cell, index) => {
      if (validateMove(piece.parentElement, cell)) {
        cell.style.background = "green";
      } else {
        cell.style.background = "white";
      }
      // }
    });
  }

  function clearHighlights() {
    boardCells.forEach((cell, index) => {
      cell.style.background = "white";
    });
  }

  function selectPiece(event) {
    if(shootingAnimationPlaying) return;
    const clickedPiece = event.target;
    // if (clickedPiece.classList.contains(currentPlayer)) {
      selectedPiece = clickedPiece;
      highlightMoves(selectedPiece);
    // }
  }

  function selectPiece2(event) {
    if(shootingAnimationPlaying) return;
    const clickedPiece = event.target.parentElement;
    // if (clickedPiece.classList.contains(currentPlayer)) {
      selectedPiece = clickedPiece;
      highlightMoves(selectedPiece);
    // }
  }

  function movePiece(event) {
    if (!selectedPiece) return;
    const destinationCell = event.target;
    if (!destinationCell.classList.contains("cell")) return;

    const sourceCell = selectedPiece.parentElement;
    const isValidMove = validateMove(sourceCell, destinationCell);
    if (isValidMove) {
      destinationCell.appendChild(selectedPiece);
      selectedPiece = null;
      if (destinationCell.children.length) {
        if (destinationCell.children[0].textContent === "Cannon") {
          shootBullet(destinationCell);
        }
      }
      currentPlayer = currentPlayer === "red" ? "blue" : "red";
      turnDisplay.textContent = capitalize(currentPlayer);
    }
    clearHighlights();
  }

  function validateMove(sourceCell, destinationCell) {
    // console.log("WENT WEOG", sourceCell)
    let x1 = parseInt(sourceCell.attributes.X.value);
    let x2 = parseInt(destinationCell.attributes.X.value);
    let y1 = parseInt(sourceCell.attributes.Y.value);
    let y2 = parseInt(destinationCell.attributes.Y.value);
    if (Math.abs(x2 - x1) > 1 || Math.abs(y2 - y1) > 1) {
      return false;
    }
    if (destinationCell.children.length) return false;
    if (sourceCell.children.length) {
      if (sourceCell.children[0].textContent === "Cannon") {
        if (Math.abs(x2 - x1) > 0) return false;
      }
    }
    return true;
  }

  function shootBullet(cell) {
    const x = parseInt(cell.getAttribute("X"));
    const y = parseInt(cell.getAttribute("Y"));

    let directionX = cell.children[0].classList.contains("red") ? 1 : -1;
    let directionY = 0; // Horizontal movement only

    let newX = x + directionX;
    let newY = y + directionY;

    const bullet = document.createElement("div");
    bullet.classList.add("bullet");
    bullet.textContent = "*";
    boardCells[newX * 8 + newY].appendChild(bullet);
    
    let player = cell.children[0].classList.contains("red") ? "red" : "blue";
    let opponent = cell.children[0].classList.contains("red") ? "blue" : "red";

    const bulletInterval = setInterval(() => {
      console.log(newX * 8 + newY, newX, newY)
      const newCell = boardCells[newX * 8 + newY];
      shootingAnimationPlaying = true;
      if (newCell && newY>0 && newY<8) {
        newCell.appendChild(bullet);
        if(newCell.children[0].children.length){
          console.log("Bullet hit a Riccochet obstacle")
          if(newCell.children[0].getAttribute("name")=="Riccochet"){
            // Case Handling:
            let rev = newCell.children[0].style.transform == "rotate(-90deg)" ? -1 : 1;
            if(directionX != 0){
              directionY = (directionX > 0 ? -1: 1) * rev;
              directionX = 0;
            } else {
              directionX = (directionY > 0 ? -1 : 1) * rev;
              directionY = 0;
            }
            newX += directionX;
            newY += directionY;
          }
        }
        else if (
          newCell.children.length > 1 &&
          newCell.children[0].classList.contains(opponent)
        ) {
          // Hit an obstacle, remove the opponent's piece and bullet
            console.log("Bullet hit an obstacle" + newCell.children[0]);
            newCell.removeChild(newCell.children[0]);
            clearInterval(bulletInterval);
            shootingAnimationPlaying = false;
            bullet.remove();
        } else {
          if(newCell.children[0].classList.contains(player)){
            clearInterval(bulletInterval);
            shootingAnimationPlaying = false;
            bullet.remove();
          }
          newX += directionX;
          newY += directionY;
        }
      } else {
        clearInterval(bulletInterval);
        shootingAnimationPlaying = false;
        bullet.remove();
      }
    }, 100);
  }

  for (let i = 0; i < 64; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.addEventListener("click", movePiece);
    cell.setAttribute("X", Math.floor(i / 8));
    cell.setAttribute("Y", Math.floor(i % 8));
    board.appendChild(cell);
  }

  // Position pieces on the board
  const boardCells = document.querySelectorAll(".cell");
  boardCells.forEach((cell, index) => {
    if (index < 5) {
      const redPiece = createPiece("red", pieces[index]);
      cell.appendChild(redPiece);
    }
    if (index > 58) {
      const bluePiece = createPiece("blue", pieces[index - 59]);
      cell.appendChild(bluePiece);
    }
  });
  clearHighlights();
});
