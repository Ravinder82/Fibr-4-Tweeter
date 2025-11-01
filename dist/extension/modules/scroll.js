(function() {
  const Scroll = {
    initializeHorizontalScroll: function() {
      const scrollContainer = document.querySelector('.scroll-container');
      const leftArrow = document.getElementById('scroll-left');
      const rightArrow = document.getElementById('scroll-right');
      if (!scrollContainer || !leftArrow || !rightArrow) return;
      const scrollAmount = 200;
      leftArrow.addEventListener('click', () => {
        scrollContainer.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      });
      rightArrow.addEventListener('click', () => {
        scrollContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      });
      const updateArrowStates = () => {
        const maxScrollLeft = scrollContainer.scrollWidth - scrollContainer.clientWidth;
        leftArrow.disabled = scrollContainer.scrollLeft <= 0;
        rightArrow.disabled = scrollContainer.scrollLeft >= maxScrollLeft;
      };
      scrollContainer.addEventListener('scroll', updateArrowStates);
      updateArrowStates();
      scrollContainer.addEventListener('wheel', (e) => {
        if (e.deltaY !== 0) {
          e.preventDefault();
          scrollContainer.scrollLeft += e.deltaY;
          updateArrowStates();
        }
      });
      let isDown = false;
      let startX;
      let scrollLeft;
      scrollContainer.addEventListener('mousedown', (e) => {
        isDown = true;
        startX = e.pageX - scrollContainer.offsetLeft;
        scrollLeft = scrollContainer.scrollLeft;
        scrollContainer.style.cursor = 'grabbing';
      });
      scrollContainer.addEventListener('mouseleave', () => {
        isDown = false;
        scrollContainer.style.cursor = 'grab';
      });
      scrollContainer.addEventListener('mouseup', () => {
        isDown = false;
        scrollContainer.style.cursor = 'grab';
        updateArrowStates();
      });
      scrollContainer.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - scrollContainer.offsetLeft;
        const walk = (x - startX) * 1.5;
        scrollContainer.scrollLeft = scrollLeft - walk;
      });
      scrollContainer.style.cursor = 'grab';
    }
  };
  window.TabTalkScroll = Scroll;
  window.FibrScroll = Scroll; // Fibr alias
})();
