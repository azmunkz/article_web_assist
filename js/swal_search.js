(function ($, Drupal) {
  Drupal.behaviors.openaiWebSearchSwal = {
    attach: function (context, settings) {
      once('swal-search', '#search-related-news-btn', context).forEach(function (button) {
        button.addEventListener('click', function () {
          const titleInput = document.querySelector('#edit-title-0-value');
          const query = titleInput ? titleInput.value : '';
          if (!query) {
            Swal.fire('Oops!', 'Please enter a title first.', 'warning');
            return;
          }

          // Step 1: Ask user for number of results
          Swal.fire({
            title: 'How many articles?',
            html: `
              <label for="result-count">Select number of results:</label><br/>
              <select id="result-count" class="swal2-input" style="width: 80%;">
                <option value="3" selected>3</option>
                <option value="5">5</option>
                <option value="7">7</option>
                <option value="10">10</option>
              </select>
            `,
            showCancelButton: true,
            confirmButtonText: 'Search',
            preConfirm: () => {
              return document.getElementById('result-count').value;
            }
          }).then((result) => {
            if (!result.isConfirmed) return;

            const limit = result.value;

            Swal.fire({
              title: 'Searching...',
              html: 'Fetching related articles...',
              allowOutsideClick: false,
              didOpen: () => {
                Swal.showLoading();

                fetch(`/openai-web-search/run?query=${encodeURIComponent(query)}&limit=${limit}`)
                  .then(res => res.json())
                  .then(data => {
                    let html = '<div style="text-align:left; max-height:60vh; overflow-y:auto;"><ol>';
                    data.results.forEach(item => {
                      html += `<li style="margin-bottom: 1rem; color: #e6017d;">`;

                      // Title
                      if (item.url && item.url !== '#') {
                        html += `<a style="color: #e6017d; display: inline-block; margin-bottom: 0.75rem; text-decoration: none;" href="${item.url}" target="_blank" rel="noopener">${item.title}</a>`;
                      } else {
                        html += `<span class="display: block; margin-bottom: .75rem;">${item.title}</span>`;
                      }

                      // Meta info
                      const source = item.source ?? 'Unknown source';
                      const date = item.published_date ?? '';
                      const relevance = item.relevance ? `${item.relevance * 10}%` : '';

                      html += `<small style="display: flex; margin-bottom: .5rem; font-size: .75rem; color: #101010;"><strong style="display: inline-block; margin-right: .35rem;">Source:</strong> ${source}`;
                      if (date) html += ` &nbsp;|&nbsp; <strong style="display: inline-block; margin-right: .35rem;">Date:</strong> ${date}`;
                      if (relevance) html += ` &nbsp;|&nbsp; <strong style="display: inline-block; margin-right: .35rem;">Relevance:</strong> ${relevance}`;
                      html += `</small>`;

                      // Description
                      if (item.description) {
                        html += `<small style="font-size: 1rem; color: #101010;">${item.description}</small>`;
                      }

                      html += `</li>`;
                    });
                    html += '</ol></div>';

                    Swal.fire({
                      title: 'Related Articles',
                      html: html,
                      width: '50%',
                      showCloseButton: true,
                      scrollbarPadding: false,
                    });
                  })
                  .catch(() => {
                    Swal.fire('Error', 'Something went wrong. Please try again.', 'error');
                  });
              }
            });
          });
        });
      });
    }
  };
})(jQuery, Drupal);
