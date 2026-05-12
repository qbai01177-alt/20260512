let capture;
let faceMesh;
let faces = [];
let isModelReady = false;

function setup() {
  // 產生全螢幕畫布
  createCanvas(windowWidth, windowHeight);
  
  // 擷取攝影機影像
  capture = createCapture(VIDEO, () => {
    // 確保攝影機載入後，再初始化模型
    faceMesh = ml5.faceMesh(() => {
      isModelReady = true;
      // 模型載入完畢後，啟動人臉特徵偵測
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
  
  // 如果攝影機或模型還沒準備好，顯示載入中畫面
  if (!isModelReady || capture.width === 0) {
    textAlign(CENTER, CENTER);
    textSize(24);
    fill(0);
    noStroke();
    text("載入攝影機與 AI 模型中，請稍候...\n\n(若一直停在此畫面，請確認：\n1. 瀏覽器是否允許存取攝影機權限\n2. 需使用 Local Server 開啟網頁，而非直接雙擊打開)", width / 2, height / 2);
    return;
  }
  
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
  
  let circleSize = imgW * 0.015; // 耳環圓圈的大小，隨影像寬度變動
  let spacing = circleSize * 1.5; // 圓圈之間往下排列的間距
  
  fill(255, 255, 0); // 黃色
  noStroke();
  
  // 在耳垂位置往下畫出三個圓圈
  for (let i = 1; i <= 3; i++) {
    circle(x, y + i * spacing, circleSize);
  }
}

// 當視窗大小改變時，自動重新調整畫布大小以維持全螢幕
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}