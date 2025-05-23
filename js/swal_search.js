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
                      const stars = '⭐'.repeat(Math.min(item.relevance || 0, 10));

                      html += `<li style="margin-bottom:15px;">
                          <a href="${item.url}" target="_blank" style="font-weight:bold;">${item.title}</a><br/>
                          <small><strong>Published:</strong> ${item.published_date || 'Unknown'}<br/>
                          <strong>Relevance:</strong> ${stars} (${item.relevance || 0}/10)<br/>
                          ${item.description || ''}</small>
                        </li>`;
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
