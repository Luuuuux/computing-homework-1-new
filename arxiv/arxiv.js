async function loadPapers() {
    try {
      const response = await fetch('./data.json');
      const papers = await response.json();
  
      const container = document.getElementById('papers');
      container.innerHTML = '';
  
      papers.forEach(paper => {
        const div = document.createElement('div');
        div.className = 'paper';
  
        div.innerHTML = `
          <h3>${paper.title}</h3>
          <p><strong>Authors:</strong> ${paper.authors.join(', ')}</p>
          <p>${paper.abstract}</p>
          <p>
            <a href="${paper.pdf_url}" target="_blank">Download PDF</a>
          </p>
          <hr>
        `;
  
        container.appendChild(div);
      });
  
    } catch (error) {
      console.error('Error loading papers:', error);
    }
  }
  
  loadPapers();
  