  document.addEventListener("DOMContentLoaded", function() {
    // Select all elements with class "skill-percent"
    var skillBars = document.querySelectorAll(".skill-percent");
    // Add the "animate-bar" class to each element
    skillBars.forEach(function(skillBar) {
      skillBar.classList.add("animate-bar");
    });
  });
  