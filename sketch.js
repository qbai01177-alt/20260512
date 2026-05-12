let capture;
let faceMesh;
let faces = [];
let earringImg;

function setup() {
  // 產生全螢幕畫布
  createCanvas(windowWidth, windowHeight);
  
  // 載入耳環圖片
  earringImg = loadImage('pic/acc/acc1_ring.png');
  
  // 擷取攝影機影像
  capture = createCapture(VIDEO, () => {
    // 攝影機啟動後，在背景載入 AI 模型 (不會卡住畫面)
    faceMesh = ml5.faceMesh(() => {
      // 模型載入完成後，啟動人臉特徵偵測
      faceMesh.detectStart(capture, results => {
        faces = results;
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
  text("414730076李OO", width / 2, height * 0.1);
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
  
  // 如果有辨識到臉部特徵，則繪製耳環
  if (faces.length > 0) {
    let mesh = faces[0].keypoints;
    
    // 使用 FaceMesh 特徵點近似耳垂位置
    // 177 為左側耳垂附近點，401 為右側耳垂附近點
    let leftEarlobe = mesh[177];
    let rightEarlobe = mesh[401];
    
    drawEarring(leftEarlobe, imgW, imgH);
    drawEarring(rightEarlobe, imgW, imgH);
  }
  
  pop();
}

// 繪製耳環的輔助函式
function drawEarring(pt, imgW, imgH) {
  // 確保特徵點有值且影像已成功載入尺寸
  if (!pt || capture.width === 0 || capture.height === 0) return;
  
  // 將辨識到的座標轉換為當前 50% 縮放且置中的座標系統
  let x = (pt.x / capture.width) * imgW - imgW / 2;
  let y = (pt.y / capture.height) * imgH - imgH / 2;
  
  // 設定耳環圖片顯示的大小，預設為影像寬度的 15% (可自行調整數值)
  let earringSize = imgW * 0.15; 
  
  // 畫出耳環圖片，Y 座標加上 size 的 40% 往下偏移，讓耳環像掛在耳垂下方
  if (earringImg) {
    image(earringImg, x, y + earringSize * 0.4, earringSize, earringSize);
  }
}

// 當視窗大小改變時，自動重新調整畫布大小以維持全螢幕
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}