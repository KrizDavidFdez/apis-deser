   window.onload = function() {
            document.getElementById('shareCount').textContent = 17662;
            let visitCount = localStorage.getItem('visits') ? parseInt(localStorage.getItem('visits')) : 476552;
            visitCount++; 
            localStorage.setItem('visits', visitCount);
            document.getElementById('visitCount').textContent = visitCount; 
            const totalInteractions = 17662 + visitCount; 
            document.getElementById('totalCount').textContent = totalInteractions;
            animateText();
        }
        const dropdownHeaders = document.querySelectorAll('.dropdown-header')
        dropdownHeaders.forEach(header => {
            header.addEventListener('click', function() {
                const currentContent = this.nextElementSibling;
                const isOpen = currentContent.style.display === 'block';
                dropdownHeaders.forEach(otherHeader => {
                    const otherContent = otherHeader.nextElementSibling;
                    if (otherContent !== currentContent) {
                        otherContent.style.display = 'none'; 
                        otherHeader.classList.remove('open');
                    }
                });
                if (isOpen) {
                    currentContent.style.display = 'none'; 
                    this.classList.remove('open');
                } else {
                    currentContent.style.display = 'block';
                    this.classList.add('open');
                }
            });
        });

        function animateText() {
            typeWriter("Starlights Apis", 5, () => {
                setTimeout(() => {
                    eraseText(() => {
                        setTimeout(() => {
                            typeWriter("Apis Simples xD", 4, () => {
                                setTimeout(() => {
                                    eraseText(() => {
                                        setTimeout(() => {
                                            typeWriter("Starlights Apis", 5);
                                        }, 1000); 
                                    });
                                }, 2000); 
                            });
                        }, 1000); 
                    });
                }, 1000); 
            });
        }

        function typeWriter(text, duration, callback) {
            const textElement = document.getElementById('dynamicText');
            let index = 0;
            const interval = (duration * 1000) / (text.length * 3); 
            textElement.textContent = ""; 
            const writeInterval = setInterval(() => {
                if (index < text.length) {
                    textElement.textContent += text.charAt(index); 
                    index++;
                } else {
                    clearInterval(writeInterval); 
                    if (callback) callback();
                }
            }, interval);
        }

        function eraseText(callback) {
            const textElement = document.getElementById('dynamicText');
            let index = textElement.textContent.length;
            const interval = 50; 
            const eraseInterval = setInterval(() => {
                if (index > 0) {
                    textElement.textContent = textElement.textContent.slice(0, index - 1);
                    index--;
                } else {
                    clearInterval(eraseInterval); 
                    if (callback) callback();
                }
            }, interval);
        }
    