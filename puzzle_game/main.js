console.log("hello");
const container = document.querySelector(".image-container");
const startButton = document.querySelector(".start-button");
const gameText = document.querySelector(".game-text");
const playTime = document.querySelector(".play-time");

const tileCount = 16;
let tiles = [];
const dragged = {
  el: null,
  class: null,
  index: null,
};

let isPlaying = false;
let timeInterval = null;
let time = 0;
function checkStatus() {
  const currentList = [...container.children];

  const unMatchedList = currentList.filter(
    (child, index) => Number(child.getAttribute("dataindex")) !== index
  );
  console.log(unMatchedList.length);
  if (unMatchedList.length == 0) {
    //game finish
    gameText.innerHTML = "게임 클리어";
    gameText.style.display = "block";
    isPlaying = false;
    clearInterval(timeInterval);
  }
}
function setGame() {
  isPlaying = true;
  timeInterval = setInterval(() => {
    playTime.innerHTML = time;
    time++;
  }, 1000);
  tiles = createImageTiles();
  tiles.forEach((tile) => container.appendChild(tile));
  setTimeout(() => {
    container.innerHTML = "";
    shuffle(tiles).forEach((tile) => container.appendChild(tile));
  }, 2000);
}

function createImageTiles() {
  const tempArray = [];
  Array(tileCount)
    .fill()
    .forEach((_, i) => {
      const li = document.createElement("li");
      $(li).attr("dataindex", i);
      li.setAttribute("draggable", true);
      $(li).addClass(`list${i}`);

      tempArray.push(li);
    });
  return tempArray;
}

function shuffle(array) {
  let index = array.length - 1;
  while (index > 0) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [array[index], array[randomIndex]] = [array[randomIndex], array[index]];
    index--;
  }
  return array;
}

//events

container.addEventListener("dragstart", (e) => {
  if (!isPlaying) return;
  const obj = e.target;
  dragged.el = obj;
  dragged.class = obj.className;
  dragged.index = [...obj.parentNode.children].indexOf(obj);
  console.log(e);
});
container.addEventListener("dragover", (e) => {
  if (!isPlaying) return;
  e.preventDefault();
});

// 드롭시 이벤트
container.addEventListener("drop", (e) => {
  if (!isPlaying) return;
  const obj = e.target;
  if (obj.className !== dragged.class) {
    const droppedIndex = [...obj.parentNode.children].indexOf(obj);
    let originPlace;
    let isLast = false;

    if (dragged.el.nextSibling) {
      originPlace = dragged.el.nextSibling;
    } else {
      originPlace = dragged.el.previousSibling;
      isLast = true;
    }
    dragged.index > droppedIndex
      ? obj.before(dragged.el)
      : obj.after(dragged.el);
    isLast ? originPlace.after(obj) : originPlace.before(obj);
  }
  checkStatus();
});

// $(".image-container").on("dragstart", (e) => {
//   console.log(e);
// });
// 고른 타일의 인덱스번호가 떨군자리 타일의 인덱스 번호보다 크번  떨군 타일의 앞에 고른 타일을 놓고 고른 타일의 인덱스가
// 작으면 떨군 타일의 뒤에 고른 타일을 넣는다.
//   고른 타일이 마지막 타일이면 오리진 펠리스의 다음에  떨군자리 타일을 놓고 마지막 타일이 아니면  오리진 팰리스의 앞(원래자리)에 타일을 놓는다

startButton.addEventListener("click", () => {
  setGame();
  $(".pre-li").css("display", "none");
  $(".game-text").css("display", "none");
  $("li").css("border", "none");
});
