function openNav() {
  document.getElementById("sidebar").style.width = "250px";
  document.getElementById("sidebar").style.display = "block";
}

function closeNav() {
  document.getElementById("sidebar").style.width = "0";
}

document.getElementById("usuarioIcon").onclick = function () {
  openNav();
};

var modal = document.getElementById("myModal");
var btn = document.getElementById("dudasIcon");
var span = document.getElementById("closeModal");

btn.onclick = function () {
  modal.style.display = "block";
};

span.onclick = function () {
  modal.style.display = "none";
};

window.addEventListener("click", function (event) {
  if (event.target == document.getElementById("myModal")) {
    document.getElementById("myModal").style.display = "none";
  }
});

window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};
