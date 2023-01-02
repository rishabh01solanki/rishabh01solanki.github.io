const text = "Rishabh Solanki";

function typeText(text) {
    let index = 0;
    function type() {
      if (index < text.length) {
        document.getElementById("Rishabh-Solanki").textContent += text[index];
        index++;
        setTimeout(type, 60); // delay 100 milliseconds
      }
    }
    type();
  }
  
typeText(text);
