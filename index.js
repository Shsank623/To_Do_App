import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
  query,
  orderBy,
  deleteDoc,
  doc,
  updateDoc
} from "firebase/firestore";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBhWEI7l-iCE1w_wueREUARYhpY_JDMnv8",
  authDomain: "todoapp-61df0.firebaseapp.com",
  projectId: "todoapp-61df0",
  storageBucket: "todoapp-61df0.firebasestorage.app",
  messagingSenderId: "283871915278",
  appId: "1:283871915278:web:ffcd81e7ea80ccbcd8bb5f"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

window.onload = () => {
  const taskInput = document.getElementById("taskInput");
  const addTaskBtn = document.getElementById("addTaskBtn");
  const clearTasksBtn = document.getElementById("clearTasksBtn");
  const taskList = document.getElementById("taskList");
  const alertBox = document.getElementById("alert");
  const taskCount = document.getElementById("taskCount");

  function showAlert(msg) {
    alertBox.textContent = msg;
    alertBox.classList.add("show");
    setTimeout(() => alertBox.classList.remove("show"), 2000);
  }

  async function loadTasks() {
    taskList.innerHTML = "";
    const q = query(collection(db, "tasks"), orderBy("timestamp"));
    const querySnapshot = await getDocs(q);
    let count = 0;
    querySnapshot.forEach(docSnap => {
      count++;
      const li = document.createElement("li");

      // Checkbox for completion
      const check = document.createElement("input");
      check.type = "checkbox";
      check.className = "task-checkbox";
      check.checked = docSnap.data().done || false;
      if(check.checked) li.classList.add("done");

      check.onclick = async () => {
        await updateDoc(doc(db, "tasks", docSnap.id), {done: check.checked});
        li.classList.toggle("done", check.checked);
        showAlert(check.checked ? "Task marked as done!" : "Marked as undone.");
      };

      // Help tooltip
      const help = document.createElement("span");
      help.className = "help fa fa-question-circle";
      help.title = "Check to complete, bin to delete.";

      // Task Text
      const span = document.createElement("span");
      span.textContent = docSnap.data().task;

      // Delete icon
      const del = document.createElement("i");
      del.className = "fa-solid fa-trash delete";
      del.title = "Delete Task";
      del.onclick = async () => {
        await deleteDoc(doc(db, "tasks", docSnap.id));
        showAlert("Task deleted!");
        loadTasks();
      };

      li.appendChild(check);
      li.appendChild(span);
      li.appendChild(help);
      li.appendChild(del);

      taskList.appendChild(li);
    });
    taskCount.textContent = count === 0 ? "No tasks yet" : ("Tasks left: " + count);
  }

  addTaskBtn.onclick = async () => {
    const task = taskInput.value.trim();
    if (task) {
      await addDoc(collection(db, "tasks"), {
        task: task,
        timestamp: serverTimestamp(),
        done: false
      });
      taskInput.value = "";
      showAlert("Task added!");
      await loadTasks();
    }
  };

  clearTasksBtn.onclick = async () => {
    const q = query(collection(db, "tasks"));
    const querySnapshot = await getDocs(q);
    for (const docSnap of querySnapshot.docs) {
      await deleteDoc(doc(db, "tasks", docSnap.id));
    }
    showAlert("All tasks cleared!");
    await loadTasks();
  };

  loadTasks();
};
