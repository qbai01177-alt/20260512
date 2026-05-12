let capture;
let faceMesh;
let faces = [];
let handPose;
let hands = [];
let earrings = [];
let currentEarring = 0; // 預設顯示第一副耳環 (index 0)

function setup() {
  // 產生全螢幕畫布
  createCanvas(windowWidth, windowHeight);
  
  // 載入 1~5 個手勢對應的耳環圖片
  earrings[0] = loadImage('pic/acc/acc1_ring.png');
  earrings[1] = loadImage('pic/acc/acc2_pearl.png');
  earrings[2] = loadImage('pic/acc/acc3_tassel.png');
  earrings[3] = loadImage('pic/acc/acc4_jade.png');
  earrings[4] = loadImage('pic/acc/acc5_phoenix.png');
  
  // 擷取攝影機影像
  capture = createCapture(VIDEO, () => {
    // 攝影機啟動後，在背景載入 AI 模型 (不會卡住畫面)
    faceMesh = ml5.faceMesh(() => {
      // 模型載入完成後，啟動人臉特徵偵測
      faceMesh.detectStart(capture, results => {
        faces = results;
      });
    });
    
    // 在背景載入 AI 手勢模型
    handPose = ml5.handPose(() => {
      handPose.detectStart(capture, results => {
        hands = results;
      });
    });
  });
  capture.hide(); // 隱藏 p5.js 自動產生的預設 HTML 影片元素
}

function draw() {
  // 設定畫布的背景顏色為 e7c6ff
  background('#e7c6ff');
  
  // 在畫布上方置中顯示標題文字
  fill(0); // 設定文字顏色為黑色
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(32);
  text("414730076李羿蓁", width / 2, height * 0.1);
  textSize(24);
  text("作品為影像辨識_耳環臉譜", width / 2, height * 0.1 + 40);
  
  // 計算顯示影像的寬高，為整個畫布寬高的 50%
  let imgW = width * 0.5;
  let imgH = height * 0.5;
  
  push();
  // 將座標原點移動到畫布中心
  translate(width / 2, height / 2);
  // 左右顛倒處理 (水平翻轉 x 軸)
  scale(-1, 1);
  
  // 以中心為基準點繪製影像
  imageMode(CENTER);
  image(capture, 0, 0, imgW, imgH);
  
  // 如果有辨識到手勢，計算伸出的手指數量
  if (hands.length > 0) {
    let hand = hands[0];
    let fingers = 0;
    let kp = hand.keypoints;
    
    // 食指、中指、無名指、小拇指：判斷指尖的 y 座標是否高於(數值小於)第二關節的 y 座標
    if (kp[8].y < kp[6].y) fingers++;
    if (kp[12].y < kp[10].y) fingers++;
    if (kp[16].y < kp[14].y) fingers++;
    if (kp[20].y < kp[18].y) fingers++;
    
    // 大拇指：判斷指尖到小拇指根部的距離，是否大於拇指第二關節到小拇指根部的距離
    let dTip = dist(kp[4].x, kp[4].y, kp[17].x, kp[17].y);
    let dMcp = dist(kp[2].x, kp[2].y, kp[17].x, kp[17].y);
    if (dTip > dMcp) fingers++;
    
    // 根據手指數量 1~5 切換對應圖片
    if (fingers >= 1 && fingers <= 5) {
      currentEarring = fingers - 1;
    }
  }
  
  // 如果有辨識到臉部特徵，則繪製耳環
  if (faces.length > 0) {
    let mesh = faces[0].keypoints;
    
    // 使用 FaceMesh 特徵點近似耳垂位置
    // 177 為左側耳垂附近點，401 為右側耳垂附近點
    let leftEarlobe = mesh[177];
    let rightEarlobe = mesh[401];
    
    // 傳入 dir 參數，-1 代表左側(往-X移)，1 代表右側(往+X移)
    drawEarring(leftEarlobe, imgW, imgH, -1);
    drawEarring(rightEarlobe, imgW, imgH, 1);
  }
  
  pop();
}

// 繪製耳環的輔助函式
function drawEarring(pt, imgW, imgH, dir) {
  // 確保特徵點有值且影像已成功載入尺寸
  if (!pt || capture.width === 0 || capture.height === 0) return;
  
  // 將辨識到的座標轉換為當前 50% 縮放且置中的座標系統
  let x = (pt.x / capture.width) * imgW - imgW / 2;
  let y = (pt.y / capture.height) * imgH - imgH / 2;
  
  // 設定耳環圖片顯示的大小，預設為影像寬度的 15% (可自行調整數值)
  let earringSize = imgW * 0.15; 
  
  // 利用比率設定往外和往上移動的量 
  // offsetX: 以耳環大小的 20% 往外移動
  let offsetX = earringSize * 0.2 * dir; 
  // offsetY: 以耳環大小的 15% 往上移動 (負值代表往上)
  let offsetY = -earringSize * 0.15;
  
  // 畫出耳環圖片，並疊加上述計算出的 offsetX 與 offsetY
  if (earrings[currentEarring]) {
    image(earrings[currentEarring], x + offsetX, y + earringSize * 0.4 + offsetY, earringSize, earringSize);
  }
}

// 當視窗大小改變時，自動重新調整畫布大小以維持全螢幕
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}