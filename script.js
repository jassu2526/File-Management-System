const users = [{ username: "admin", password: "1234", otp: "9999" }];
let currentUser = null;
let uploadedFiles = [];  // Store the uploaded files

function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  if (!username || !password) {
    alert("Please fill in both username and password.");
    return;
  }

  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    currentUser = user;
    document.getElementById("auth-section").style.display = "none";
    document.getElementById("otp-section").style.display = "block";
  } else {
    alert("Invalid credentials");
  }
}

function verifyOtp() {
  const enteredOtp = document.getElementById("otp").value;
  if (enteredOtp === currentUser.otp) {
    document.getElementById("otp-section").style.display = "none";
    document.getElementById("main-section").style.display = "block";
  } else {
    alert("Incorrect OTP");
  }
}

function uploadFiles() {
  const files = Array.from(document.getElementById("file-input").files);
  const schedulerType = document.getElementById("scheduler").value;

  if (files.length === 0) {
    alert("Please select files.");
    return;
  }

  let scheduledFiles = scheduleFiles(files, schedulerType);
  
  // Store uploaded files
  uploadedFiles = [...uploadedFiles, ...scheduledFiles];

  const list = document.getElementById("file-list");
  list.innerHTML = "";

  scheduledFiles.forEach((file, i) => {
    setTimeout(() => {
      const div = document.createElement("div");
      div.className = "file-item";
      div.innerHTML = `
        <span>${file.name} | Size: ${(file.size / 1024).toFixed(2)} KB</span>
        <button onclick="deleteFile(this)">Delete</button>
        <button onclick="downloadFile('${file.name}')">Download</button>
        <button onclick="openFile('${file.name}')">Open</button>
      `;
      list.appendChild(div);
    }, i * 1000); // simulate delay
  });
}

function scheduleFiles(files, type) {
  switch (type) {
    case "fcfs":
      return files;
    case "sjf":
      return files.sort((a, b) => a.size - b.size);
    case "priority":
      return files.sort((a, b) => getPriority(b) - getPriority(a));
    case "rr":
      return roundRobinSchedule(files);
    default:
      return files;
  }
}

function getPriority(file) {
  const sizeKB = file.size / 1024;
  if (sizeKB < 100) return 3;
  if (sizeKB < 500) return 2;
  return 1;
}

function roundRobinSchedule(files) {
  const quantum = 1024 * 200; // 200KB
  const queue = [];
  const remaining = files.map(file => ({ file, remaining: file.size }));

  while (remaining.some(item => item.remaining > 0)) {
    for (let item of remaining) {
      if (item.remaining > 0) {
        queue.push(item.file);
        item.remaining -= quantum;
      }
    }
  }

  return queue;
}

// Function to delete files
function deleteFile(button) {
  const fileItem = button.parentElement;
  fileItem.remove();
  const fileName = fileItem.querySelector("span").innerText.split(' | ')[0];
  uploadedFiles = uploadedFiles.filter(file => file.name !== fileName);  // Remove file from array
}

// Function to download the file
function downloadFile(fileName) {
  const file = uploadedFiles.find(f => f.name === fileName);
  if (file) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(file);
    a.download = file.name;
    a.click();
  }
}

// Function to open the file
function openFile(fileName) {
  const file = uploadedFiles.find(f => f.name === fileName);
  if (file) {
    const url = URL.createObjectURL(file);
    window.open(url, '_blank');
  }
}

// Dark Mode Toggle
function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
  document.querySelector(".container").classList.toggle("dark-mode");
  document.querySelector("h1").classList.toggle("dark-mode");
  document.querySelectorAll("h2, h3").forEach(el => el.classList.toggle("dark-mode"));
}
