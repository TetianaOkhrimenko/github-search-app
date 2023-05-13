"use strict";

// DOM variables
const container = document.querySelector(".searchContainer");
const searchUserInput = document.querySelector(".searchUser");
const profile = document.querySelector(".profile");
const search = document.querySelector(".search");

const clientId = "c83e6f7ce560d1ac523f";
const clientSecret = "244d56855fe9972fd0f4ad4fdffb0994fca3b25e";
const authorization = `Basic ${btoa(clientId + ":" + clientSecret)}`;

//let displayInfo = (info) =>
//  info !== null ? info : "User didn't write this info";

class API {
  async getUser(userName) {
    const response = await fetch(`https://api.github.com/users/${userName}`, {
      method: "GET",
      headers: {
        Authorization: authorization,
      },
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message);
    }
    console.log(data);
    return data;
  }

  async getUserRepo(userName) {
    const responseRepo = await fetch(
      `https://api.github.com/users/${userName}/repos?per_page=5&sort=updated`,
      {
        method: "GET",
        headers: {
          Authorization: authorization,
        },
      }
    );
    const dataRepo = await responseRepo.json();

    if (!responseRepo.ok) {
      throw new Error(data.message);
    }

    console.log(dataRepo);
    return dataRepo;
  }
}

class UI {
  displayInfo(info) {
    return info !== null ? info : "User didn't type this info";
  }

  displayDate(date) {
    const month =
      new Date(date).getMonth() < 10
        ? `0${new Date(date).getMonth() + 1}`
        : new Date(date).getMonth() + 1;

    const data =
      new Date(date).getDate() < 10
        ? `0${new Date(date).getDate()}`
        : new Date(date).getDate();

    return `${new Date(date).getFullYear()}-${month}-${data}`;
  }

  showProfile(user, userRepo) {
    profile.innerHTML = `
    <div class="card card-body mb-3">
        <div class="row">
          <div class="col-md-3">
            <img class="img-fluid mb-2" src="${user.avatar_url}">
            <a href="${
              user.html_url
            }" target="_blank" class="btn btn-info d-md-block mb-4 text-light">View Profile</a>
          </div>
          <div class="col-md-9">
            <span class="badge bg-primary p-2">Public Repos: ${
              user.public_repos
            }</span>
            <span class="badge bg-secondary p-2">Public Gists: ${
              user.public_gists
            }</span>
            <span class="badge bg-success p-2">Followers: ${
              user.followers
            }</span>
            <span class="badge bg-info p-2">Following: ${user.following}</span>
            <br><br>
            <ul class="list-group">
              <li class="list-group-item">Company: ${this.displayInfo(
                user.company
              )}</li>
              <li class="list-group-item">Website/Blog: ${this.displayInfo(
                user.blog
              )}</li>
              <li class="list-group-item">Location: ${this.displayInfo(
                user.location
              )}</li>
              <li class="list-group-item">Member Since: ${this.displayDate(
                user.created_at
              )}</li>
            </ul>
          </div>
        </div>
      </div>
      <h3 class="page-heading mb-3">Latest Repos</h3>
      <div class="repos container">
      <div class="row mb-2 border p-4 rounded bg-info text-light">
      <div class="col-md-2">Name</div>
      <div class="col-md-4">URL</div>
      <div class="col-md-2">Created date</div>
      <div class="col-md-2">Updated date</div>
      <div class="col-md-2">Main language</div>
      </div>
      
      
             
    `;

    const repos = document.querySelector(".repos");

    userRepo.map((repo) => {
      let div = document.createElement("div");
      repos.append(div);
      div.innerHTML = `
      <div class="row mb-2 p-3 border border border-1 rounded">
      <div class="col-md-2 ps-3">${repo.name}</div>
      <div class="col-md-4 ps-3">${repo.html_url}</div>
      <div class="col-md-2 ps-3">${this.displayDate(repo.created_at)}</div>
      <div class="col-md-2 ps-3">${this.displayDate(repo.pushed_at)}</div>
      <div class="col-md-2 ps-3">${
        repo.language !== null ? repo.language : "Uknown"
      }</div>
      </div>
   `;
    });
  }

  clearProfile() {
    profile.innerHTML = "";
  }

  showAlert(message, type, timeout = 3000) {
    this.clearAlert();

    const div = document.createElement("div");
    div.className = `alert ${type}`;
    div.appendChild(document.createTextNode(message));

    container.insertBefore(div, search);

    setTimeout(() => {
      this.clearAlert();
    }, timeout);
  }

  clearAlert() {
    const alertBlock = document.querySelector(".alert");
    if (alertBlock) {
      alertBlock.remove();
    }
  }
}

const handleInput = async (event) => {
  const ui = new UI();
  const userText = event.target.value.trim();

  if (!userText) {
    ui.clearProfile();
    return;
  }

  try {
    const api = new API();
    const user = await api.getUser(userText);
    const userRepo = await api.getUserRepo(userText);
    ui.clearAlert();

    // fetch(`https://api.github.com/users/${userText}/repos?per_page=5`, {
    //   method: "GET",
    //   headers: {
    //     Authorization: `Basic ${btoa(this.clientId + ":" + this.clientSecret)}`,
    //   },
    // });

    ui.showProfile(user, userRepo);
  } catch (error) {
    ui.showAlert(error.message, "alert-danger");
    ui.clearProfile();
  }
};

const debounce = (func, delay) => {
  let timerId;

  return (...args) => {
    clearTimeout(timerId);

    timerId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
};

// Event listeners
searchUserInput.addEventListener("input", debounce(handleInput, 1000));
