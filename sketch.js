let capture;
let faceMesh;
let faces = [];
let options = { maxFaces: 1, refineLandmarks: false, flipHorizontal: false };

function preload() {
  // 檢查 ml5 是否已載入
  if (typeof ml5 !== 'undefined') {
    // 載入 ml5 faceMesh 模型
    faceMesh = ml5.faceMesh(options);
  } else {
    console.error("錯誤：找不到 ml5 函式庫，請確認 HTML 中已包含 ml5.js 的 script 標籤。");
  }
}

function setup() {
  // 建立全螢幕畫布
  createCanvas(windowWidth, windowHeight);
  // 擷取攝影機影像
  capture = createCapture(VIDEO);
  // 隱藏原始的 HTML video 元素，我們只在畫布上繪製
  capture.hide();

  // 開始偵測臉部
  if (faceMesh) {
    faceMesh.detectStart(capture, gotFaces);
  }
}

function gotFaces(results) {
  faces = results;
}

function draw() {
  // 設定背景顏色為 e7c6ff
  background('#e7c6ff');

  // 計算影像寬高為全螢幕的 50%
  let vW = width * 0.5;
  let vH = height * 0.5;

  // 計算置中座標
  let x = (width - vW) / 2;
  let y = (height - vH) / 2;

  // 繪製影像區域
  push();
  // 將座標系移至影像右側邊界，並進行水平翻轉
  translate(x + vW, y);
  scale(-1, 1);

  // 1. 先在影像區域畫一個黑色背景，作為輪廓外的底色
  fill(0);
  noStroke();
  rect(0, 0, vW, vH);

  // 若偵測到臉部，繪製指定的點位連線
  if (faces.length > 0) {
    let face = faces[0];

    // 2. 使用 beginClip() 建立臉部輪廓遮罩
    beginClip();
    beginShape();
    // 臉部最外層輪廓的編號順序（繞臉一圈）
    let faceContour = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 377, 152, 148, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109];
    for (let i = 0; i < faceContour.length; i++) {
      let kp = face.keypoints[faceContour[i]];
      if (kp && capture.width > 0) {
        vertex(kp.x * (vW / capture.width), kp.y * (vH / capture.height));
      }
    }
    endShape(CLOSE);
    endClip();

    // 3. 在遮罩內繪製影像，這樣影像就只會顯示在臉部輪廓內
    image(capture, 0, 0, vW, vH);

    let lipIndices = [409, 270, 269, 267, 0, 37, 39, 40, 185, 61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291];
    
    stroke(255, 0, 0); // 設定線條為紅色
    strokeWeight(15);   // 設定粗細為 15
    noFill();

    beginShape();
    for (let i = 0; i < lipIndices.length; i++) {
      let index = lipIndices[i];
      let keypoint = face.keypoints[index];
      if (keypoint && capture.width > 0) {
        // 將原始影像座標等比例縮放到顯示寬高 (vW, vH)
        vertex(keypoint.x * (vW / capture.width), keypoint.y * (vH / capture.height));
      }
    }
    endShape(CLOSE); // 串接所有點並封閉路徑

    // 繪製右眼編號 246 內圈
    let ring246 = [33, 246, 161, 160, 159, 158, 157, 173, 133, 155, 154, 153, 145, 144, 163, 7];
    stroke(255, 0, 0); // 紅色
    strokeWeight(1);   // 粗細 1
    for (let i = 0; i < ring246.length; i++) {
      let p1 = face.keypoints[ring246[i]];
      let p2 = face.keypoints[ring246[(i + 1) % ring246.length]]; // 取餘數以連接回第一個點
      if (p1 && p2 && capture.width > 0) {
        let x1 = p1.x * (vW / capture.width);
        let y1 = p1.y * (vH / capture.height);
        let x2 = p2.x * (vW / capture.width);
        let y2 = p2.y * (vH / capture.height);
        line(x1, y1, x2, y2);
      }
    }

    // 繪製右眼編號 247 外圈
    let ring247 = [130, 247, 30, 29, 27, 28, 56, 190, 243, 112, 26, 22, 23, 24, 110, 25];
    for (let i = 0; i < ring247.length; i++) {
      let p1 = face.keypoints[ring247[i]];
      let p2 = face.keypoints[ring247[(i + 1) % ring247.length]];
      if (p1 && p2 && capture.width > 0) {
        let x1 = p1.x * (vW / capture.width);
        let y1 = p1.y * (vH / capture.height);
        let x2 = p2.x * (vW / capture.width);
        let y2 = p2.y * (vH / capture.height);
        line(x1, y1, x2, y2);
      }
    }
  }
  pop();
}

// 當視窗大小改變時，重新調整畫布大小
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
