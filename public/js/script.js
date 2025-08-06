const hackerText = document.getElementById("hackerText");
const original = "REST APIS  ( 安吉拉和山姆 ）";

const chars = "!@#$%^&*()_+-=[]{}|;:,.<>?/~";

function hackerEffect(el, text, delay = 60) {
    let currentIndex = 0;

    function revealNextLetter() {
        if (currentIndex >= text.length) return;

        let iterations = 0;
        const maxIterations = 10;

        const scrambleInterval = setInterval(() => {
            const scrambled = text
                .split("")
                .map((char, index) => {
                    if (index < currentIndex) return char;
                    if (index === currentIndex) {
                        return chars[Math.floor(Math.random() * chars.length)];
                    }
                    return "";
                })
                .join("");

            el.innerText = scrambled;

            iterations++;
            if (iterations >= maxIterations) {
                currentIndex++;
                el.innerText = text.slice(0, currentIndex);
                clearInterval(scrambleInterval);
                setTimeout(revealNextLetter, delay); 
            }
        }, 30);
    }

    revealNextLetter();
}

window.onload = () => {
    hackerEffect(hackerText, original);
};
  const text = `Welcome to this Simple Api
  Here you can find variety
  APIs available to you bot
  Youtube, Spotify, Deezer`;

const target = document.getElementById("typing-text");
let i = 0;
const speed = 80;

const cursor = document.createElement("span");
cursor.classList.add("cursor");
target.appendChild(cursor);

function typeChar() {
  if (i < text.length) {
    const char = document.createTextNode(text.charAt(i));
    target.insertBefore(char, cursor);
    i++;
    setTimeout(typeChar, speed);
  }
}

typeChar();

function startLoading() {
  const bar = document.getElementById('top-loader');
  bar.style.width = '0%';
  bar.style.display = 'block';
  setTimeout(() => bar.style.width = '80%', 100);
}

function finishLoading() {
  const bar = document.getElementById('top-loader');
  bar.style.width = '100%';
  setTimeout(() => {
    bar.style.display = 'none';
    bar.style.width = '0%';
  }, 500);
}
